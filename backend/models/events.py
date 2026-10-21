"""
Typed event contracts for Resonance.
Shared between Python backend and Next.js frontend via WebSocket.
"""
from typing import Dict, Any, Optional, List
from pydantic import BaseModel, Field
import time
import uuid

class CaptionEvent(BaseModel):
    type: str = "caption"
    caption_id: str = Field(default_factory=lambda: f"cap_{uuid.uuid4().hex[:10]}")
    text: str
    timestamp: float = Field(default_factory=time.time)
    language: str = "en"  # "en", "hi", "hi-en", "unknown"
    is_final: bool = False
    confidence: Optional[float] = None
    speaker: Optional[str] = None
    metadata: Dict[str, Any] = Field(default_factory=dict)

class NameCalledEvent(BaseModel):
    type: str = "name_called"
    name: str
    speaker: Optional[str] = None
    timestamp: float = Field(default_factory=time.time)
    caption_id: Optional[str] = None
    context: str = ""
    severity: str = "urgent"  # "urgent", "important", "info"

class AmbientEvent(BaseModel):
    type: str = "ambient"
    category: str  # "alarm", "knock", "doorbell", "phone_ring", "speech", "silence", "background_noise"
    score: float
    timestamp: float = Field(default_factory=time.time)
    label: str
    severity: str = "important"  # "critical" for alarm, "important" for others
    acknowledged: bool = False

class EngineStatusEvent(BaseModel):
    type: str = "engine_status"
    mode: str = "local_ai"  # "local_ai", "demo"
    state: str = "ready"    # "ready", "capturing", "processing", "model_loading", "error", "offline"
    offline_verified: bool = False
    asr_model: str = "Local ASR"
    sound_model: str = "Local Ambient Classifier"
    active_listeners: int = 0
    message: Optional[str] = None
    timestamp: float = Field(default_factory=time.time)

class UserSettings(BaseModel):
    user_name: str = "Aman"
    nicknames: List[str] = Field(default_factory=lambda: ["Ami", "Aman Kumar"])
    colleague_names: List[str] = Field(default_factory=lambda: ["Priya", "Rahul", "Neha"])
    personal_vocabulary: List[str] = Field(default_factory=lambda: ["Resonance", "Sprint", "PR", "Kubernetes", "Jira"])
    name_alerts_enabled: bool = True
    sound_categories: List[str] = Field(default_factory=lambda: ["alarm", "knock", "doorbell", "phone_ring"])
    sound_confidence_threshold: float = 0.65
    sound_cooldown_seconds: float = 8.0
    caption_font_size: str = "medium"  # "small", "medium", "large", "xlarge"
    high_contrast: bool = False
    reduced_motion: bool = False
    display_language_mode: str = "all"  # "all", "latin_script", "devanagari"
    transcript_saving_enabled: bool = False
    transcript_retention_days: int = 7
    quick_talk_presets: List[str] = Field(default_factory=lambda: [
        "Yes",
        "Please repeat that",
        "One moment",
        "Thank you",
        "I missed that. Could you repeat it?"
    ])
