"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Mic,
  ShieldCheck,
  Cpu,
  Activity,
  UserCheck,
  Volume2,
  Lock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Sliders,
  FileText,
  DoorOpen,
  Bell,
  Phone,
  Layers,
  ChevronRight,
  Eye,
  Zap,
  Globe
} from "lucide-react";

export default function LandingPage() {
  const [activeInteractiveTab, setActiveInteractiveTab] = useState<"name" | "sound" | "caption">("name");
  const [simulatedNameAlert, setSimulatedNameAlert] = useState(true);
  const [simulatedSoundAlert, setSimulatedSoundAlert] = useState<string | null>("alarm");

  return (
    <div className="min-h-screen bg-[#0E0C28] text-white flex flex-col selection:bg-[#B8530A] selection:text-white overflow-x-hidden font-sans">
      {/* Top Ambient Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#2E2A78]/60 rounded-full blur-3xl pointer-events-none -z-10 animate-pulse-slow"></div>
      <div className="absolute top-20 right-10 w-80 h-80 bg-[#B8530A]/20 rounded-full blur-3xl pointer-events-none -z-10"></div>

      {/* Modern Navigation Header */}
      <header className="sticky top-0 z-50 bg-[#0E0C28]/85 backdrop-blur-md border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group focus:outline-none">
            <div className="flex items-center space-x-1.5 h-10 px-2.5 py-1.5 bg-white/10 rounded-xl border border-white/10 group-hover:border-[#B8530A]/50 transition-all">
              <span className="w-1.5 bg-[#FFF3E3] rounded-full wave-bar-1"></span>
              <span className="w-1.5 bg-[#B8530A] rounded-full wave-bar-2"></span>
              <span className="w-1.5 bg-[#FFF3E3] rounded-full wave-bar-3"></span>
              <span className="w-1.5 bg-[#B8530A] rounded-full wave-bar-4"></span>
              <span className="w-1.5 bg-[#FFF3E3] rounded-full wave-bar-5"></span>
            </div>
            <div>
              <span className="text-2xl font-black tracking-tight text-white group-hover:text-[#FFF3E3] transition-colors">
                Resonance
              </span>
              <span className="hidden sm:inline-block ml-2.5 text-[11px] text-orange-400 font-bold uppercase tracking-widest bg-orange-950/60 border border-orange-500/30 px-2 py-0.5 rounded-full">
                Privacy-First
              </span>
            </div>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center space-x-1 bg-white/5 border border-white/10 p-1.5 rounded-2xl text-xs font-semibold">
            <Link href="/live" className="px-4 py-2 rounded-xl text-white hover:bg-white/10 transition">
              Live Meeting
            </Link>
            <Link href="/transcripts" className="px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition">
              Encrypted Transcripts
            </Link>
            <Link href="/settings" className="px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition">
              Accessibility Settings
            </Link>
            <Link href="/evidence" className="px-4 py-2 rounded-xl text-gray-300 hover:text-white hover:bg-white/10 transition">
              Evidence & Benchmarks
            </Link>
          </nav>

          {/* Primary Action Button */}
          <div className="flex items-center space-x-3">
            <Link
              href="/live"
              className="px-5 py-2.5 bg-gradient-to-r from-[#B8530A] to-[#d66512] hover:from-[#9c4506] hover:to-[#B8530A] text-white text-xs font-bold rounded-xl shadow-lg shadow-orange-900/40 hover:shadow-orange-900/60 transition-all flex items-center space-x-2 border border-orange-400/30 active:scale-95"
            >
              <span>Launch Live Assistant</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* HERO SECTION */}
      <section className="relative pt-16 pb-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-indigo-950/70 border border-indigo-400/30 text-indigo-200 text-xs font-semibold shadow-inner">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>100% On-Device AI • Zero Cloud Audio Transmission</span>
          </div>

          {/* Main Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-[1.1] text-white">
            Workplace Conversations Without Barriers.{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FED7AA] via-[#FFF3E3] to-[#B8530A]">
              Privacy by Design.
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-xl text-gray-300 leading-relaxed font-normal max-w-3xl mx-auto">
            Empowering deaf and hard-of-hearing employees to lead and participate in live workplace discussions across English, Hindi, and Hinglish. Instant name mentions, environmental sound alerts, and one-tap speech response — running entirely on local device hardware.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/live"
              className="px-8 py-4 bg-gradient-to-r from-[#B8530A] to-[#d66512] hover:from-[#a04706] hover:to-[#B8530A] text-white font-bold text-sm rounded-2xl shadow-xl shadow-orange-950/50 hover:shadow-orange-900/80 transition-all flex items-center space-x-2.5 border border-orange-400/40 active:scale-95"
            >
              <Zap className="w-4 h-4 text-orange-200" />
              <span>Enter Live Meeting Experience</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/evidence"
              className="px-7 py-4 bg-white/10 hover:bg-white/15 text-white font-semibold text-sm rounded-2xl border border-white/20 transition-all flex items-center space-x-2 backdrop-blur-md"
            >
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Inspect Empirical Benchmarks</span>
            </Link>
          </div>

          {/* Trust Metrics Ribbon */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 max-w-4xl mx-auto text-left">
            {[
              { label: "Cloud Audio Transmission", val: "0 Bytes", note: "100% In-Memory Local" },
              { label: "On-Device Latency", val: "<250ms", note: "Real-time stream response" },
              { label: "Substring False Positives", val: "0.0%", note: "Strict word boundaries" },
              { label: "Accessibility Target", val: "WCAG 2.2 AA", note: "High contrast & scalable" }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-2xl p-4 backdrop-blur-sm">
                <div className="text-xs text-gray-400 font-medium">{stat.label}</div>
                <div className="text-2xl font-black text-white mt-1 text-[#FED7AA]">{stat.val}</div>
                <div className="text-[11px] text-gray-400 mt-0.5">{stat.note}</div>
              </div>
            ))}
          </div>
        </div>

        {/* HERO VISUAL MOCKUP */}
        <div className="mt-14 relative rounded-3xl overflow-hidden border border-white/15 shadow-2xl shadow-indigo-950/80 bg-gradient-to-b from-white/10 to-transparent p-2 sm:p-4">
          <div className="relative rounded-2xl overflow-hidden border border-white/10 aspect-video w-full bg-[#18163B]">
            <Image
              src="/hero-visual.jpg"
              alt="Resonance Workplace Accessibility and Privacy-First Architecture"
              fill
              className="object-cover"
              priority
            />

            {/* Floating Interactive Glass Cards */}
            <div className="absolute top-4 left-4 bg-[#2E2A78]/90 backdrop-blur-md border border-white/20 rounded-2xl p-3.5 shadow-xl max-w-xs animate-pulse-slow">
              <div className="flex items-center space-x-2 text-xs font-bold text-orange-300">
                <UserCheck className="w-4 h-4 text-[#B8530A]" />
                <span>NAME DETECTED (WORD-BOUNDARY)</span>
              </div>
              <p className="text-xs text-white mt-1 font-semibold">
                &ldquo;Aman, could you confirm the microphone latency?&rdquo;
              </p>
              <div className="mt-1.5 flex items-center space-x-1 text-[10px] text-emerald-300">
                <CheckCircle2 className="w-3 h-3" />
                <span>Matched &lsquo;Aman&rsquo; • Zero false alarms</span>
              </div>
            </div>

            <div className="absolute bottom-4 right-4 bg-red-950/90 backdrop-blur-md border border-red-500/40 rounded-2xl p-3.5 shadow-xl max-w-xs">
              <div className="flex items-center space-x-2 text-xs font-bold text-red-300">
                <Bell className="w-4 h-4 text-red-400 animate-bounce" />
                <span>CRITICAL SOUND DETECTED</span>
              </div>
              <p className="text-xs text-white mt-1 font-semibold">
                Fire Alarm / Siren • 96% Confidence
              </p>
              <div className="mt-1.5 flex items-center space-x-1 text-[10px] text-gray-300">
                <span>Rate-limiting cooldown active (8s)</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* INTERACTIVE EXPERIENCE SIMULATOR */}
      <section className="py-20 bg-[#141235] border-y border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-950/60 border border-orange-500/30 px-3 py-1 rounded-full">
              Interactive Feature Simulator
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
              Experience Resonance In Action
            </h2>
            <p className="text-sm text-gray-300">
              Test how Resonance handles personal name mentions, environmental sounds, and multilingual captions in real-time.
            </p>
          </div>

          {/* Interactive Demo Container */}
          <div className="max-w-4xl mx-auto bg-[#0E0C28] border border-white/15 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            {/* Simulator Controls */}
            <div className="flex items-center justify-center space-x-2 border-b border-white/10 pb-5">
              <button
                type="button"
                onClick={() => setActiveInteractiveTab("name")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeInteractiveTab === "name"
                    ? "bg-[#B8530A] text-white shadow"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <UserCheck className="w-4 h-4" />
                <span>1. Personal Name Mention</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInteractiveTab("sound")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeInteractiveTab === "sound"
                    ? "bg-[#B8530A] text-white shadow"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Volume2 className="w-4 h-4" />
                <span>2. Environmental Sounds</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveInteractiveTab("caption")}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-1.5 ${
                  activeInteractiveTab === "caption"
                    ? "bg-[#B8530A] text-white shadow"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Globe className="w-4 h-4" />
                <span>3. Multilingual Captions</span>
              </button>
            </div>

            {/* TAB 1: NAME ALERT DEMO */}
            {activeInteractiveTab === "name" && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-400">Target User: <strong className="text-white">Aman (or Ami)</strong></span>
                  <button
                    type="button"
                    onClick={() => setSimulatedNameAlert(!simulatedNameAlert)}
                    className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 text-white font-medium rounded-lg transition"
                  >
                    {simulatedNameAlert ? "Reset Alert" : "Simulate Name Mention"}
                  </button>
                </div>

                {simulatedNameAlert ? (
                  <div className="bg-[#FFF3E3] text-gray-900 border-2 border-[#B8530A] rounded-2xl p-5 shadow-lg flex items-center justify-between animate-pulse-slow">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-[#B8530A] text-white rounded-xl shadow">
                        <UserCheck className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-black uppercase tracking-wider bg-orange-100 text-[#B8530A] px-2 py-0.5 rounded">
                            NAME CALLED
                          </span>
                          <span className="text-xs text-gray-500">Priya (Team Lead)</span>
                        </div>
                        <h4 className="text-lg font-bold text-gray-900 mt-1">
                          Priya: &ldquo;<span className="text-[#B8530A] underline decoration-2">Aman</span>, could you confirm if the microphone latency is within 250ms?&rdquo;
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSimulatedNameAlert(false)}
                      className="px-4 py-2 bg-[#B8530A] hover:bg-[#9c4506] text-white text-xs font-bold rounded-xl shadow transition"
                    >
                      Acknowledge
                    </button>
                  </div>
                ) : (
                  <div className="p-8 text-center text-xs text-gray-400 bg-white/5 rounded-2xl border border-white/10">
                    Click &ldquo;Simulate Name Mention&rdquo; above to preview the high-contrast peach visual alert.
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: SOUND DETECTOR DEMO */}
            {activeInteractiveTab === "sound" && (
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "alarm", label: "Fire Alarm (Critical)", icon: Bell, col: "red" },
                    { id: "knock", label: "Door Knock (Important)", icon: DoorOpen, col: "amber" },
                    { id: "doorbell", label: "Doorbell (Important)", icon: Volume2, col: "blue" },
                    { id: "phone_ring", label: "Phone Ringing", icon: Phone, col: "purple" }
                  ].map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => setSimulatedSoundAlert(s.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition flex items-center space-x-1.5 ${
                        simulatedSoundAlert === s.id
                          ? "bg-white text-gray-900 border-white"
                          : "bg-white/5 text-gray-300 border-white/10 hover:bg-white/10"
                      }`}
                    >
                      <s.icon className="w-3.5 h-3.5" />
                      <span>{s.label}</span>
                    </button>
                  ))}
                </div>

                {simulatedSoundAlert && (
                  <div className="bg-[#FFF3E3] text-gray-900 border-2 border-[#FED7AA] rounded-2xl p-5 shadow-lg flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="p-3 bg-red-600 text-white rounded-xl shadow">
                        <Bell className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-900 px-2 py-0.5 rounded">
                            ENVIRONMENTAL SOUND DETECTED
                          </span>
                          <span className="text-xs text-gray-500 font-medium">Confidence: 96%</span>
                        </div>
                        <h4 className="text-base font-bold text-gray-900 mt-1 capitalize">
                          {simulatedSoundAlert.replace("_", " ")} classified locally via acoustic feature analyzer
                        </h4>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSimulatedSoundAlert(null)}
                      className="px-4 py-2 bg-[#2E2A78] text-white text-xs font-bold rounded-xl shadow"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: CAPTIONS DEMO */}
            {activeInteractiveTab === "caption" && (
              <div className="space-y-3">
                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">Neha (ML Engineer)</span>
                    <span className="bg-orange-100 text-orange-900 text-[10px] font-bold px-2 py-0.2 rounded">Hinglish</span>
                  </div>
                  <p className="text-sm text-gray-200">
                    &ldquo;Yes Priya, English tests are at 94% accuracy, aur Hindi tests bhi humne complete kar liye hain.&rdquo;
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-2xl border border-white/10 space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">Rahul (DevOps)</span>
                    <span className="bg-orange-100 text-orange-900 text-[10px] font-bold px-2 py-0.2 rounded">Hinglish</span>
                  </div>
                  <p className="text-sm text-gray-200">
                    &ldquo;Ye bahut badhiya progress hai. All inference models will run 100% offline on the user&apos;s machine.&rdquo;
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* BENTO GRID: CORE ARCHITECTURAL PILLARS */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12 w-full">
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <span className="text-xs font-bold uppercase tracking-widest text-orange-400 bg-orange-950/60 border border-orange-500/30 px-3 py-1 rounded-full">
            Engineered For Total Inclusivity
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Six Pillars of Privacy-First Accessibility
          </h2>
          <p className="text-sm text-gray-300">
            Built from scratch to eliminate reliance on cloud speech servers while delivering state-of-the-art responsiveness.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-[#141235] border border-white/10 rounded-3xl p-7 hover:border-orange-500/40 transition-all group space-y-3">
            <div className="p-3 bg-[#2E2A78] text-white rounded-2xl w-fit group-hover:scale-105 transition-transform shadow-md">
              <Globe className="w-6 h-6 text-orange-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Multilingual Speech ASR</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Real-time captioning tuned for workplace English, Hindi, and natural code-mixed Hinglish conversations with clear partial vs. final indicators.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-[#141235] border border-white/10 rounded-3xl p-7 hover:border-orange-500/40 transition-all group space-y-3">
            <div className="p-3 bg-[#B8530A] text-white rounded-2xl w-fit group-hover:scale-105 transition-transform shadow-md">
              <UserCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-lg font-bold text-white">Word-Boundary Name Alerts</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              High-visibility peach alerts triggered using exact word boundaries (<code className="bg-black/30 px-1 py-0.5 rounded text-orange-200">\b(name)\b</code>), preventing false positives on words like &ldquo;dramatic&rdquo; or &ldquo;shrewd&rdquo;.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-[#141235] border border-white/10 rounded-3xl p-7 hover:border-orange-500/40 transition-all group space-y-3">
            <div className="p-3 bg-red-900/60 text-red-200 rounded-2xl w-fit group-hover:scale-105 transition-transform shadow-md">
              <Volume2 className="w-6 h-6 text-red-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Environmental Sound Classifier</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Harmonic FFT analysis classifying fire alarms, door knocks, doorbells, and phone ringing with per-category thresholds and cooldown suppression.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bg-[#141235] border border-white/10 rounded-3xl p-7 hover:border-orange-500/40 transition-all group space-y-3">
            <div className="p-3 bg-emerald-900/60 text-emerald-200 rounded-2xl w-fit group-hover:scale-105 transition-transform shadow-md">
              <Mic className="w-6 h-6 text-emerald-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Quick-Talk Offline Response</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Preset buttons and custom text response with automated local browser voice verification (<code className="bg-black/30 px-1 py-0.5 rounded text-emerald-200">localService === true</code>) and visual text fallback.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bg-[#141235] border border-white/10 rounded-3xl p-7 hover:border-orange-500/40 transition-all group space-y-3">
            <div className="p-3 bg-indigo-900/60 text-indigo-200 rounded-2xl w-fit group-hover:scale-105 transition-transform shadow-md">
              <Sparkles className="w-6 h-6 text-indigo-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Conversation Recovery</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Deterministic extractive recaps, action items linked to source caption IDs, inline typo corrections, and local vocabulary training without cloud LLMs.
            </p>
          </div>

          {/* Card 6 */}
          <div className="bg-[#141235] border border-white/10 rounded-3xl p-7 hover:border-orange-500/40 transition-all group space-y-3">
            <div className="p-3 bg-amber-900/60 text-amber-200 rounded-2xl w-fit group-hover:scale-105 transition-transform shadow-md">
              <Lock className="w-6 h-6 text-amber-300" />
            </div>
            <h3 className="text-lg font-bold text-white">Fernet Authenticated Encryption</h3>
            <p className="text-xs text-gray-300 leading-relaxed">
              Memory-only processing by default. When explicitly consented, transcripts are encrypted at rest with Fernet AES-128-CBC + HMAC-SHA256, keeping the secret key isolated.
            </p>
          </div>
        </div>
      </section>

      {/* COMPARISON TABLE: CLOUD VS RESONANCE */}
      <section className="py-20 bg-[#141235] border-t border-white/10 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-white">
              Why Local-First Matters
            </h2>
            <p className="text-sm text-gray-400">
              Comparing conventional cloud meeting transcription against Resonance on-device architecture
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border border-white/10 rounded-2xl overflow-hidden">
              <thead className="bg-[#0E0C28] text-gray-400 font-bold uppercase tracking-wider border-b border-white/10">
                <tr>
                  <th className="p-4">Feature Dimension</th>
                  <th className="p-4 text-red-400">Conventional Cloud AI</th>
                  <th className="p-4 text-emerald-400 font-black">Resonance Local AI</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                <tr>
                  <td className="p-4 font-semibold text-white">Audio Stream Destination</td>
                  <td className="p-4 text-red-300">Sent across internet to third-party servers</td>
                  <td className="p-4 text-emerald-300 font-bold">100% On-device RAM; zero network leakage</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Internet Dependency</td>
                  <td className="p-4 text-red-300">Requires uninterrupted high-speed cloud access</td>
                  <td className="p-4 text-emerald-300 font-bold">Fully functional offline without connection</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Name Detection</td>
                  <td className="p-4 text-red-300">Frequent substring errors (&ldquo;dramatic&rdquo; &rarr; alert)</td>
                  <td className="p-4 text-emerald-300 font-bold">Strict word-boundary matching with phonetic variants</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Environmental Sound Detection</td>
                  <td className="p-4 text-red-300">None (speech-only filters discard ambient noise)</td>
                  <td className="p-4 text-emerald-300 font-bold">Parallel acoustic classifier for alarms, knocks & bells</td>
                </tr>
                <tr>
                  <td className="p-4 font-semibold text-white">Transcript Storage At Rest</td>
                  <td className="p-4 text-red-300">Stored in vendor cloud database</td>
                  <td className="p-4 text-emerald-300 font-bold">Discarded by default; Fernet AES-128 encrypted with consent</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="mt-auto border-t border-white/10 py-12 px-4 sm:px-6 lg:px-8 text-xs text-gray-400 max-w-7xl mx-auto w-full flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="space-y-1 text-center sm:text-left">
          <div className="font-bold text-white text-sm">Resonance — Privacy-First AI Workplace Accessibility Platform</div>
          <p className="max-w-xl text-[11px] text-gray-400">
            Resonance is an accessibility assistant. It does not replace certified sign language interpreters and does not make statutory legal safety guarantees.
          </p>
        </div>

        <div className="flex items-center space-x-6 text-xs font-semibold text-gray-300">
          <Link href="/live" className="hover:text-white transition">Live Meeting</Link>
          <Link href="/transcripts" className="hover:text-white transition">Transcripts</Link>
          <Link href="/settings" className="hover:text-white transition">Settings</Link>
          <Link href="/evidence" className="hover:text-white transition">Evidence</Link>
        </div>
      </footer>
    </div>
  );
}
