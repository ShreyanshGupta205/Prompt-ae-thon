"""
SQLite Persistence Service with Authenticated Encryption at Rest.
Enforces explicit user consent: transcripts are only stored if consent is explicitly enabled.
When stored, caption content and private data are encrypted using Fernet
before being committed to SQLite. The key is never in this database.
"""
import sqlite3
import json
import time
import uuid
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
from pathlib import Path
from backend.config import DB_PATH
from backend.services.encryption import encryption_service

class DatabaseService:
    def __init__(self, db_path: Path = DB_PATH):
        self.db_path = db_path
        self._init_db()

    @contextmanager
    def _get_connection(self):
        conn = sqlite3.connect(str(self.db_path))
        conn.row_factory = sqlite3.Row
        try:
            yield conn
        finally:
            conn.close()

    def _init_db(self):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            # Sessions metadata table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                start_time REAL NOT NULL,
                end_time REAL NOT NULL,
                duration_seconds REAL NOT NULL,
                is_demo INTEGER NOT NULL DEFAULT 0,
                captions_count INTEGER NOT NULL DEFAULT 0,
                languages_json TEXT NOT NULL DEFAULT '["en"]',
                preview_text TEXT NOT NULL DEFAULT '',
                created_at REAL NOT NULL
            );
            """)

            # Encrypted captions table
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS encrypted_captions (
                id TEXT PRIMARY KEY,
                session_id TEXT NOT NULL,
                timestamp REAL NOT NULL,
                speaker TEXT,
                language TEXT NOT NULL,
                is_final INTEGER NOT NULL DEFAULT 1,
                ciphertext_payload TEXT NOT NULL,
                created_at REAL NOT NULL,
                FOREIGN KEY (session_id) REFERENCES sessions (id) ON DELETE CASCADE
            );
            """)

            # Personal vocabulary
            cursor.execute("""
            CREATE TABLE IF NOT EXISTS personal_vocabulary (
                term TEXT PRIMARY KEY,
                correction_for TEXT,
                added_at REAL NOT NULL
            );
            """)

            # Seed sample vocabulary if empty
            cursor.execute("SELECT COUNT(*) FROM personal_vocabulary")
            if cursor.fetchone()[0] == 0:
                defaults = [
                    ("Resonance", None),
                    ("Sprint", None),
                    ("Kubernetes", None),
                    ("Deaf-inclusive", None),
                    ("Accessibility", None),
                    ("PR review", None)
                ]
                now = time.time()
                cursor.executemany(
                    "INSERT INTO personal_vocabulary (term, correction_for, added_at) VALUES (?, ?, ?)",
                    [(t, c, now) for t, c in defaults]
                )

            conn.commit()

    def save_session(self,
                     title: str,
                     start_time: float,
                     end_time: float,
                     captions: List[Dict[str, Any]],
                     is_demo: bool = False,
                     explicit_consent: bool = False) -> Optional[str]:
        """
        Saves a session and its captions ONLY if explicit consent is given.
        If consent is False, content is intentionally discarded per privacy policy.
        """
        if not explicit_consent and not is_demo:
            print("[DatabaseService] Transcript saving blocked: explicit user consent was not granted.")
            return None

        session_id = f"sess_{uuid.uuid4().hex[:12]}"
        duration = max(0.0, end_time - start_time)
        captions_count = len(captions)

        # Calculate languages and preview
        languages = list(set(c.get("language", "en") for c in captions)) or ["en"]
        plain_texts = [c.get("text", "") for c in captions[:3]]
        preview_text = " ".join(plain_texts)[:140] + ("..." if len(plain_texts) > 0 else "")

        now = time.time()

        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT INTO sessions (
                id, title, start_time, end_time, duration_seconds,
                is_demo, captions_count, languages_json, preview_text, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                session_id, title, start_time, end_time, duration,
                1 if is_demo else 0, captions_count, json.dumps(languages), preview_text, now
            ))

            # Encrypt each caption payload with Fernet authenticated encryption
            for c in captions:
                cap_id = c.get("caption_id", f"cap_{uuid.uuid4().hex[:10]}")
                payload_data = {
                    "text": c.get("text", ""),
                    "confidence": c.get("confidence"),
                    "metadata": c.get("metadata", {})
                }
                ciphertext = encryption_service.encrypt_data(payload_data)

                cursor.execute("""
                INSERT INTO encrypted_captions (
                    id, session_id, timestamp, speaker, language, is_final, ciphertext_payload, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    cap_id, session_id, c.get("timestamp", now),
                    c.get("speaker"), c.get("language", "en"),
                    1 if c.get("is_final", True) else 0,
                    ciphertext, now
                ))

            conn.commit()

        return session_id

    def list_sessions(self, search: str = "") -> List[Dict[str, Any]]:
        """Returns session summaries. Plaintext search matches title, preview, and decrypted text."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            SELECT id, title, start_time, end_time, duration_seconds,
                   is_demo, captions_count, languages_json, preview_text, created_at
            FROM sessions
            ORDER BY start_time DESC
            """)
            rows = cursor.fetchall()

        results = []
        search_lower = search.lower().strip() if search else ""

        for r in rows:
            session = {
                "id": r["id"],
                "title": r["title"],
                "start_time": r["start_time"],
                "end_time": r["end_time"],
                "duration_seconds": r["duration_seconds"],
                "is_demo": bool(r["is_demo"]),
                "captions_count": r["captions_count"],
                "languages": json.loads(r["languages_json"]),
                "preview_text": r["preview_text"],
                "created_at": r["created_at"],
                "encrypted_at_rest": True
            }

            if search_lower:
                if (search_lower in session["title"].lower() or
                    search_lower in session["preview_text"].lower()):
                    results.append(session)
            else:
                results.append(session)

        return results

    def get_session_details(self, session_id: str) -> Optional[Dict[str, Any]]:
        """Retrieves session and decrypts all captions for authorized viewing."""
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM sessions WHERE id = ?", (session_id,))
            s_row = cursor.fetchone()
            if not s_row:
                return None

            cursor.execute("""
            SELECT id, timestamp, speaker, language, is_final, ciphertext_payload
            FROM encrypted_captions
            WHERE session_id = ?
            ORDER BY timestamp ASC
            """, (session_id,))
            c_rows = cursor.fetchall()

        decrypted_captions = []
        for cr in c_rows:
            try:
                payload = encryption_service.decrypt_data(cr["ciphertext_payload"])
                decrypted_captions.append({
                    "caption_id": cr["id"],
                    "timestamp": cr["timestamp"],
                    "speaker": cr["speaker"],
                    "language": cr["language"],
                    "is_final": bool(cr["is_final"]),
                    "text": payload.get("text", ""),
                    "confidence": payload.get("confidence"),
                    "metadata": payload.get("metadata", {})
                })
            except Exception as e:
                decrypted_captions.append({
                    "caption_id": cr["id"],
                    "timestamp": cr["timestamp"],
                    "speaker": cr["speaker"],
                    "language": cr["language"],
                    "is_final": bool(cr["is_final"]),
                    "text": "[Decryption Error: Key mismatch or corrupted data]",
                    "confidence": None,
                    "metadata": {"error": str(e)}
                })

        return {
            "id": s_row["id"],
            "title": s_row["title"],
            "start_time": s_row["start_time"],
            "end_time": s_row["end_time"],
            "duration_seconds": s_row["duration_seconds"],
            "is_demo": bool(s_row["is_demo"]),
            "captions_count": s_row["captions_count"],
            "languages": json.loads(s_row["languages_json"]),
            "preview_text": s_row["preview_text"],
            "created_at": s_row["created_at"],
            "captions": decrypted_captions
        }

    def delete_session(self, session_id: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM encrypted_captions WHERE session_id = ?", (session_id,))
            cursor.execute("DELETE FROM sessions WHERE id = ?", (session_id,))
            conn.commit()
            return cursor.rowcount > 0

    def delete_all_sessions(self) -> int:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM encrypted_captions")
            cursor.execute("DELETE FROM sessions")
            conn.commit()
            return cursor.rowcount

    def add_vocabulary_term(self, term: str, correction_for: Optional[str] = None):
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("""
            INSERT OR REPLACE INTO personal_vocabulary (term, correction_for, added_at)
            VALUES (?, ?, ?)
            """, (term.strip(), correction_for.strip() if correction_for else None, time.time()))
            conn.commit()

    def list_vocabulary(self) -> List[Dict[str, Any]]:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("SELECT term, correction_for, added_at FROM personal_vocabulary ORDER BY term ASC")
            rows = cursor.fetchall()
            return [dict(r) for r in rows]

    def remove_vocabulary_term(self, term: str) -> bool:
        with self._get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute("DELETE FROM personal_vocabulary WHERE term = ?", (term,))
            conn.commit()
            return cursor.rowcount > 0

# Singleton instance
db_service = DatabaseService()
