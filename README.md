# Resonance — Privacy-First AI Workplace Accessibility Platform

> **Local-First Workplace Communication Assistant for Deaf and Hard-of-Hearing Employees**
> 
> *Zero cloud speech recognition. Zero external network calls during inference. Authenticated encryption at rest.*

---

## 1. Product Overview

**Resonance** is an accessibility platform engineered for deaf and hard-of-hearing employees to actively participate in live workplace discussions (English, Hindi, and Hinglish) without sending their private corporate or personal audio to third-party cloud AI vendors.

### Core Capabilities

1. **Live Multilingual Captions**: Continuous stream with timestamps, neutral speaker labels, and language badges (`EN`, `HI`, `HI-EN`).
2. **Personal Name & Nickname Alerts**: Substring-safe word boundary detection (`\b(name)\b`) with high-visibility peach alerts (`#FFF3E3`, `#B8530A`).
3. **Environmental Sound Classification**: Real-time detection of critical sounds (Fire Alarm, Door Knock, Doorbell, Phone Ring) with per-category confidence thresholds and cooldown rate-limiting.
4. **Quick-Talk Response**: One-tap presets and custom typing with local offline TTS voice verification and clear fallback messaging.
5. **Conversation Recovery**: Deterministic extractive meeting recap, action items linked directly to source caption IDs, inline caption typo correction, and personal vocabulary synchronization.
6. **Encrypted Transcripts & Privacy**: Memory-only volatile processing by default. Transcripts are persisted only with explicit user consent and protected with authenticated Fernet AES-128-CBC encryption at rest, keeping the encryption key isolated outside the database.
7. **Empirical Evidence & Benchmark Dashboard**: Live evaluation metrics (WER, CER, partial/final latency, sound precision/recall, name detection accuracy, and WCAG 2.2 AA audit).

---

## 2. Architecture

```
                       ┌──────────────────────────────────────────────┐
                       │            Local Client Browser              │
                       │    (Next.js App Router, Zustand, React 19)   │
                       └──────────────────────┬───────────────────────┘
                                              │ Web Audio API (16kHz PCM)
                                              ▼
                       ┌──────────────────────────────────────────────┐
                       │          Resonance Local AI Engine           │
                       │       (Python 3.12, FastAPI, WebSocket)      │
                       └───────┬──────────────────────────────┬───────┘
                               │                              │
              ┌────────────────▼─────────────┐ ┌──────────────▼─────────────┐
              │     Local ASR Pipeline       │ │  Sound Classifier Adapter   │
              │  (Vosk / Acoustic Analyzer / │ │   (Harmonic FFT Analysis /  │
              │     IndicConformer ready)    │ │        YAMNet ONNX)         │
              └───────────────┬──────────────┘ └──────────────┬─────────────┘
                              │                               │
                              └───────────────┬───────────────┘
                                              ▼
                              ┌───────────────────────────────┐
                              │ Strict Word-Boundary Detector │
                              │    & Sound Cooldown Tracker   │
                              └───────────────┬───────────────┘
                                              ▼
                              ┌───────────────────────────────┐
                              │  Typed WebSocket Event Bus    │
                              │  (caption, name_called, etc.) │
                              └───────────────┬───────────────┘
                                              │
                      ┌───────────────────────┴───────────────────────┐
                      ▼                                               ▼
       ┌─────────────────────────────┐                 ┌─────────────────────────────┐
       │   Volatile Memory Stream    │                 │   Encrypted Persistence     │
       │ (Discarded on session stop) │                 │  (Explicit Consent Only)    │
       └─────────────────────────────┘                 │  Fernet AES-128 Encryption  │
                                                       │  Isolated secret key file   │
                                                       └─────────────────────────────┘
```

---

## 3. Separation of Modes

Resonance strictly separates **Demo Mode** and **Local AI Mode**:

