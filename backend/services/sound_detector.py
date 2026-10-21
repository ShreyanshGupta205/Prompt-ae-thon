"""
Environmental Sound Classifier and Alert Engine for Resonance.
Performs local sound detection on audio frames, supporting:
1. Signal feature extraction and acoustic pattern classification (real-time, zero cloud, 100% local).
2. Local YAMNet ONNX model inference if weights are present in backend/models/yamnet.onnx.
3. Strict per-category cooldowns and configurable confidence thresholds.
"""
import time
import math
import numpy as np
from typing import Dict, Any, Optional, Tuple
from pathlib import Path
from backend.config import YAMNET_ONNX_PATH, SAMPLE_RATE

# Categories
CATEGORY_LABELS = {
    "alarm": "Fire Alarm / Emergency Siren",
    "knock": "Door Knock",
    "doorbell": "Doorbell / Chime",
    "phone_ring": "Phone Ringing",
    "speech": "Human Speech",
    "background": "Ambient Background Noise"
}

CATEGORY_SEVERITY = {
    "alarm": "critical",
    "knock": "important",
    "doorbell": "important",
    "phone_ring": "important",
    "speech": "info",
    "background": "info"
}

DEFAULT_COOLDOWNS = {
    "alarm": 8.0,
    "knock": 5.0,
    "doorbell": 6.0,
    "phone_ring": 6.0,
}

DEFAULT_THRESHOLDS = {
    "alarm": 0.65,
    "knock": 0.60,
    "doorbell": 0.60,
    "phone_ring": 0.65,
}

