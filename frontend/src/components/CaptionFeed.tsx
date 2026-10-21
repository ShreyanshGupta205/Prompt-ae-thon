"use client";

import React, { useRef, useEffect, useState } from "react";
import { useResonanceStore } from "@/store/useResonanceStore";
import { CaptionEvent } from "@/types";
import {
  Globe,
  Clock,
  User,
  Edit2,
  Check,
  X,
  Volume2,
  PauseCircle,
  PlayCircle,
  Sparkles,
  MessageSquare
} from "lucide-react";

export const CaptionFeed: React.FC = () => {
  const {
    captions,
    partialCaption,
    autoScroll,
    toggleAutoScroll,
    settings,
    editCaption,
    isSessionActive
  } = useResonanceStore();

  const feedEndRef = useRef<HTMLDivElement>(null);
  const feedContainerRef = useRef<HTMLDivElement>(null);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editText, setEditText] = useState<string>("");

  useEffect(() => {
    if (autoScroll && feedEndRef.current) {
      feedEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [captions, partialCaption, autoScroll]);

  const handleStartEdit = (caption: CaptionEvent) => {
    setEditingId(caption.caption_id);
    setEditText(caption.text);
  };

  const handleSaveEdit = (captionId: string) => {
    if (editText.trim()) {
      editCaption(captionId, editText.trim());
    }
    setEditingId(null);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  const formatTime = (epochSeconds: number) => {
    const d = new Date(epochSeconds * 1000);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
  };

  const getLanguageBadge = (lang: string) => {
    switch (lang) {
      case "hi":
        return <span className="bg-emerald-50 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">HINDI</span>;
      case "hi-en":
        return <span className="bg-orange-50 text-orange-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-orange-300">HINGLISH</span>;
      case "en":
      default:
        return <span className="bg-indigo-50 text-indigo-900 text-[10px] font-black px-2 py-0.5 rounded-full border border-indigo-300">ENGLISH</span>;
    }
  };

  const getSpeakerAvatar = (speakerName: string) => {
    const name = speakerName.toLowerCase();
    let bg = "bg-indigo-600 text-white";
    let initial = speakerName.charAt(0).toUpperCase();

    if (name.includes("priya")) {
      bg = "bg-[#2E2A78] text-white";
      initial = "P";
    } else if (name.includes("rahul")) {
      bg = "bg-cyan-700 text-white";
      initial = "R";
    } else if (name.includes("neha")) {
      bg = "bg-purple-700 text-white";
      initial = "N";
    } else if (name.includes("aman")) {
      bg = "bg-amber-600 text-white";
      initial = "A";
    } else if (name.includes("you")) {
      bg = "bg-[#B8530A] text-white";
      initial = "Y";
    }

    return (
      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shadow-xs ${bg}`}>
        {initial}
      </div>
    );
  };

  const isNameInText = (text: string) => {
    if (!settings.name_alerts_enabled) return false;
    const names = [settings.user_name, ...settings.nicknames].filter(Boolean);
    for (const n of names) {
      const regex = new RegExp(`(?<!\\w)${n}(?!\\w)`, "i");
      if (regex.test(text)) return true;
    }
    return false;
  };

  const getFontSizeClass = () => {
    switch (settings.caption_font_size) {
      case "small":
        return "caption-size-small";
      case "large":
        return "caption-size-large";
      case "xlarge":
        return "caption-size-xlarge";
      case "medium":
      default:
        return "caption-size-medium";
    }
  };

  return (
    <div className="flex flex-col h-[540px] bg-white rounded-3xl shadow-sm border border-gray-200/80 overflow-hidden">
      {/* Top Feed Toolbar */}
      <div className="flex items-center justify-between px-6 py-3.5 border-b border-gray-100 bg-[#FBFBFC]">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-gray-800">
              Live Meeting Stream
            </span>
          </div>
          <span className="text-xs text-gray-300">|</span>
          <span className="text-xs text-gray-500 font-medium">
            {captions.length} events logged
          </span>
        </div>

        <div className="flex items-center space-x-2">
          {/* Auto-scroll toggle */}
          <button
            type="button"
            onClick={toggleAutoScroll}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-2xs ${
              autoScroll
                ? "bg-indigo-50 text-[#2E2A78] border border-indigo-200"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
            title={autoScroll ? "Auto-scroll is active. Click to pause." : "Auto-scroll paused. Click to follow stream."}
          >
            {autoScroll ? (
              <>
                <PauseCircle className="w-3.5 h-3.5 text-[#2E2A78]" />
                <span>Auto-scroll Active</span>
              </>
            ) : (
              <>
                <PlayCircle className="w-3.5 h-3.5 text-gray-500" />
                <span>Auto-scroll Paused</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Captions Scroll Area */}
      <div
        ref={feedContainerRef}
        role="region"
        aria-label="Live Meeting Captions"
        tabIndex={0}
        className="flex-1 p-6 overflow-y-auto space-y-4 focus:outline-none"
      >
        {captions.length === 0 && !partialCaption && (
          <div className="h-full flex flex-col items-center justify-center text-center p-8 text-gray-400">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center mb-3.5 border border-indigo-100 shadow-xs">
              <Globe className="w-7 h-7 text-[#2E2A78]/70" />
            </div>
            <h4 className="text-base font-bold text-gray-800">Awaiting Meeting Audio</h4>
            <p className="text-xs text-gray-500 max-w-sm mt-1 leading-relaxed">
              {isSessionActive
                ? "Listening for live English, Hindi, and Hinglish speech. Speak into your microphone or watch the scripted meeting stream."
                : "Click 'Start Session' above to initiate local speech capture or scripted demo playback."}
            </p>
          </div>
        )}

        {captions.map((caption) => {
          const isUser = caption.speaker?.includes("You") || caption.metadata?.quick_talk;
          const mentionsName = isNameInText(caption.text);
          const isEditing = editingId === caption.caption_id;

          return (
            <div
              key={caption.caption_id}
              className={`group rounded-2xl p-4 sm:p-5 transition-all duration-200 border ${
                mentionsName
                  ? "bg-[#FFF3E3] border-[#FED7AA] shadow-md ring-2 ring-orange-400/20"
                  : isUser
                  ? "bg-indigo-50/70 border-indigo-100/90 ml-6 sm:ml-12 shadow-xs"
                  : "bg-white border-gray-100 hover:border-gray-200 hover:shadow-xs"
              }`}
            >
              {/* Caption Header */}
              <div className="flex items-center justify-between mb-2.5">
                <div className="flex items-center space-x-2.5">
                  {getSpeakerAvatar(caption.speaker || "Neutral Speaker")}

                  <span className={`font-bold text-xs ${isUser ? "text-[#2E2A78]" : "text-gray-900"}`}>
                    {caption.speaker || "Neutral Speaker"}
                  </span>

                  <span className="text-[11px] text-gray-400 font-mono flex items-center">
                    <Clock className="w-3 h-3 mr-1 text-gray-400" />
                    {formatTime(caption.timestamp)}
                  </span>

                  {getLanguageBadge(caption.language)}

                  {caption.edited && (
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      CORRECTED
                    </span>
                  )}
                </div>

                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!isEditing && (
                    <button
                      type="button"
                      onClick={() => handleStartEdit(caption)}
                      className="p-1.5 hover:bg-gray-100 text-gray-500 hover:text-gray-900 rounded-lg transition"
                      title="Correct this caption typo"
                      aria-label="Correct caption"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Caption Body */}
              {isEditing ? (
                <div className="mt-2 space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={2}
                    className="w-full text-sm p-3 border-2 border-[#B8530A] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#B8530A]"
                  />
                  <div className="flex items-center space-x-2">
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(caption.caption_id)}
                      className="px-3.5 py-1.5 bg-[#2E2A78] text-white text-xs font-bold rounded-lg flex items-center space-x-1 shadow-sm"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Save Correction</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleCancelEdit}
                      className="px-3 py-1.5 bg-gray-200 text-gray-700 text-xs font-semibold rounded-lg flex items-center space-x-1"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Cancel</span>
                    </button>
                  </div>
                </div>
              ) : (
                <p className={`text-gray-900 font-normal leading-relaxed ${getFontSizeClass()}`}>
                  {mentionsName ? (
                    <span className="font-bold text-gray-950 bg-orange-100/90 px-1.5 py-0.5 rounded-md border border-orange-200">
                      {caption.text}
                    </span>
                  ) : (
                    caption.text
                  )}
                </p>
              )}
            </div>
          );
        })}

        {/* Live Partial Caption */}
        {partialCaption && (
          <div className="rounded-2xl p-5 bg-gradient-to-r from-gray-50 to-indigo-50/40 border-2 border-dashed border-indigo-300 animate-pulse">
            <div className="flex items-center space-x-2 mb-2 text-xs text-indigo-700 font-bold">
              <span className="w-2 h-2 rounded-full bg-indigo-600 animate-ping"></span>
              <span className="uppercase tracking-wider">Listening in real-time...</span>
            </div>
            <p className={`text-gray-600 italic font-medium ${getFontSizeClass()}`}>
              {partialCaption.text}
            </p>
          </div>
        )}

        <div ref={feedEndRef} />
      </div>
    </div>
  );
};