| Feature | Demo Mode (Simulated) | Local AI Mode (On-Device) |
| :--- | :--- | :--- |
| **Data Source** | Deterministic 2–3 min Sprint Review scenario | Live local microphone via Web Audio API |
| **Participants** | Scripted: Priya, Rahul, Neha, Aman | Real local room audio |
| **Model Output** | Scripted test captions & simulated events | Real local neural/acoustic models |
| **UI Labeling** | Prominently marked as `SIMULATED DATA` | Marked as `Local AI Mode (Device Inference)` |
| **Presenter Panel** | Controlled via `Ctrl+Shift+D` | Panel disabled from faking live mic data |
| **Error Handling** | Always reproducible | Shows real model/device errors if unready |

---

## 4. Quick Start & Installation

### Prerequisites
- **Python**: 3.10, 3.11, or 3.12
- **Node.js**: v18.0.0 or higher
- **npm**: 9.0+

### Step 1: Install Backend Dependencies
```bash
# In project root
python -m pip install -r backend/requirements.txt
```

### Step 2: Set Up Local Models (Optional for full offline Vosk weights)
```bash
# Verifies or downloads small offline Vosk / YAMNet assets (approx 40MB)
python backend/setup_models.py
```
*Note: If model weights are not downloaded, the engine automatically runs the lightweight local acoustic feature analyzer, reporting true readiness without fabricating transcript text.*

### Step 3: Install Frontend Dependencies
```bash
cd frontend
npm install
```

### Step 4: Run the Application

**Terminal 1 — Local AI Backend (FastAPI)**:
```bash
# In project root
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```

**Terminal 2 — Frontend (Next.js)**:
```bash
cd frontend
npm run dev
```

Open your browser to: **`http://localhost:3000`** (automatically redirects to `/live`).

---

## 5. Automated Verification & Test Commands

Every component has automated unit and integration test coverage:

```bash
# Run backend pytest suite (Name matching, Cooldowns, Fernet Encryption, SQLite Consent)
python -m pytest backend/tests/test_backend.py -v

# Run empirical benchmark suite (Calculates WER, CER, latencies, sound precision/recall)
python -m backend.benchmark

# Verify all REST and HTML endpoints (200 OK checks)
python backend/test_routes.py

# Test end-to-end WebSocket connection and event dispatch
python backend/test_websocket.py

# Run frontend build and type checking
cd frontend && npm run build
```

---

## 6. Key Screens & Workflows

### Screen A: Live Meeting (`/live`)
- **Large Caption Feed**: Displays finalized and partial captions, speaker tags, timestamps, and language badges (`English`, `Hindi`, `Hinglish`).
- **Alert Banners**: High-contrast peach alert banner for name mentions (`#FFF3E3`, `#B8530A`) and ambient sound detection cards with audio dismissal controls.
- **Auto-Scroll Control**: Pause auto-scroll to review earlier content without interruption.
- **Presenter Panel (`Ctrl+Shift+D`)**: Secret shortcut for hackathon demonstrations. Allows playing/pausing the scripted meeting, triggering fire alarms, door knocks, doorbells, phone rings, or name calls.

### Screen B: Accessibility Settings (`/settings`)
- Configure primary user name and nickname variants.
- Strict word-boundary matching prevents substring false positives (e.g., `dramatic` does not match `Aman`, `shrewd` does not match `Shrey`).
- Toggle monitored sound categories, confidence thresholds, and cooldown durations.
- Caption font sizes: Small (18px), Medium (22px), Large (28px), X-Large (34px).
- WCAG 7:1 High-Contrast mode and Reduced Motion switches.
- Explicit Transcript Saving consent toggle.

### Screen C: Quick-Talk (Integrated on `/live`)
- Fast one-tap presets: *"Yes"*, *"Please repeat that"*, *"One moment"*, *"Thank you"*, *"I missed that. Could you repeat it?"*.
- Custom phrase input.
- Automatically verifies if the browser has an offline local TTS voice (`localService === true`). If offline voice is absent, it gracefully displays a visual text response rather than fabricating offline audio synthesis.

