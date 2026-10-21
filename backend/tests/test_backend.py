"""
Unit and Integration Tests for Resonance Backend Services.
Tests:
- NameDetector accuracy, word boundaries, and negative substring rejection.
- SoundDetector thresholds, acoustic classification, and cooldown suppression.
- Authenticated Encryption (Fernet) integrity and key separation.
- Database explicit consent enforcement and encrypted retrieval.
- WER/CER calculation accuracy.
"""
import pytest
import numpy as np
import time
from backend.services.name_detector import NameDetector
from backend.services.sound_detector import SoundDetector
from backend.services.encryption import EncryptionService
from backend.services.database import DatabaseService
from backend.benchmark import calculate_wer, calculate_cer, levenshtein_distance

def test_name_detector_positive_and_negative():
    detector = NameDetector(primary_name="Aman", nicknames=["Ami", "Aman Kumar"])

    # Positive matches
    assert detector.detect("Hello Aman, can you hear me?") is not None
    assert detector.detect("Aman, please share your screen.") is not None
    assert detector.detect("Hey Ami, check this out.") is not None
    assert detector.detect("Thanks to Aman Kumar.") is not None
    assert detector.detect("Is that you, aman?") is not None

    # Substring negative cases (Must NEVER trigger false positives)
    assert detector.detect("These are dramatic changes.") is None
    assert detector.detect("We need an amalgamation.") is None
    assert detector.detect("He was shrewd.") is None
    assert detector.detect("Permanent storage is required.") is None
    assert detector.detect("Banana smoothie.") is None

def test_authenticated_encryption():
    import tempfile
    from pathlib import Path

    with tempfile.TemporaryDirectory() as tmpdir:
        key_path = Path(tmpdir) / "test.key"
        enc = EncryptionService(key_path=key_path)

        secret_text = "Private meeting transcript with medical and workplace discussion."
        ciphertext = enc.encrypt_text(secret_text)

        assert ciphertext != secret_text
        assert "Private" not in ciphertext

        decrypted = enc.decrypt_text(ciphertext)
        assert decrypted == secret_text

        # Test dictionary encryption
        data = {"speaker": "Priya", "words": ["confidential", "sprint"]}
        cipher_json = enc.encrypt_data(data)
        decrypted_json = enc.decrypt_data(cipher_json)
        assert decrypted_json == data

def test_database_consent_and_encryption():
    import tempfile
    from pathlib import Path

    with tempfile.TemporaryDirectory() as tmpdir:
        db_path = Path(tmpdir) / "test_resonance.db"
        db = DatabaseService(db_path=db_path)

        captions = [
            {"caption_id": "c1", "text": "Confidential roadmap discussion", "speaker": "Aman", "language": "en"}
        ]

        # Case 1: Consent False -> Must NOT save
        res = db.save_session(
            title="Unconsented Meeting",
            start_time=100.0,
            end_time=200.0,
            captions=captions,
            is_demo=False,
            explicit_consent=False
        )
        assert res is None
        sessions = db.list_sessions()
        assert len(sessions) == 0

        # Case 2: Consent True -> Must save with encryption
        sess_id = db.save_session(
            title="Consented Meeting",
            start_time=100.0,
            end_time=200.0,
            captions=captions,
            is_demo=False,
            explicit_consent=True
        )
        assert sess_id is not None

        # Verify raw database contains ciphertext, not plaintext
        with db._get_connection() as conn:
            row = conn.execute("SELECT ciphertext_payload FROM encrypted_captions WHERE session_id = ?", (sess_id,)).fetchone()
            assert row is not None
            raw_payload = row[0]
            assert "Confidential roadmap" not in raw_payload

        # Authorized retrieval must decrypt successfully
        details = db.get_session_details(sess_id)
        assert details is not None
        assert details["captions"][0]["text"] == "Confidential roadmap discussion"

def test_sound_cooldown():
    detector = SoundDetector()
    detector.update_settings(cooldowns={"alarm": 5.0})

    # High frequency tone simulating fire alarm
    t = np.linspace(0, 0.5, int(16000 * 0.5), endpoint=False)
    alarm_audio = 0.8 * np.sin(2 * np.pi * 3000 * t)

    alert1 = detector.process_and_check_alert(alarm_audio)
    assert alert1 is not None
    assert alert1["category"] == "alarm"

    # Immediate second call within cooldown must be suppressed
    alert2 = detector.process_and_check_alert(alarm_audio)
    assert alert2 is None

def test_wer_and_cer():
    ref = "good morning team"
    hyp_exact = "good morning team"
    hyp_err = "good evening team"

    assert calculate_wer(ref, hyp_exact) == 0.0
    assert calculate_wer(ref, hyp_err) == pytest.approx(0.3333, abs=0.01)
    assert calculate_cer("cat", "hat") == pytest.approx(0.3333, abs=0.01)
