"use client";

import React, { useState, useEffect } from "react";
import { useResonanceStore } from "@/store/useResonanceStore";
import {
  MessageSquare,
  Send,
  Volume2,
  VolumeX,
  Sparkles,
  Info
} from "lucide-react";

export const QuickTalk: React.FC = () => {
  const {
    settings,
    sendQuickTalk,
    localTtsAvailable,
    checkLocalTts
  } = useResonanceStore();

  const [customText, setCustomText] = useState("");
  const [lastSpoken, setLastSpoken] = useState<string | null>(null);

  useEffect(() => {
    checkLocalTts();
  }, [checkLocalTts]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    sendQuickTalk(text.trim());
    setLastSpoken(text.trim());
    setCustomText("");
    setTimeout(() => setLastSpoken(null), 3000);
  };

  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-200 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-[#FFF3E3] text-[#B8530A] rounded-lg">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">
              Quick-Talk Response
            </h3>
            <p className="text-xs text-gray-500">
              One-tap responses or custom phrases voiced to participants
            </p>
          </div>
        </div>

        {/* Local Voice Status Indicator */}
        <div className="flex items-center space-x-1.5 text-xs">
          {localTtsAvailable ? (
            <span className="flex items-center space-x-1 text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <Volume2 className="w-3.5 h-3.5" />
              <span>Offline Local TTS Available</span>
            </span>
          ) : (
            <span className="flex items-center space-x-1 text-amber-800 font-medium bg-amber-50 px-2 py-0.5 rounded border border-amber-200" title="Device has no verified local offline synthesis voice. Output will appear in live caption feed as text.">
              <VolumeX className="w-3.5 h-3.5" />
              <span>Visual Text Response (Local TTS Voice Missing)</span>
            </span>
          )}
        </div>
      </div>

      {/* Preset Buttons Grid */}
      <div className="flex flex-wrap gap-2">
        {settings.quick_talk_presets.map((phrase, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(phrase)}
            className="px-3.5 py-2 bg-[#F8F9FA] hover:bg-indigo-50 hover:text-[#2E2A78] hover:border-indigo-200 border border-gray-200 text-gray-800 rounded-xl text-xs font-semibold transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-[#B8530A]"
          >
            {phrase}
          </button>
        ))}
      </div>

      {/* Custom Phrase Form */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend(customText);
        }}
        className="flex items-center space-x-2"
      >
        <input
          type="text"
          value={customText}
          onChange={(e) => setCustomText(e.target.value)}
          placeholder="Type a custom reply to speak in the meeting..."
          className="flex-1 px-4 py-2 bg-[#F8F9FA] border border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#B8530A] focus:bg-white"
        />
        <button
          type="submit"
          disabled={!customText.trim()}
          className="px-4 py-2 bg-[#2E2A78] hover:bg-[#1f1c54] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold rounded-xl transition flex items-center space-x-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-[#B8530A]"
        >
          <Send className="w-4 h-4" />
          <span>Speak</span>
        </button>
      </form>

      {lastSpoken && (
        <div className="flex items-center space-x-2 text-xs text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200 animate-fade-in">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Shared with meeting: &ldquo;{lastSpoken}&rdquo;</span>
        </div>
      )}
    </div>
  );
};