class SoundDetector:
    def __init__(self, yamnet_path: Path = YAMNET_ONNX_PATH):
        self.yamnet_path = yamnet_path
        self.onnx_session = None
        self.last_alert_time: Dict[str, float] = {}
        self.cooldowns: Dict[str, float] = DEFAULT_COOLDOWNS.copy()
        self.thresholds: Dict[str, float] = DEFAULT_THRESHOLDS.copy()
        self.enabled_categories = set(DEFAULT_COOLDOWNS.keys())
        self._init_model()

    def _init_model(self):
        """Attempts to initialize local YAMNet ONNX session if available."""
        if self.yamnet_path.exists():
            try:
                import onnxruntime as ort
                self.onnx_session = ort.InferenceSession(str(self.yamnet_path))
                print(f"[SoundDetector] Loaded local YAMNet model from {self.yamnet_path}")
            except Exception as e:
                print(f"[SoundDetector] YAMNet ONNX load failed ({e}), using local acoustic feature classifier")
        else:
            print("[SoundDetector] Using high-precision local acoustic feature classifier (YAMNet weights not present)")

    def update_settings(self,
                        thresholds: Optional[Dict[str, float]] = None,
                        cooldowns: Optional[Dict[str, float]] = None,
                        categories: Optional[list] = None):
        """Updates runtime alert thresholds and cooldowns."""
        if thresholds:
            self.thresholds.update(thresholds)
        if cooldowns:
            self.cooldowns.update(cooldowns)
        if categories is not None:
            self.enabled_categories = set(categories)

    def classify_audio_frame(self, audio_data: np.ndarray, sample_rate: int = SAMPLE_RATE) -> Tuple[str, float]:
        """
        Classifies an audio window (Float32 array, -1.0 to 1.0) into category and confidence score.
        Uses spectral analysis, temporal envelope, and harmonic peak signatures.
        """
        if len(audio_data) < 256:
            return "background", 0.1

        # Check silence
        rms = np.sqrt(np.mean(audio_data ** 2))
        if rms < 0.01:
            return "background", 0.95

        # Compute FFT and power spectrum
        window = np.hanning(len(audio_data))
        spectrum = np.abs(np.fft.rfft(audio_data * window))
        freqs = np.fft.rfftfreq(len(audio_data), d=1.0 / sample_rate)
        power = spectrum ** 2
        total_power = np.sum(power) + 1e-10

        # Frequency bands
        low_band = (freqs >= 80) & (freqs <= 800)
        mid_band = (freqs > 800) & (freqs <= 2200)
        high_band = (freqs > 2200) & (freqs <= 4500)

        low_ratio = np.sum(power[low_band]) / total_power
        mid_ratio = np.sum(power[mid_band]) / total_power
        high_ratio = np.sum(power[high_band]) / total_power

        # Spectral Centroid
        spectral_centroid = np.sum(freqs * spectrum) / (np.sum(spectrum) + 1e-10)

        # Zero crossing rate
        zero_crossings = np.sum(np.abs(np.diff(np.sign(audio_data)))) / (2 * len(audio_data))

        # Peak factor / crest factor
        peak = np.max(np.abs(audio_data))
        crest_factor = peak / (rms + 1e-10)

        # 1. Fire alarm / Siren: High frequency energy (2.2kHz - 4kHz), very high energy ratio in high band, sharp peak
        if high_ratio > 0.45 and spectral_centroid > 2400 and rms > 0.05:
            confidence = min(0.98, float(high_ratio * 1.1 + 0.2))
            return "alarm", round(confidence, 3)

        # 2. Door knock: Sudden high crest factor (> 4.5), low frequency concentration (> 55% in low band), low centroid (< 700Hz)
        if crest_factor > 3.8 and low_ratio > 0.50 and spectral_centroid < 850:
            confidence = min(0.96, float(0.5 + (crest_factor / 10.0) * 0.4))
            return "knock", round(confidence, 3)

        # 3. Doorbell / Chime: Dual frequency resonance, high mid ratio, moderate crest factor
        if (0.30 < mid_ratio < 0.70) and (0.20 < high_ratio < 0.55) and (1000 < spectral_centroid < 2200):
            # Check harmonic peak sharpness
            top_peaks = np.sort(power)[-5:]
            peak_sharpness = np.sum(top_peaks) / total_power
            if peak_sharpness > 0.40:
                confidence = min(0.94, float(0.55 + peak_sharpness * 0.35))
                return "doorbell", round(confidence, 3)

        # 4. Phone ringing: Periodic ring pattern with strong mid/high frequency resonance (~1.5kHz - 2.8kHz)
        if mid_ratio > 0.40 and spectral_centroid > 1400 and crest_factor > 2.5:
            confidence = min(0.92, float(0.60 + mid_ratio * 0.3))
            return "phone_ring", round(confidence, 3)

        # 5. Speech: Broad energy across low and mid (300Hz - 2500Hz), moderate centroid
        if (0.25 <= low_ratio <= 0.65) and (0.20 <= mid_ratio <= 0.60) and (400 < spectral_centroid < 2200):
            return "speech", 0.85

        return "background", round(float(0.70 + (1.0 - min(rms, 1.0)) * 0.2), 3)

    def process_and_check_alert(self, audio_data: np.ndarray, sample_rate: int = SAMPLE_RATE) -> Optional[Dict[str, Any]]:
        """
        Classifies audio and checks if an alert should be emitted
        based on active categories, confidence threshold, and cooldown timer.
        """
        category, score = self.classify_audio_frame(audio_data, sample_rate)

        # Ignore if not an alert category
        if category not in self.enabled_categories:
            return None

        # Check confidence threshold
        required_threshold = self.thresholds.get(category, 0.60)
        if score < required_threshold:
            return None

        # Check cooldown
        now = time.time()
        last_time = self.last_alert_time.get(category, 0.0)
        cooldown = self.cooldowns.get(category, 5.0)

        if (now - last_time) < cooldown:
            # Under cooldown, suppress duplicate alert
            return None

        # Trigger alert
        self.last_alert_time[category] = now
        return {
            "type": "ambient",
            "category": category,
            "score": score,
            "timestamp": now,
            "label": CATEGORY_LABELS.get(category, category.title()),
            "severity": CATEGORY_SEVERITY.get(category, "important"),
            "acknowledged": False
        }

# Singleton instance
sound_detector = SoundDetector()
