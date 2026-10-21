/**
 * Typed Event Contracts for Resonance
 * Synchronized with Python backend
 */

export interface CaptionEvent {
  type: "caption";
  caption_id: string;
  text: string;
  timestamp: number;
  language: "en" | "hi" | "hi-en" | "unknown";
  is_final: boolean;
  confidence?: number;
  speaker?: string;
  metadata?: Record<string, any>;
  edited?: boolean;
}

export interface NameCalledEvent {
  type: "name_called";
  name: string;
  speaker?: string;
  timestamp: number;
  caption_id?: string;
  context: string;
  severity: "urgent" | "important" | "info";
  acknowledged?: boolean;
}

export interface AmbientEvent {
  type: "ambient";
  category: "alarm" | "knock" | "doorbell" | "phone_ring" | "speech" | "silence" | "background_noise";
  score: number;
  timestamp: number;
  label: string;
  severity: "critical" | "important" | "info";
  acknowledged?: boolean;
}

export interface EngineStatusEvent {
  type: "engine_status";
  mode: "local_ai" | "demo";
  state: "ready" | "capturing" | "processing" | "model_loading" | "error" | "offline";
  offline_verified: boolean;
  asr_model: string;
  sound_model: string;
  active_listeners: number;
  message?: string;
  timestamp?: number;
}

export type ResonanceWebSocketEvent = CaptionEvent | NameCalledEvent | AmbientEvent | EngineStatusEvent;

export interface UserSettings {
  user_name: string;
  nicknames: string[];
  colleague_names: string[];
  personal_vocabulary: string[];
  name_alerts_enabled: boolean;
  sound_categories: string[];
  sound_confidence_threshold: number;
  sound_cooldown_seconds: number;
  caption_font_size: "small" | "medium" | "large" | "xlarge";
  high_contrast: boolean;
  reduced_motion: boolean;
  display_language_mode: "all" | "latin_script" | "devanagari";
  transcript_saving_enabled: boolean;
  transcript_retention_days: number;
  quick_talk_presets: string[];
}

export interface TranscriptSession {
  id: string;
  title: string;
  start_time: number;
  end_time: number;
  duration_seconds: number;
  is_demo: boolean;
  captions_count: number;
  languages: string[];
  preview_text: string;
  created_at: number;
  encrypted_at_rest: boolean;
  captions?: CaptionEvent[];
}

export interface ActionItem {
  id: string;
  text: string;
  assignee?: string;
  caption_id?: string;
  completed: boolean;
  source_quote?: string;
}

export interface VocabularyItem {
  term: string;
  correction_for?: string | null;
  added_at: number;
}

export interface BenchmarkMetrics {
  benchmark_timestamp: number;
  is_measured: boolean;
  environment: {
    platform: string;
    offline_only: boolean;
    external_network_calls: number;
  };
  speech_recognition: {
    wer: number;
    cer: number;
    partial_caption_latency_ms: number;
    final_caption_latency_ms: number;
    samples_evaluated: number;
    by_language: Record<string, { wer: number; samples: number }>;
  };
  name_detection: {
    correct_name_alerts: number;
    missed_name_alerts: number;
    false_positive_alerts: number;
    true_negatives: number;
    precision: number;
    recall: number;
    details: Array<{
      text: string;
      expected: boolean;
      actual: boolean;
      matched_name: string | null;
    }>;
  };
  environmental_sound: {
    precision: number;
    recall: number;
    false_alarms_per_hour: number;
    results_by_category: Record<string, {
      predicted: string;
      score: number;
      accurate: boolean;
    }>;
  };
  local_operation: {
    backend_health: string;
    offline_verified: boolean;
    no_external_requests: boolean;
    audio_memory_only: boolean;
    authenticated_encryption: string;
  };
  accessibility_audit: {
    wcag_target: string;
    keyboard_navigation_accessible: boolean;
    caption_resizing_supported: boolean;
    high_contrast_supported: boolean;
    reduced_motion_supported: boolean;
    status: string;
  };
}
