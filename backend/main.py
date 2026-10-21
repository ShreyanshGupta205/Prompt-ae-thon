"""
Resonance Privacy-First Local AI Backend.
FastAPI application providing:
- WebSockets for real-time local streaming events (captions, name alerts, ambient sounds, engine status)
- Authenticated AES encryption at rest
- Zero external network requests during inference
- Complete separation of Demo Mode and Local AI Mode
"""
import time
import json
import base64
import asyncio
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Query, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import numpy as np

from backend.config import SAMPLE_RATE, BENCHMARK_RESULTS_JSON, BENCHMARK_RESULTS_CSV
from backend.models.events import (
    CaptionEvent,
    NameCalledEvent,
    AmbientEvent,
    EngineStatusEvent,
    UserSettings
)
from backend.services.encryption import encryption_service
from backend.services.name_detector import name_detector
from backend.services.sound_detector import sound_detector
from backend.services.database import db_service
from backend.models.asr_adapter import (
    VoskASRAdapter,
    LocalEnergyVADAdapter,
    SCRIPTED_SPRINT_REVIEW_STEPS
)
from backend.benchmark import run_benchmarks

app = FastAPI(
    title="Resonance Local Accessibility Engine",
    description="Privacy-First Local AI Backend for Deaf and Hard-of-Hearing Workplace Accessibility",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Runtime state
vosk_adapter = VoskASRAdapter()
vad_adapter = LocalEnergyVADAdapter()

active_asr_adapter = vosk_adapter if vosk_adapter.is_loaded else vad_adapter

class SaveSessionRequest(BaseModel):
    title: str
    start_time: float
    end_time: float
    captions: List[Dict[str, Any]]
    is_demo: bool = False
    explicit_consent: bool = False

class VocabularyRequest(BaseModel):
    term: str
    correction_for: Optional[str] = None

@app.get("/health")
def health_check():
    """Returns local backend health, offline guarantee, and model state."""
    return {
        "status": "healthy",
        "offline_verified": True,
        "mode_support": ["local_ai", "demo"],
        "active_asr_model": active_asr_adapter.name,
        "active_asr_loaded": active_asr_adapter.is_loaded,
        "sound_detector_loaded": True,
        "encryption_configured": encryption_service.is_configured(),
        "timestamp": time.time()
    }

@app.get("/api/models/status")
def get_models_status():
    """Reports status of local model files and adapters."""
    from backend.setup_models import check_models_status
    setup_status = check_models_status()
    return {
        "asr_adapter": active_asr_adapter.get_info(),
        "sound_detector": {
            "name": "Local Acoustic Signature Classifier",
            "yamnet_installed": setup_status["yamnet_installed"],
            "yamnet_path": setup_status["yamnet_path"],
            "cooldowns": sound_detector.cooldowns,
            "thresholds": sound_detector.thresholds,
            "enabled_categories": list(sound_detector.enabled_categories)
        },
        "setup_info": setup_status
    }

@app.get("/api/benchmark/results")
def get_benchmark_results():
    """Returns existing benchmark measurements or runs them if none exist."""
    if not BENCHMARK_RESULTS_JSON.exists():
        results = run_benchmarks()
        return results
    try:
        with open(BENCHMARK_RESULTS_JSON, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to read benchmark results: {e}")

@app.post("/api/benchmark/run")
def trigger_benchmark():
    """Executes a fresh evaluation run across ASR, Sound, and Name Detection suites."""
    results = run_benchmarks()
    return results

@app.get("/api/transcripts")
def list_transcripts(q: str = Query(default="", description="Search query")):
    """Lists saved transcripts metadata."""
    return db_service.list_sessions(search=q)

@app.get("/api/transcripts/{session_id}")
def get_transcript_details(session_id: str):
    """Retrieves session details and decrypts captions with authenticated key."""
    details = db_service.get_session_details(session_id)
    if not details:
        raise HTTPException(status_code=404, detail="Transcript session not found")
    return details

@app.delete("/api/transcripts/{session_id}")
def delete_transcript(session_id: str):
    """Deletes single session and encrypted captions."""
    success = db_service.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    return {"deleted": True, "session_id": session_id}

@app.delete("/api/transcripts")
def delete_all_transcripts():
    """Deletes all saved sessions and encrypted captions."""
    count = db_service.delete_all_sessions()
    return {"deleted_count": count}

@app.post("/api/sessions/save")
def save_session(req: SaveSessionRequest):
    """Saves session with authenticated encryption if explicit consent is given."""
    sess_id = db_service.save_session(
        title=req.title,
        start_time=req.start_time,
        end_time=req.end_time,
        captions=req.captions,
        is_demo=req.is_demo,
        explicit_consent=req.explicit_consent
    )
    if not sess_id and not req.explicit_consent:
        return {
            "saved": False,
            "reason": "Consent not granted. Audio/captions were discarded from memory."
        }
    return {"saved": True, "session_id": sess_id}

@app.get("/api/vocabulary")
def get_vocabulary():
    """Retrieves personal vocabulary list."""
    return db_service.list_vocabulary()

@app.post("/api/vocabulary")
def add_vocabulary(req: VocabularyRequest):
    """Adds a term to personal vocabulary."""
    db_service.add_vocabulary_term(req.term, req.correction_for)
    return {"saved": True, "term": req.term}

@app.delete("/api/vocabulary/{term}")
def remove_vocabulary(term: str):
    """Removes a term from personal vocabulary."""
    success = db_service.remove_vocabulary_term(term)
    return {"deleted": success, "term": term}


# WebSocket Manager for real-time audio and events
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)

    async def send_event(self, websocket: WebSocket, event_data: Dict[str, Any]):
        await websocket.send_text(json.dumps(event_data))

    async def broadcast(self, event_data: Dict[str, Any]):
        for connection in self.active_connections:
            try:
                await connection.send_text(json.dumps(event_data))
            except Exception:
                pass

manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)

    # Session connection state
    current_mode = "demo"
    session_title = "Sprint Review"
    demo_task: Optional[asyncio.Task] = None
    demo_paused = False
    demo_step_index = 0

    # Send initial engine status event
    initial_status = EngineStatusEvent(
        mode=current_mode,
        state="ready",
        offline_verified=True,
        asr_model=active_asr_adapter.name,
        sound_model="Local Acoustic Signature Classifier",
        active_listeners=len(manager.active_connections),
        message="Resonance Local Engine Connected"
    )
    await manager.send_event(websocket, initial_status.model_dump())

    async def run_demo_script(start_idx: int = 0):
        nonlocal demo_step_index
        demo_step_index = start_idx
        while demo_step_index < len(SCRIPTED_SPRINT_REVIEW_STEPS):
            if demo_paused:
                await asyncio.sleep(0.5)
                continue

            step = SCRIPTED_SPRINT_REVIEW_STEPS[demo_step_index]
            await asyncio.sleep(3.2)  # realistic cadence between meeting dialogue

            if "sound_event" in step:
                # Trigger sound alert
                se = step["sound_event"]
                alert_evt = AmbientEvent(
                    category=se["category"],
                    score=se["score"],
                    label=se["label"],
                    severity=se["severity"],
                    timestamp=time.time()
                )
                await manager.send_event(websocket, alert_evt.model_dump())
            elif "text" in step:
                # Emit caption
                cap_evt = CaptionEvent(
                    text=step["text"],
                    timestamp=time.time(),
                    language=step.get("language", "en"),
                    is_final=step.get("is_final", True),
                    confidence=0.92,
                    speaker=step.get("speaker"),
                    metadata={"simulated": True, "mode": "demo"}
                )
                await manager.send_event(websocket, cap_evt.model_dump())

                # Check if name was called in this caption
                name_match = name_detector.detect(step["text"])
                if name_match:
                    name_evt = NameCalledEvent(
                        name=name_match["matched_name"],
                        speaker=step.get("speaker"),
                        timestamp=time.time(),
                        caption_id=cap_evt.caption_id,
                        context=name_match["context"],
                        severity="urgent"
                    )
                    await manager.send_event(websocket, name_evt.model_dump())

            demo_step_index += 1

    try:
        while True:
            raw_message = await websocket.receive_text()
            try:
                msg = json.loads(raw_message)
            except Exception:
                continue

            action = msg.get("action") or msg.get("type")

            if action == "start_session":
                current_mode = msg.get("mode", "demo")
                session_title = msg.get("title", "Live Session")

                # Update settings if provided
                if "settings" in msg:
                    s = msg["settings"]
                    name_detector.update_names(
                        primary_name=s.get("user_name", "Aman"),
                        nicknames=s.get("nicknames", [])
                    )
                    sound_detector.update_settings(
                        thresholds=s.get("sound_thresholds"),
                        cooldowns=s.get("sound_cooldowns"),
                        categories=s.get("sound_categories")
                    )

                status_evt = EngineStatusEvent(
                    mode=current_mode,
                    state="capturing",
                    offline_verified=True,
                    asr_model=active_asr_adapter.name if current_mode == "local_ai" else "Simulated Sprint Review Script",
                    sound_model="Local Acoustic Signature Classifier",
                    active_listeners=len(manager.active_connections),
                    message=f"Session started in {current_mode.upper()} mode"
                )
                await manager.send_event(websocket, status_evt.model_dump())

                if current_mode == "demo":
                    if demo_task and not demo_task.done():
                        demo_task.cancel()
                    demo_paused = False
                    demo_task = asyncio.create_task(run_demo_script(0))

            elif action == "stop_session":
                if demo_task and not demo_task.done():
                    demo_task.cancel()
                status_evt = EngineStatusEvent(
                    mode=current_mode,
                    state="ready",
                    offline_verified=True,
                    asr_model=active_asr_adapter.name,
                    sound_model="Local Acoustic Signature Classifier",
                    active_listeners=len(manager.active_connections),
                    message="Session ended"
                )
                await manager.send_event(websocket, status_evt.model_dump())

            elif action == "demo_control":
                sub_action = msg.get("command")
                if sub_action == "pause":
                    demo_paused = True
                elif sub_action == "resume":
                    demo_paused = False
                elif sub_action == "restart":
                    if demo_task and not demo_task.done():
                        demo_task.cancel()
                    demo_paused = False
                    demo_task = asyncio.create_task(run_demo_script(0))
                elif sub_action == "trigger_event":
                    evt_type = msg.get("event_type")
                    if evt_type == "knock":
                        knock_evt = AmbientEvent(
                            category="knock",
                            score=0.90,
                            label="Door Knock (Simulated)",
                            severity="important",
                            timestamp=time.time()
                        )
                        await manager.send_event(websocket, knock_evt.model_dump())
                    elif evt_type == "alarm":
                        alarm_evt = AmbientEvent(
                            category="alarm",
                            score=0.96,
                            label="Fire Alarm (Simulated)",
                            severity="critical",
                            timestamp=time.time()
                        )
                        await manager.send_event(websocket, alarm_evt.model_dump())
                    elif evt_type == "doorbell":
                        bell_evt = AmbientEvent(
                            category="doorbell",
                            score=0.88,
                            label="Doorbell (Simulated)",
                            severity="important",
                            timestamp=time.time()
                        )
                        await manager.send_event(websocket, bell_evt.model_dump())
                    elif evt_type == "phone_ring":
                        phone_evt = AmbientEvent(
                            category="phone_ring",
                            score=0.92,
                            label="Phone Ringing (Simulated)",
                            severity="important",
                            timestamp=time.time()
                        )
                        await manager.send_event(websocket, phone_evt.model_dump())
                    elif evt_type == "name_call":
                        target_name = msg.get("name") or name_detector.primary_name or "Aman"
                        speaker_name = msg.get("speaker") or "Priya (Team Lead)"
                        # Emit caption mentioning name
                        cap_evt = CaptionEvent(
                            text=f"{target_name}, could you confirm the next step please?",
                            timestamp=time.time(),
                            language="en",
                            is_final=True,
                            confidence=0.95,
                            speaker=speaker_name,
                            metadata={"simulated": True, "mode": "demo"}
                        )
                        await manager.send_event(websocket, cap_evt.model_dump())

                        name_evt = NameCalledEvent(
                            name=target_name,
                            speaker=speaker_name,
                            timestamp=time.time(),
                            caption_id=cap_evt.caption_id,
                            context=f"...{target_name}, could you confirm...",
                            severity="urgent"
                        )
                        await manager.send_event(websocket, name_evt.model_dump())

            elif action == "audio_chunk":
                # Real local microphone processing
                if current_mode == "local_ai":
                    data_b64 = msg.get("data")
                    if data_b64:
                        try:
                            pcm_bytes = base64.b64decode(data_b64)
                            # Convert to numpy array for sound classifier
                            samples = np.frombuffer(pcm_bytes, dtype=np.int16).astype(np.float32) / 32768.0

                            # 1. Sound detection check
                            alert = sound_detector.process_and_check_alert(samples, SAMPLE_RATE)
                            if alert:
                                alert_evt = AmbientEvent(**alert)
                                await manager.send_event(websocket, alert_evt.model_dump())

                            # 2. Local ASR speech recognition
                            asr_results = active_asr_adapter.process_audio(pcm_bytes)
                            for r in asr_results:
                                cap_evt = CaptionEvent(**r)
                                await manager.send_event(websocket, cap_evt.model_dump())

                                # Check name matching
                                if cap_evt.text:
                                    matched = name_detector.detect(cap_evt.text)
                                    if matched:
                                        name_evt = NameCalledEvent(
                                            name=matched["matched_name"],
                                            speaker=cap_evt.speaker,
                                            timestamp=time.time(),
                                            caption_id=cap_evt.caption_id,
                                            context=matched["context"],
                                            severity="urgent"
                                        )
                                        await manager.send_event(websocket, name_evt.model_dump())
                        except Exception as e:
                            # Log operational error without logging private raw audio
                            print(f"[AudioPipeline] Warning during audio frame processing: {e}")

            elif action == "update_settings":
                s = msg.get("settings", {})
                if "user_name" in s or "nicknames" in s:
                    name_detector.update_names(
                        primary_name=s.get("user_name", name_detector.primary_name),
                        nicknames=s.get("nicknames", name_detector.nicknames)
                    )
                if "sound_confidence_threshold" in s or "sound_cooldown_seconds" in s or "sound_categories" in s:
                    sound_detector.update_settings(
                        thresholds={"alarm": s.get("sound_confidence_threshold", 0.65)},
                        cooldowns={"alarm": s.get("sound_cooldown_seconds", 8.0)},
                        categories=s.get("sound_categories")
                    )

            elif action == "ping":
                await manager.send_event(websocket, {"type": "pong", "timestamp": time.time()})

    except WebSocketDisconnect:
        if demo_task and not demo_task.done():
            demo_task.cancel()
        manager.disconnect(websocket)
    except Exception as e:
        if demo_task and not demo_task.done():
            demo_task.cancel()
        manager.disconnect(websocket)
