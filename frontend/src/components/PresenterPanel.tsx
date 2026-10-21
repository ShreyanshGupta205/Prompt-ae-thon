"use client";

import React, { useState } from "react";
import { useResonanceStore } from "@/store/useResonanceStore";
import {
  Play,
  Pause,
  RotateCcw,
  Bell,
  DoorOpen,
  Volume2,
  Phone,
  UserCheck,
  X,
  AlertTriangle,
  Info
} from "lucide-react";

export const PresenterPanel: React.FC = () => {
  const {
    presenterPanelOpen,
    setPresenterPanelOpen,
    mode,
    setMode,
    triggerDemoCommand,
    settings,
    updateSettings
  } = useResonanceStore();

  const [testName, setTestName] = useState(settings.user_name || "Aman");
  const [isPlaying, setIsPlaying] = useState(true);

  if (!presenterPanelOpen) return null;

  const handlePlayPause = () => {
    if (isPlaying) {
      triggerDemoCommand("pause");
      setIsPlaying(false);
    } else {
      triggerDemoCommand("resume");
      setIsPlaying(true);
    }
  };

  const handleRestart = () => {
    triggerDemoCommand("restart");
    setIsPlaying(true);
  };

  const handleTrigger = (eventType: string) => {
    triggerDemoCommand("trigger_event", eventType, testName);
  };

  return (
    <div
      role="dialog"
      aria-labelledby="presenter-panel-title"
      className="fixed bottom-6 right-6 z-50 w-96 bg-[#2E2A78] text-white rounded-xl shadow-2xl border-2 border-[#B8530A] overflow-hidden animate-fade-in"
    >
      {/* Top Banner Warning */}
      <div className="bg-[#B8530A] px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 text-white" />
          <span className="text-xs font-bold uppercase tracking-wider text-white">
            Presenter Panel — SIMULATED DATA
          </span>
        </div>
        <button
          onClick={() => setPresenterPanelOpen(false)}
          className="text-white hover:text-orange-200 p-0.5 rounded focus:outline-none focus:ring-2 focus:ring-white"
          aria-label="Close Presenter Panel"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-start space-x-2 p-2.5 bg-white/10 rounded-lg text-xs text-indigo-100">
          <Info className="w-4 h-4 flex-shrink-0 text-orange-300 mt-0.5" />
          <p>
            Controls the deterministic 2–3 min Sprint Review scenario.
            Triggered events are labeled as simulated and will not affect Local AI Mode.
          </p>
        </div>

        {/* Script Flow Controls */}
        <div>
          <label className="text-xs font-semibold text-indigo-200 block mb-1.5 uppercase tracking-wider">
            Script Playback
          </label>
          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={handlePlayPause}
              className="flex-1 flex items-center justify-center space-x-1.5 py-2 px-3 bg-white/15 hover:bg-white/25 text-white font-medium rounded-lg text-xs transition"
            >
              {isPlaying ? (
                <>
                  <Pause className="w-3.5 h-3.5" />
                  <span>Pause Script</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Resume Script</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={handleRestart}
              className="flex items-center space-x-1.5 py-2 px-3 bg-white/15 hover:bg-white/25 text-white font-medium rounded-lg text-xs transition"
              title="Restart demo script from beginning"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Restart</span>
            </button>
          </div>
        </div>

        {/* Name Alert Testing */}
        <div>
          <label className="text-xs font-semibold text-indigo-200 block mb-1.5 uppercase tracking-wider">
            Test Name Mention
          </label>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              placeholder="Target Name"
              className="flex-1 bg-white/15 border border-white/20 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-indigo-300 focus:outline-none focus:ring-2 focus:ring-[#B8530A]"
            />
            <button
              type="button"
              onClick={() => handleTrigger("name_call")}
              className="flex items-center space-x-1 py-1.5 px-3 bg-[#B8530A] hover:bg-[#9c4506] text-white rounded-lg text-xs font-semibold transition"
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Call Name</span>
            </button>
          </div>
        </div>

        {/* Environmental Sound Triggers */}
        <div>
          <label className="text-xs font-semibold text-indigo-200 block mb-2 uppercase tracking-wider">
            Trigger Environmental Sounds
          </label>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <button
              type="button"
              onClick={() => handleTrigger("alarm")}
              className="flex items-center space-x-2 p-2 bg-red-950/40 hover:bg-red-900/60 border border-red-500/50 rounded-lg text-red-200 font-medium transition"
            >
              <Bell className="w-4 h-4 text-red-400" />
              <span>Fire Alarm</span>
            </button>

            <button
              type="button"
              onClick={() => handleTrigger("knock")}
              className="flex items-center space-x-2 p-2 bg-amber-950/40 hover:bg-amber-900/60 border border-amber-500/50 rounded-lg text-amber-200 font-medium transition"
            >
              <DoorOpen className="w-4 h-4 text-amber-400" />
              <span>Door Knock</span>
            </button>

            <button
              type="button"
              onClick={() => handleTrigger("doorbell")}
              className="flex items-center space-x-2 p-2 bg-blue-950/40 hover:bg-blue-900/60 border border-blue-500/50 rounded-lg text-blue-200 font-medium transition"
            >
              <Volume2 className="w-4 h-4 text-blue-400" />
              <span>Doorbell</span>
            </button>

            <button
              type="button"
              onClick={() => handleTrigger("phone_ring")}
              className="flex items-center space-x-2 p-2 bg-purple-950/40 hover:bg-purple-900/60 border border-purple-500/50 rounded-lg text-purple-200 font-medium transition"
            >
              <Phone className="w-4 h-4 text-purple-400" />
              <span>Phone Ring</span>
            </button>
          </div>
        </div>

        {/* Mode verification footer */}
        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-indigo-200">
          <span>Active Mode: <strong className="text-white">{mode.toUpperCase()}</strong></span>
          <span className="font-mono">Shortcut: Ctrl+Shift+D</span>
        </div>
      </div>
    </div>
  );
};
