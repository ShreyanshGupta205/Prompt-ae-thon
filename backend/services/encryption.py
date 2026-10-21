"""
Authenticated Encryption Service for Resonance.
Uses Fernet (AES-128-CBC + HMAC-SHA256 authenticated encryption).
The encryption key is loaded from an external key file or RESONANCE_ENCRYPTION_KEY environment variable.
The key is strictly isolated and NEVER saved in the database.
"""
import os
import json
from typing import Any, Dict, Optional
from cryptography.fernet import Fernet, InvalidToken
from backend.config import KEY_FILE_PATH

class EncryptionService:
    def __init__(self, key_path=KEY_FILE_PATH):
        self.key_path = key_path
        self._cipher = None
        self._init_cipher()

    def _init_cipher(self):
        # Check environment variable first
        env_key = os.environ.get("RESONANCE_ENCRYPTION_KEY")
        if env_key:
            self._cipher = Fernet(env_key.encode() if isinstance(env_key, str) else env_key)
            return

        # Check key file
        if os.path.exists(self.key_path):
            with open(self.key_path, "rb") as f:
                key = f.read().strip()
                if key:
                    self._cipher = Fernet(key)
                    return

        # Generate a new local key if neither exists
        new_key = Fernet.generate_key()
        os.makedirs(os.path.dirname(self.key_path), exist_ok=True)
        with open(self.key_path, "wb") as f:
            f.write(new_key)
        self._cipher = Fernet(new_key)

    def is_configured(self) -> bool:
        return self._cipher is not None

    def encrypt_text(self, plaintext: str) -> str:
        """Encrypts plaintext string into an authenticated base64 ciphertext string."""
        if not self._cipher:
            raise RuntimeError("Encryption service is not initialized")
        encrypted_bytes = self._cipher.encrypt(plaintext.encode("utf-8"))
        return encrypted_bytes.decode("utf-8")

    def decrypt_text(self, ciphertext: str) -> str:
        """Decrypts authenticated base64 ciphertext string into plaintext."""
        if not self._cipher:
            raise RuntimeError("Encryption service is not initialized")
        try:
            decrypted_bytes = self._cipher.decrypt(ciphertext.encode("utf-8"))
            return decrypted_bytes.decode("utf-8")
        except InvalidToken as e:
            raise ValueError("Decryption failed: invalid key or corrupted ciphertext") from e

    def encrypt_data(self, data: Dict[str, Any]) -> str:
        """Serializes dictionary to JSON and encrypts it."""
        serialized = json.dumps(data)
        return self.encrypt_text(serialized)

    def decrypt_data(self, ciphertext: str) -> Dict[str, Any]:
        """Decrypts ciphertext and parses JSON."""
        plaintext = self.decrypt_text(ciphertext)
        return json.loads(plaintext)

# Singleton instance
encryption_service = EncryptionService()
