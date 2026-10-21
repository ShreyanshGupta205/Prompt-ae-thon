import { create } from "zustand";
import {
  CaptionEvent,
  NameCalledEvent,
  AmbientEvent,
  EngineStatusEvent,
  UserSettings,
  ResonanceWebSocketEvent,
  VocabularyItem
} from "@/types";

const DEFAULT_SETTINGS: UserSettings = {
  user_name: "Aman",
  nicknames: ["Ami", "Aman Kumar"],
  colleague_names: ["Priya", "Rahul", "Neha"],
  personal_vocabulary: ["Resonance", "Sprint", "Kubernetes", "PR review", "Accessibility"],
  name_alerts_enabled: true,
  sound_categories: ["alarm", "knock", "doorbell", "phone_ring"],
  sound_confidence_threshold: 0.65,
  sound_cooldown_seconds: 8.0,
  caption_font_size: "medium",
  high_contrast: false,
  reduced_motion: false,
  display_language_mode: "all",
  transcript_saving_enabled: false,
  transcript_retention_days: 7,
  quick_talk_presets: [
    "Yes",
    "Please repeat that",
    "One moment",
    "Thank you",
    "I missed that. Could you repeat it?"
  ]
};

interface ResonanceState {
  // Modes & Status
  mode: "demo" | "local_ai";
  isSessionActive: boolean;
  sessionStartTime: number | null;
  sessionTitle: string;
  engineStatus: EngineStatusEvent;
  wsConnected: boolean;

  // Stream data
  captions: CaptionEvent[];
  partialCaption: CaptionEvent | null;
  activeAmbientAlerts: AmbientEvent[];
  activeNameAlert: NameCalledEvent | null;

  // Accessibility & UI Controls
  autoScroll: boolean;
  settings: UserSettings;
  presenterPanelOpen: boolean;
  recoveryOpen: boolean;
  isMicActive: boolean;
  micError: string | null;
  localTtsAvailable: boolean;

  // Actions
  setMode: (mode: "demo" | "local_ai") => void;
  startSession: (title?: string) => void;
  stopSession: () => Promise<void>;
  updateSettings: (partial: Partial<UserSettings>) => void;
  resetSettings: () => void;
  toggleAutoScroll: () => void;
  togglePresenterPanel: () => void;
  setPresenterPanelOpen: (open: boolean) => void;
  toggleRecovery: () => void;
  setRecoveryOpen: (open: boolean) => void;
  acknowledgeAmbient: (category: string) => void;
  acknowledgeNameAlert: () => void;
  editCaption: (caption_id: string, newText: string) => void;
  sendQuickTalk: (phrase: string) => void;
  triggerDemoCommand: (command: "pause" | "resume" | "restart" | "trigger_event", event_type?: string, name?: string) => void;
  connectWebSocket: () => void;
  checkLocalTts: () => void;
}

let wsInstance: WebSocket | null = null;
let mediaStreamInstance: MediaStream | null = null;
let audioContextInstance: AudioContext | null = null;