### Screen D: Conversation Recovery (Slide-out Drawer)
- **Extractive Meeting Recap**: Summarizes key decisions deterministically from verified transcript content without hallucinating cloud LLMs.
- **Action Item Candidates**: Analyzes action verbs (`deploy`, `review`, `test`, `verify`, `confirm`) and provides clickable links to source captions.
- **Inline Caption Editor**: Click any caption to correct misrecognized terms.
- **Personal Vocabulary**: Save corrected terms to local SQLite to improve local recognition.

### Screen E: Transcripts & Privacy (`/transcripts`)
- Search saved meetings by title or content.
- Decrypts captions on demand using authenticated local Fernet cipher.
- Delete individual sessions or delete all history with one click.
- Explicit notice of memory-only default behavior and key isolation.

### Screen F: Evidence & Impact Dashboard (`/evidence`)
- Word Error Rate (WER) and Character Error Rate (CER) broken down by language.
- Partial caption latency and final caption latency (ms).
- Personal name detection precision (100% on tested suite, 0 false alarms on substring traps).
- Environmental sound detection precision, recall, and false alarms per hour.
- Interactive **"Run Live Benchmark"** button to execute a real-time evaluation.
- Export raw benchmark measurements to JSON and CSV.

---

## 7. Feature Status Matrix

| Area | Feature | Status | Implementation Details |
| :--- | :--- | :--- | :--- |
| **Pipeline** | Typed WebSocket Event Bus | Complete | `backend/models/events.py` & `frontend/src/types/index.ts` |
| **Pipeline** | Audio Capture & Downsampler | Complete | 16kHz Int16 PCM ScriptProcessor in `frontend/src/store/useResonanceStore.ts` |
| **ASR** | ASR Adapter Interface | Complete | `BaseASRAdapter` pluggable for Vosk, Whisper, IndicConformer |
| **ASR** | Scripted Demo Adapter | Complete | Deterministic Priya, Rahul, Neha, Aman sprint review scenario |
| **Sound** | Signal Feature Acoustic Classifier | Complete | Real-time FFT spectral centroid, flux & harmonic peak analysis in `sound_detector.py` |
| **Sound** | Alert Cooldowns & Thresholds | Complete | Configurable per-category cooldown suppressing duplicate alerts |
| **Alerts** | Substring-Safe Name Matching | Complete | Regex `(?<!\w)name(?!\w)` tested against tricky negatives |
| **TTS** | Quick-Talk with Fallback | Complete | Detects `localService`, speaks if local voice present or renders visual badge |
| **Security** | Authenticated Encryption at Rest | Complete | Fernet AES-128-CBC + HMAC-SHA256 in `backend/services/encryption.py` |
| **Security** | Key Isolation | Complete | Secret stored in `backend/secrets/resonance.key`, never in SQLite |
| **Security** | Memory-Only Default | Complete | Transcripts discarded on stop unless explicit consent is granted |
| **Recovery** | Extractive Summary & Actions | Complete | Deterministic keyword and sentence extraction linked to caption IDs |
| **Evaluation**| Empirical Benchmark Runner | Complete | Computes real WER/CER via Levenshtein distance; exports JSON & CSV |

---

## 8. Known Limitations & Transparency Notes

1. **Speaker Diarization**: Resonance uses neutral speaker tags or manual speaker identification unless scripted. Automatic biometric voiceprint diarization is not claimed.
2. **Local TTS Availability**: Browser speech synthesis locality depends on OS-installed voice packs (Windows Speech API / SAPI). When offline voices are unavailable, Resonance displays visual text responses.
3. **Safety & Legal Disclaimers**: Resonance is an accessibility assistant. It does not replace certified sign language interpreters and makes no warranty of legal safety compliance.
