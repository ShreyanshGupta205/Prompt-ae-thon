"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { AlertBanner } from "@/components/AlertBanner";
import { CaptionFeed } from "@/components/CaptionFeed";
import { QuickTalk } from "@/components/QuickTalk";
import { ConversationRecovery } from "@/components/ConversationRecovery";
import { PresenterPanel } from "@/components/PresenterPanel";
import { useResonanceStore } from "@/store/useResonanceStore";
import {
  Play,
  Square,
  Clock,
  Shield,
  History,
  Layers,
  Settings,
  AlertCircle,
  Cpu,
  Sparkles,
  Radio
} from "lucide-react";

export default function LiveMeetingPage() {
  const {
    mode,
    isSessionActive,
    sessionStartTime,
    sessionTitle,
    startSession,
    stopSession,
    settings,
    micError,
    toggleRecovery,
    togglePresenterPanel
  } = useResonanceStore();

  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  // Timer for session elapsed time
  useEffect(() => {
    let interval: any = null;
    if (isSessionActive && sessionStartTime) {
      interval = setInterval(() => {
        setElapsedSeconds(Math.floor(Date.now() / 1000 - sessionStartTime));
      }, 1000);
    } else {
      setElapsedSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isSessionActive, sessionStartTime]);

  const formatElapsed = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`min-h-screen flex flex-col bg-gradient-to-b from-[#F8F9FA] via-white to-gray-50 ${settings.high_contrast ? "high-contrast" : ""} ${settings.reduced_motion ? "reduced-motion" : ""}`}>
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-7 space-y-6">
        {/* Sleek Session Info & Controls Card */}
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-gray-200/90 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className={`w-3 h-12 rounded-full ${isSessionActive ? "bg-emerald-500 shadow-md animate-pulse" : "bg-gray-300"}`} />
            <div>
              <div className="flex items-center space-x-2.5">
                <h1 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
                  {sessionTitle}
                </h1>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    mode === "demo"
                      ? "bg-amber-100 text-[#B8530A] border border-amber-300"
                      : "bg-emerald-100 text-emerald-800 border border-emerald-300"
                  }`}
                >
                  {mode === "demo" ? "DEMO MODE (SIMULATED)" : "LOCAL AI MODE"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Deaf & Hard-of-Hearing Workplace Collaboration Stream • English, Hindi & Hinglish
              </p>
            </div>
          </div>

          {/* Session Metrics & Status Pills */}
          <div className="flex items-center space-x-2.5 text-xs">
            {/* Elapsed Time */}
            <div className="flex items-center space-x-1.5 px-3.5 py-2 bg-gray-50 rounded-2xl border border-gray-200 text-gray-800 font-mono shadow-2xs">
              <Clock className="w-4 h-4 text-gray-400" />
              <span className="font-bold text-sm">{formatElapsed(elapsedSeconds)}</span>
            </div>

            {/* Privacy & Storage Guarantee */}
            <div
              className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-2xl border font-semibold ${
                settings.transcript_saving_enabled
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-gray-100 text-gray-600 border-gray-200"
              }`}
              title={
                settings.transcript_saving_enabled
                  ? "Explicit consent enabled: Transcript encrypted at rest with Fernet key."
                  : "Memory Only: Audio and captions are processed purely in RAM and discarded on session stop."
              }
            >
              <Shield className="w-3.5 h-3.5" />
              <span>
                {settings.transcript_saving_enabled ? "Saving Encrypted" : "Memory Only (Discarded)"}
              </span>
            </div>

            {/* Conversation Recovery Button */}
            <button
              type="button"
              onClick={toggleRecovery}
              className="flex items-center space-x-1.5 px-3.5 py-2 bg-indigo-50/70 hover:bg-indigo-100 text-[#2E2A78] border border-indigo-200 rounded-2xl font-bold transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-[#B8530A]"
            >
              <History className="w-4 h-4" />
              <span>Recovery Drawer</span>
            </button>

            {/* Start / Stop Session CTA */}
            {isSessionActive ? (
              <button
                type="button"
                onClick={stopSession}
                className="flex items-center space-x-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-2xl shadow-md transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
              >
                <Square className="w-4 h-4" />
                <span>Stop Session</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => startSession("Sprint 24 Review")}
                className="flex items-center space-x-2 px-5 py-2.5 bg-[#2E2A78] hover:bg-[#1f1c54] text-white font-bold rounded-2xl shadow-md transition active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2E2A78]"
              >
                <Play className="w-4 h-4 text-orange-300" />
                <span>Start Session</span>
              </button>
            )}
          </div>
        </div>

        {/* Microphone Error Warning if Any */}
        {micError && (
          <div className="bg-red-50 border border-red-300 rounded-2xl p-4 flex items-center space-x-3 text-xs text-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
            <div>
              <strong>Microphone Access Notice:</strong>
              <p className="mt-0.5">{micError}</p>
            </div>
          </div>
        )}

        {/* Alerts Section (Name Mention & Sound Detection) */}
        <AlertBanner />

        {/* Captions Feed */}
        <CaptionFeed />

        {/* Quick-Talk Section */}
        <QuickTalk />
      </main>

      {/* Slide-out Recovery Drawer */}
      <ConversationRecovery />

      {/* Presenter Panel (Ctrl+Shift+D) */}
      <PresenterPanel />
    </div>
  );
}
