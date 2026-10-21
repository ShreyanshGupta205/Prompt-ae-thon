"use client";

import React, { useState } from "react";
import { Header } from "@/components/Header";
import { useResonanceStore } from "@/store/useResonanceStore";
import {
  Sliders,
  User,
  Bell,
  Volume2,
  Type,
  Shield,
  RotateCcw,
  Plus,
  X,
  Check,
  Eye,
  SlidersHorizontal
} from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings, resetSettings } = useResonanceStore();

  const [newNickname, setNewNickname] = useState("");
  const [newColleague, setNewColleague] = useState("");
  const [newPreset, setNewPreset] = useState("");
  const [savedFeedback, setSavedFeedback] = useState(false);

  const triggerFeedback = () => {
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2500);
  };

  const handleAddNickname = () => {
    if (!newNickname.trim()) return;
    const clean = newNickname.trim();
    if (!settings.nicknames.includes(clean)) {
      updateSettings({ nicknames: [...settings.nicknames, clean] });
      setNewNickname("");
      triggerFeedback();
    }
  };

  const handleRemoveNickname = (name: string) => {
    updateSettings({ nicknames: settings.nicknames.filter((n) => n !== name) });
    triggerFeedback();
  };

  const handleAddColleague = () => {
    if (!newColleague.trim()) return;
    const clean = newColleague.trim();
    if (!settings.colleague_names.includes(clean)) {
      updateSettings({ colleague_names: [...settings.colleague_names, clean] });
      setNewColleague("");
      triggerFeedback();
    }
  };

  const handleRemoveColleague = (name: string) => {
    updateSettings({ colleague_names: settings.colleague_names.filter((n) => n !== name) });
    triggerFeedback();
  };

  const handleAddPreset = () => {
    if (!newPreset.trim()) return;
    updateSettings({ quick_talk_presets: [...settings.quick_talk_presets, newPreset.trim()] });
    setNewPreset("");
    triggerFeedback();
  };

  const handleRemovePreset = (idx: number) => {
    const updated = [...settings.quick_talk_presets];
    updated.splice(idx, 1);
    updateSettings({ quick_talk_presets: updated });
    triggerFeedback();
  };

  const toggleSoundCategory = (cat: string) => {
    const current = settings.sound_categories;
    const next = current.includes(cat)
      ? current.filter((c) => c !== cat)
      : [...current, cat];
    updateSettings({ sound_categories: next });
    triggerFeedback();
  };

  return (
    <div className={`min-h-screen flex flex-col ${settings.high_contrast ? "high-contrast" : ""} ${settings.reduced_motion ? "reduced-motion" : ""}`}>
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title & Actions */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Personal Accessibility Settings
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Configure name variants, environmental alerts, caption typography, and privacy preferences
            </p>
          </div>

          <div className="flex items-center space-x-3">
            {savedFeedback && (
              <span className="flex items-center space-x-1 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
                <Check className="w-3.5 h-3.5" />
                <span>Saved locally</span>
              </span>
            )}

            <button
              type="button"
              onClick={resetSettings}
              className="flex items-center space-x-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-semibold transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restore Defaults</span>
            </button>
          </div>
        </div>

        {/* SECTION 1: NAME RECOGNITION & ALERTS */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-base">
            <User className="w-5 h-5 text-[#2E2A78]" />
            <h2>Name Recognition & Nickname Matching</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Primary User Name
              </label>
              <input
                type="text"
                value={settings.user_name}
                onChange={(e) => {
                  updateSettings({ user_name: e.target.value });
                  triggerFeedback();
                }}
                className="w-full text-sm px-3.5 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8530A]"
                placeholder="e.g. Aman"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Resonance matches exact word boundaries to avoid false positives (e.g. &ldquo;shrewd&rdquo; will not trigger on &ldquo;shre&rdquo;).
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1">
                Name Alert Notification Toggle
              </label>
              <div className="flex items-center space-x-3 mt-2">
                <input
                  type="checkbox"
                  id="name-alert-toggle"
                  checked={settings.name_alerts_enabled}
                  onChange={(e) => {
                    updateSettings({ name_alerts_enabled: e.target.checked });
                    triggerFeedback();
                  }}
                  className="h-5 w-5 rounded border-gray-300 text-[#B8530A] focus:ring-[#B8530A]"
                />
                <label htmlFor="name-alert-toggle" className="text-xs text-gray-700 font-medium">
                  Show peach alert banner and visual pulse when name is mentioned
                </label>
              </div>
            </div>
          </div>

          {/* Nickname Variants Chips */}
          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">
              Configured Nicknames & Phonetic Variants
            </label>
            <div className="flex flex-wrap gap-2 mb-2">
              {settings.nicknames.map((nick) => (
                <span
                  key={nick}
                  className="inline-flex items-center space-x-1.5 px-3 py-1 bg-[#FFF3E3] text-[#B8530A] border border-[#FED7AA] rounded-lg text-xs font-semibold"
                >
                  <span>{nick}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveNickname(nick)}
                    className="hover:text-red-700"
                    aria-label={`Remove nickname ${nick}`}
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}
            </div>

            <div className="flex items-center space-x-2 max-w-sm">
              <input
                type="text"
                value={newNickname}
                onChange={(e) => setNewNickname(e.target.value)}
                placeholder="Add nickname variant..."
                className="flex-1 text-xs px-3 py-1.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8530A]"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddNickname())}
              />
              <button
                type="button"
                onClick={handleAddNickname}
                className="px-3 py-1.5 bg-[#2E2A78] text-white rounded-lg text-xs font-semibold flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>
        </section>

        {/* SECTION 2: ENVIRONMENTAL SOUND ALERTS */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-base">
            <Volume2 className="w-5 h-5 text-[#2E2A78]" />
            <h2>Environmental Sound Alerts</h2>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-700 block mb-2">
              Monitored Sound Categories
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: "alarm", label: "Fire Alarm / Siren", desc: "High pitch urgent tone" },
                { id: "knock", label: "Door Knock", desc: "Transient impulse" },
                { id: "doorbell", label: "Doorbell / Chime", desc: "Dual tone harmonic" },
                { id: "phone_ring", label: "Phone Ringing", desc: "Periodic cadence" }
              ].map((cat) => {
                const checked = settings.sound_categories.includes(cat.id);
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => toggleSoundCategory(cat.id)}
                    className={`p-3 rounded-xl border text-left transition ${
                      checked
                        ? "bg-[#FFF3E3] border-[#B8530A] text-[#B8530A]"
                        : "bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <div className="font-bold text-xs">{cat.label}</div>
                    <div className="text-[11px] opacity-80 mt-0.5">{cat.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Threshold & Cooldown Sliders */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Confidence Threshold
                </label>
                <span className="text-xs font-mono font-semibold text-[#B8530A]">
                  {Math.round(settings.sound_confidence_threshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.50"
                max="0.95"
                step="0.05"
                value={settings.sound_confidence_threshold}
                onChange={(e) => {
                  updateSettings({ sound_confidence_threshold: parseFloat(e.target.value) });
                  triggerFeedback();
                }}
                className="w-full accent-[#B8530A]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Higher values reduce false alarms; lower values increase sensitivity.
              </p>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-gray-700">
                  Alert Cooldown Window
                </label>
                <span className="text-xs font-mono font-semibold text-[#2E2A78]">
                  {settings.sound_cooldown_seconds}s
                </span>
              </div>
              <input
                type="range"
                min="3.0"
                max="20.0"
                step="1.0"
                value={settings.sound_cooldown_seconds}
                onChange={(e) => {
                  updateSettings({ sound_cooldown_seconds: parseFloat(e.target.value) });
                  triggerFeedback();
                }}
                className="w-full accent-[#2E2A78]"
              />
              <p className="text-[11px] text-gray-500 mt-1">
                Suppresses duplicate alerts for the same continuous sound.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 3: CAPTION DISPLAY & ACCESSIBILITY */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-base">
            <Type className="w-5 h-5 text-[#2E2A78]" />
            <h2>Visual & Typography Accessibility (WCAG 2.2 AA)</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Caption Size */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Caption Font Size
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                {(["small", "medium", "large", "xlarge"] as const).map((sz) => (
                  <button
                    key={sz}
                    type="button"
                    onClick={() => {
                      updateSettings({ caption_font_size: sz });
                      triggerFeedback();
                    }}
                    className={`py-2 px-3 rounded-lg border font-semibold capitalize transition ${
                      settings.caption_font_size === sz
                        ? "bg-[#2E2A78] text-white border-[#2E2A78]"
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    }`}
                  >
                    {sz}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast Mode */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                High Contrast Theme
              </label>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ high_contrast: !settings.high_contrast });
                  triggerFeedback();
                }}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                  settings.high_contrast
                    ? "bg-black text-white border-black"
                    : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <span>Enhanced Contrast 7:1</span>
                <span className="font-bold">{settings.high_contrast ? "ON" : "OFF"}</span>
              </button>
              <p className="text-[11px] text-gray-500 mt-1">
                Increases text blackness and strengthens card border outlines.
              </p>
            </div>

            {/* Reduced Motion */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-2">
                Reduced Motion
              </label>
              <button
                type="button"
                onClick={() => {
                  updateSettings({ reduced_motion: !settings.reduced_motion });
                  triggerFeedback();
                }}
                className={`w-full py-2.5 px-4 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                  settings.reduced_motion
                    ? "bg-[#B8530A] text-white border-[#B8530A]"
                    : "bg-gray-50 text-gray-800 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <span>Disable Motion Effects</span>
                <span className="font-bold">{settings.reduced_motion ? "ON" : "OFF"}</span>
              </button>
              <p className="text-[11px] text-gray-500 mt-1">
                Disables CSS pulses, bouncing icons, and smooth transitions.
              </p>
            </div>
          </div>
        </section>

        {/* SECTION 4: TRANSCRIPT RETENTION & PRIVACY CONSENT */}
        <section className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 space-y-4">
          <div className="flex items-center space-x-2 text-indigo-900 font-bold text-base">
            <Shield className="w-5 h-5 text-[#2E2A78]" />
            <h2>Transcript Storage & Encryption Consent</h2>
          </div>

          <div className="p-4 bg-gray-50 rounded-xl border border-gray-200 space-y-3">
            <div className="flex items-start space-x-3">
              <input
                type="checkbox"
                id="save-consent-toggle"
                checked={settings.transcript_saving_enabled}
                onChange={(e) => {
                  updateSettings({ transcript_saving_enabled: e.target.checked });
                  triggerFeedback();
                }}
                className="mt-1 h-5 w-5 rounded border-gray-300 text-[#B8530A] focus:ring-[#B8530A]"
              />
              <div>
                <label htmlFor="save-consent-toggle" className="text-xs font-bold text-gray-900 block">
                  Enable Explicit Local Transcript Saving
                </label>
                <p className="text-xs text-gray-600 mt-0.5">
                  When <strong>disabled</strong>, all audio and captions are processed strictly in volatile RAM and immediately discarded.
                  When <strong>enabled</strong>, transcripts are encrypted locally at rest with authenticated Fernet AES-128-CBC + HMAC-SHA256. The encryption key is isolated in a secret file and never saved inside the database.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
