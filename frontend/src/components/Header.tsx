"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useResonanceStore } from "@/store/useResonanceStore";
import {
  Mic,
  MicOff,
  ShieldCheck,
  Cpu,
  Sparkles,
  Sliders,
  FileText,
  Activity,
  Layers,
  Home
} from "lucide-react";

export const Header: React.FC = () => {
  const pathname = usePathname();
  const {
    mode,
    setMode,
    isSessionActive,
    isMicActive,
    wsConnected,
    engineStatus,
    togglePresenterPanel,
    connectWebSocket
  } = useResonanceStore();

  useEffect(() => {
    connectWebSocket();
  }, [connectWebSocket]);

  // Global keydown listener for Ctrl+Shift+D
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "D" || e.key === "d")) {
        e.preventDefault();
        togglePresenterPanel();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePresenterPanel]);

  const navLinks = [
    { href: "/", label: "Overview", icon: Home },
    { href: "/live", label: "Live Meeting", icon: Activity },
    { href: "/transcripts", label: "Transcripts & Privacy", icon: FileText },
    { href: "/settings", label: "Accessibility Settings", icon: Sliders },
    { href: "/evidence", label: "Evidence & Benchmarks", icon: ShieldCheck }
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#2E2A78]/95 backdrop-blur-md text-white shadow-lg border-b border-[#1e1a5c]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-[#B8530A] rounded-xl p-1">
              {/* Waveform Bar Logo */}
              <div className="flex items-center space-x-1.5 h-9 px-2.5 py-1.5 bg-white/10 rounded-xl border border-white/15 group-hover:border-[#B8530A]/60 transition-all">
                <span className={`w-1 bg-[#FFF3E3] rounded-full transition-all duration-300 ${isMicActive ? "wave-bar-1" : "h-3"}`}></span>
                <span className={`w-1 bg-[#B8530A] rounded-full transition-all duration-300 ${isMicActive ? "wave-bar-2" : "h-5"}`}></span>
                <span className={`w-1 bg-[#FFF3E3] rounded-full transition-all duration-300 ${isMicActive ? "wave-bar-3" : "h-6"}`}></span>
                <span className={`w-1 bg-[#B8530A] rounded-full transition-all duration-300 ${isMicActive ? "wave-bar-4" : "h-4"}`}></span>
                <span className={`w-1 bg-[#FFF3E3] rounded-full transition-all duration-300 ${isMicActive ? "wave-bar-5" : "h-2"}`}></span>
              </div>
              <div>
                <span className="font-extrabold text-xl tracking-tight text-white group-hover:text-[#FFF3E3] transition-colors">
                  Resonance
                </span>
                <span className="hidden sm:inline-block ml-2 text-[10px] text-orange-300 uppercase tracking-widest font-black border-l border-indigo-400/40 pl-2">
                  Privacy-First Accessibility
                </span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-1 bg-black/15 p-1 rounded-xl border border-white/10" aria-label="Main Navigation">
            {navLinks.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all focus:ring-2 focus:ring-[#B8530A] ${
                    isActive
                      ? "bg-white/20 text-white shadow-xs border border-white/20 font-bold"
                      : "text-indigo-100 hover:bg-white/10 hover:text-white"
                  }`}
                  aria-current={isActive ? "page" : undefined}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Right Status Controls */}
          <div className="flex items-center space-x-2.5">
            {/* Mode Switcher */}
            <div className="flex items-center bg-black/30 p-1 rounded-xl border border-white/15 text-xs">
              <button
                type="button"
                onClick={() => setMode("demo")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all ${
                  mode === "demo"
                    ? "bg-[#B8530A] text-white shadow-md border border-orange-400/40"
                    : "text-indigo-200 hover:text-white"
                }`}
                title="Demo Mode uses scripted captions and deterministic events"
              >
                Demo (Simulated)
              </button>
              <button
                type="button"
                onClick={() => setMode("local_ai")}
                className={`px-2.5 py-1 rounded-lg font-bold transition-all flex items-center space-x-1 ${
                  mode === "local_ai"
                    ? "bg-emerald-700 text-white shadow-md border border-emerald-500/40"
                    : "text-indigo-200 hover:text-white"
                }`}
                title="Local AI Mode uses real on-device model inference"
              >
                <Cpu className="w-3.5 h-3.5" />
                <span>Local AI</span>
              </button>
            </div>

            {/* Offline Verification Badge */}
            <div className="hidden xl:flex items-center space-x-1.5 px-2.5 py-1 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-xs font-semibold text-emerald-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Offline Verified</span>
            </div>

            {/* Mic Indicator */}
            <div
              className={`flex items-center space-x-1 px-2.5 py-1 rounded-lg text-xs font-bold ${
                isMicActive
                  ? "bg-emerald-900/60 text-emerald-200 border border-emerald-500/50 animate-pulse"
                  : "bg-white/10 text-indigo-200 border border-white/10"
              }`}
            >
              {isMicActive ? <Mic className="w-3.5 h-3.5 text-emerald-300" /> : <MicOff className="w-3.5 h-3.5 text-gray-400" />}
              <span className="hidden sm:inline">{isMicActive ? "Mic Active" : "Mic Idle"}</span>
            </div>

            {/* Presenter Panel Shortcut Button */}
            <button
              type="button"
              onClick={togglePresenterPanel}
              className="p-1.5 bg-white/10 hover:bg-[#B8530A] text-white rounded-lg transition-colors border border-white/10 text-xs flex items-center space-x-1"
              title="Presenter Panel (Ctrl+Shift+D)"
              aria-label="Toggle Presenter Panel"
            >
              <Layers className="w-4 h-4" />
              <span className="hidden sm:inline text-[11px] font-mono">Ctrl+Shift+D</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
