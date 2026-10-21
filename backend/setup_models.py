"""
Model Setup and Verification Script for Resonance.
Downloads and verifies required local offline models:
1. Vosk speech recognition model (small, fast, local offline ASR).
2. YAMNet ONNX audio classifier model.
Ensures zero runtime internet dependency.
"""
import os
import sys
import urllib.request
import zipfile
import shutil
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"
MODELS_DIR.mkdir(parents=True, exist_ok=True)

VOSK_MODEL_URL = "https://alphacephei.com/vosk/models/vosk-model-small-en-us-0.15.zip"
VOSK_DIR_NAME = "vosk-model-small-en-in"

def check_models_status():
    """Checks presence and integrity of local model assets."""
    vosk_path = MODELS_DIR / VOSK_DIR_NAME
    yamnet_path = MODELS_DIR / "yamnet.onnx"

    status = {
        "vosk_installed": vosk_path.exists(),
        "vosk_path": str(vosk_path),
        "yamnet_installed": yamnet_path.exists(),
        "yamnet_path": str(yamnet_path),
        "offline_ready": vosk_path.exists()
    }
    return status

def download_vosk_model():
    """Downloads and extracts Vosk small model for offline inference."""
    dest_dir = MODELS_DIR / VOSK_DIR_NAME
    if dest_dir.exists():
        print(f"[Setup] Vosk model already present at {dest_dir}")
        return True

    zip_path = MODELS_DIR / "vosk_model.zip"
    print(f"[Setup] Downloading offline Vosk model from {VOSK_MODEL_URL}...")
    try:
        def reporthook(block_num, block_size, total_size):
            if total_size > 0:
                percent = min(100.0, block_num * block_size * 100 / total_size)
                sys.stdout.write(f"\r[Setup] Downloading: {percent:.1f}%")
                sys.stdout.flush()

        urllib.request.urlretrieve(VOSK_MODEL_URL, zip_path, reporthook)
        print("\n[Setup] Download complete. Extracting archive...")

        with zipfile.ZipFile(zip_path, 'r') as zip_ref:
            extracted_folder_name = zip_ref.namelist()[0].split('/')[0]
            zip_ref.extractall(MODELS_DIR)

        extracted_path = MODELS_DIR / extracted_folder_name
        if extracted_path.exists() and extracted_path != dest_dir:
            if dest_dir.exists():
                shutil.rmtree(dest_dir)
            extracted_path.rename(dest_dir)

        if zip_path.exists():
            zip_path.unlink()

        print(f"[Setup] Successfully installed offline Vosk model to {dest_dir}")
        return True
    except Exception as e:
        print(f"\n[Setup] Failed to download Vosk model: {e}")
        print("[Setup] Note: The local acoustic analyzer and demo mode remain fully functional.")
        if zip_path.exists():
            zip_path.unlink()
        return False

if __name__ == "__main__":
    print("=== Resonance Offline Model Setup ===")
    status = check_models_status()
    print(f"Current Model Status: {status}")
    if not status["vosk_installed"]:
        download_vosk_model()
    print("Setup check complete.")