export const useResonanceStore = create<ResonanceState>((set, get) => ({
  mode: "demo",
  isSessionActive: false,
  sessionStartTime: null,
  sessionTitle: "Sprint 24 Review",
  engineStatus: {
    type: "engine_status",
    mode: "demo",
    state: "ready",
    offline_verified: true,
    asr_model: "Simulated Sprint Review Script",
    sound_model: "Local Acoustic Signature Classifier",
    active_listeners: 1,
    message: "Demo Mode Ready (Simulated Data)"
  },
  wsConnected: false,

  captions: [],
  partialCaption: null,
  activeAmbientAlerts: [],
  activeNameAlert: null,

  autoScroll: true,
  settings: DEFAULT_SETTINGS,
  presenterPanelOpen: false,
  recoveryOpen: false,
  isMicActive: false,
  micError: null,
  localTtsAvailable: false,

  setMode: (mode) => {
    set((state) => ({
      mode,
      engineStatus: {
        ...state.engineStatus,
        mode,
        state: "ready",
        asr_model: mode === "local_ai" ? "Local Vosk / Acoustic Pipeline" : "Simulated Sprint Review Script",
        message: mode === "local_ai" ? "Local AI Mode (Genuine Device Inference)" : "Demo Mode (Simulated Data)"
      }
    }));
  },

  updateSettings: (partial) => {
    set((state) => {
      const updated = { ...state.settings, ...partial };
      // Save to localStorage if client-side
      if (typeof window !== "undefined") {
        try {
          localStorage.setItem("resonance_user_settings", JSON.stringify(updated));
        } catch (_) {}
      }
      // Send updated settings to backend via WS if connected
      if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
        wsInstance.send(JSON.stringify({ action: "update_settings", settings: updated }));
      }
      return { settings: updated };
    });
  },

  resetSettings: () => {
    set({ settings: DEFAULT_SETTINGS });
    if (typeof window !== "undefined") {
      try {
        localStorage.removeItem("resonance_user_settings");
      } catch (_) {}
    }
  },

  toggleAutoScroll: () => set((s) => ({ autoScroll: !s.autoScroll })),
  togglePresenterPanel: () => set((s) => ({ presenterPanelOpen: !s.presenterPanelOpen })),
  setPresenterPanelOpen: (open) => set({ presenterPanelOpen: open }),
  toggleRecovery: () => set((s) => ({ recoveryOpen: !s.recoveryOpen })),
  setRecoveryOpen: (open) => set({ recoveryOpen: open }),

  acknowledgeAmbient: (category) => {
    set((s) => ({
      activeAmbientAlerts: s.activeAmbientAlerts.filter((a) => a.category !== category)
    }));
  },

  acknowledgeNameAlert: () => {
    set({ activeNameAlert: null });
  },

  editCaption: (caption_id, newText) => {
    set((s) => ({
      captions: s.captions.map((c) =>
        c.caption_id === caption_id ? { ...c, text: newText, edited: true } : c
      )
    }));
  },

  checkLocalTts: () => {
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      const checkVoices = () => {
        const voices = window.speechSynthesis.getVoices();
        // Check if browser exposes local voice flags
        const hasLocal = voices.some((v) => v.localService === true || v.lang.startsWith("en") || v.lang.startsWith("hi"));
        set({ localTtsAvailable: hasLocal && voices.length > 0 });
      };
      checkVoices();
      window.speechSynthesis.onvoiceschanged = checkVoices;
    }
  },

  sendQuickTalk: (phrase) => {
    const { localTtsAvailable } = get();
    const now = Date.now() / 1000;

    // 1. Append to live caption feed as user response
    const quickCaption: CaptionEvent = {
      type: "caption",
      caption_id: `qt_${Date.now()}`,
      text: phrase,
      timestamp: now,
      language: "en",
      is_final: true,
      speaker: "You (Quick-Talk)",
      metadata: { quick_talk: true }
    };

    set((s) => ({ captions: [...s.captions, quickCaption] }));

    // 2. Offline Speech Synthesis if supported
    if (typeof window !== "undefined" && "speechSynthesis" in window) {
      try {
        const utterance = new SpeechSynthesisUtterance(phrase);
        utterance.rate = 1.0;
        utterance.pitch = 1.0;
        const voices = window.speechSynthesis.getVoices();
        const localVoice = voices.find((v) => v.localService === true) || voices[0];
        if (localVoice) utterance.voice = localVoice;
        window.speechSynthesis.speak(utterance);
      } catch (e) {
        console.warn("TTS speak warning:", e);
      }
    }
  },

  triggerDemoCommand: (command, event_type, name) => {
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      wsInstance.send(JSON.stringify({
        action: "demo_control",
        command,
        event_type,
        name
      }));
    }
  },

  startSession: async (title = "Live Meeting") => {
    const { mode, settings, connectWebSocket } = get();
    connectWebSocket();

    set({
      isSessionActive: true,
      sessionStartTime: Date.now() / 1000,
      sessionTitle: title,
      captions: [],
      partialCaption: null,
      activeAmbientAlerts: [],
      activeNameAlert: null,
      isMicActive: true
    });

    // Notify backend
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      wsInstance.send(JSON.stringify({
        action: "start_session",
        mode,
        title,
        settings
      }));
    }

    // If Local AI Mode, initialize genuine microphone capture pipeline
    if (mode === "local_ai" && typeof window !== "undefined" && navigator.mediaDevices) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
        mediaStreamInstance = stream;
        const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
        audioContextInstance = audioCtx;

        const source = audioCtx.createMediaStreamSource(stream);
        // Use ScriptProcessorNode to read 16kHz PCM audio buffers
        const processor = audioCtx.createScriptProcessor(4096, 1, 1);
        processor.onaudioprocess = (e) => {
          const inputData = e.inputBuffer.getChannelData(0);
          // Convert Float32 to Int16 PCM
          const pcm16 = new Int16Array(inputData.length);
          for (let i = 0; i < inputData.length; i++) {
            const s = Math.max(-1, Math.min(1, inputData[i]));
            pcm16[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
          }

          // Base64 encode PCM bytes
          const binary = String.fromCharCode(...new Uint8Array(pcm16.buffer));
          const b64 = btoa(binary);

          if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
            wsInstance.send(JSON.stringify({
              action: "audio_chunk",
              data: b64
            }));
          }
        };

        source.connect(processor);
        processor.connect(audioCtx.destination);
        set({ isMicActive: true, micError: null });
      } catch (err: any) {
        set({
          micError: `Microphone permission required for Local AI Mode: ${err.message}`,
          isMicActive: false
        });
      }
    }
  },

  stopSession: async () => {
    const { sessionTitle, sessionStartTime, captions, mode, settings } = get();
    const endTime = Date.now() / 1000;

    // Stop audio capture
    if (mediaStreamInstance) {
      mediaStreamInstance.getTracks().forEach((track) => track.stop());
      mediaStreamInstance = null;
    }
    if (audioContextInstance) {
      audioContextInstance.close();
      audioContextInstance = null;
    }

    // Notify backend
    if (wsInstance && wsInstance.readyState === WebSocket.OPEN) {
      wsInstance.send(JSON.stringify({
        action: "stop_session",
        save_consent: settings.transcript_saving_enabled
      }));
    }

    // Call REST endpoint to save transcript if consent is given or demo mode
    if (settings.transcript_saving_enabled || mode === "demo") {
      try {
        await fetch("http://localhost:8000/api/sessions/save", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: sessionTitle,
            start_time: sessionStartTime || endTime - 60,
            end_time: endTime,
            captions,
            is_demo: mode === "demo",
            explicit_consent: settings.transcript_saving_enabled
          })
        });
      } catch (err) {
        console.warn("Failed to persist transcript session to backend:", err);
      }
    }

    set({
      isSessionActive: false,
      isMicActive: false,
      partialCaption: null
    });
  },

  connectWebSocket: () => {
    if (wsInstance && (wsInstance.readyState === WebSocket.OPEN || wsInstance.readyState === WebSocket.CONNECTING)) {
      return;
    }

    try {
      const ws = new WebSocket("ws://localhost:8000/ws");
      wsInstance = ws;

      ws.onopen = () => {
        set({ wsConnected: true });
        // Send initial settings
        const { settings, mode } = get();
        ws.send(JSON.stringify({ action: "update_settings", settings, mode }));
      };

      ws.onmessage = (event) => {
        try {
          const data: ResonanceWebSocketEvent = JSON.parse(event.data);

          if (data.type === "engine_status") {
            set({ engineStatus: data });
          } else if (data.type === "caption") {
            if (data.is_final) {
              set((s) => ({
                captions: [...s.captions, data],
                partialCaption: null
              }));
            } else {
              set({ partialCaption: data });
            }
          } else if (data.type === "name_called") {
            set({ activeNameAlert: data });
          } else if (data.type === "ambient") {
            set((s) => {
              // Replace or add ambient alert
              const filtered = s.activeAmbientAlerts.filter((a) => a.category !== data.category);
              return { activeAmbientAlerts: [...filtered, data] };
            });
          }
        } catch (e) {
          console.error("Error parsing WebSocket event:", e);
        }
      };

      ws.onclose = () => {
        set({ wsConnected: false });
        wsInstance = null;
      };

      ws.onerror = () => {
        set({ wsConnected: false });
      };
    } catch (e) {
      console.warn("WebSocket connection failure:", e);
    }
  }
}));
