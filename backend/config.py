"""
Resonance Backend Configuration
"""
import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"
SECRETS_DIR = BASE_DIR / "secrets"

# Ensure directories exist
DATA_DIR.mkdir(parents=True, exist_ok=True)
MODELS_DIR.mkdir(parents=True, exist_ok=True)
SECRETS_DIR.mkdir(parents=True, exist_ok=True)

DB_PATH = DATA_DIR / "resonance.db"
KEY_FILE_PATH = SECRETS_DIR / "resonance.key"
BENCHMARK_RESULTS_JSON = DATA_DIR / "benchmark_results.json"
BENCHMARK_RESULTS_CSV = DATA_DIR / "benchmark_results.csv"

# Models paths
VOSK_MODEL_PATH = MODELS_DIR / "vosk-model-small-en-in"
YAMNET_ONNX_PATH = MODELS_DIR / "yamnet.onnx"

# Audio Settings
SAMPLE_RATE = 16000
CHANNELS = 1
CHUNK_SIZE = 1024  # samples per chunk

# Security & Privacy
ALLOW_OFFLINE_VERIFICATION = True
REQUIRE_EXPLICIT_CONSENT_FOR_STORAGE = True
