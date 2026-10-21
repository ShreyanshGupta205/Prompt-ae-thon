"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { useResonanceStore } from "@/store/useResonanceStore";
import { TranscriptSession, CaptionEvent } from "@/types";
import {
  FileText,
  Search,
  Trash2,
  Lock,
  Unlock,
  Calendar,
  Clock,
  ShieldCheck,
  AlertTriangle,
  Download,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Info
} from "lucide-react";

export default function TranscriptsPage() {
  const { settings } = useResonanceStore();
  const [sessions, setSessions] = useState<TranscriptSession[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [activeSessionDetails, setActiveSessionDetails] = useState<TranscriptSession | null>(null);
  const [loading, setLoading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchSessions = async (query = "") => {
    setLoading(true);
    try {
      const res = await fetch(`http://localhost:8000/api/transcripts?q=${encodeURIComponent(query)}`);
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch (err) {
      console.warn("Failed to fetch sessions from backend:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(searchQuery);
  }, [searchQuery]);

  const handleExpand = async (sessionId: string) => {
    if (expandedId === sessionId) {
      setExpandedId(null);
      setActiveSessionDetails(null);
      return;
    }
    setExpandedId(sessionId);
    try {
      const res = await fetch(`http://localhost:8000/api/transcripts/${sessionId}`);
      if (res.ok) {
        const details = await res.json();
        setActiveSessionDetails(details);
      }
    } catch (err) {
      console.warn("Failed to load session details:", err);
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm("Are you sure you want to permanently delete this session transcript?")) return;
    setDeletingId(sessionId);
    try {
      const res = await fetch(`http://localhost:8000/api/transcripts/${sessionId}`, { method: "DELETE" });
      if (res.ok) {
        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        if (expandedId === sessionId) {
          setExpandedId(null);
          setActiveSessionDetails(null);
        }
      }
    } catch (err) {
      console.warn("Delete session error:", err);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm("Permanently delete ALL saved sessions and decrypted keys from local storage? This action cannot be undone.")) return;
    try {
      const res = await fetch("http://localhost:8000/api/transcripts", { method: "DELETE" });
      if (res.ok) {
        setSessions([]);
        setExpandedId(null);
        setActiveSessionDetails(null);
      }
    } catch (err) {
      console.warn("Delete all error:", err);
    }
  };

  const exportSessionJson = (session: TranscriptSession) => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(session, null, 2));
    const dlAnchorElem = document.createElement("a");
    dlAnchorElem.setAttribute("href", dataStr);
    dlAnchorElem.setAttribute("download", `resonance_transcript_${session.id}.json`);
    dlAnchorElem.click();
  };

  return (
    <div className={`min-h-screen flex flex-col ${settings.high_contrast ? "high-contrast" : ""} ${settings.reduced_motion ? "reduced-motion" : ""}`}>
      <Header />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Title and Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Meeting Transcripts & Privacy Controls
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Encrypted session history with authenticated Fernet AES-128 key separation
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => fetchSessions(searchQuery)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition"
              title="Refresh sessions"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            {sessions.length > 0 && (
              <button
                type="button"
                onClick={handleDeleteAll}
                className="flex items-center space-x-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold border border-red-200 transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete All Transcripts</span>
              </button>
            )}
          </div>
        </div>

        {/* Privacy Architecture Notice */}
        <div className="bg-[#FFF3E3] border border-[#FED7AA] rounded-2xl p-4 text-xs text-gray-800 space-y-1.5 shadow-xs">
          <div className="flex items-center space-x-2 font-bold text-[#B8530A]">
            <ShieldCheck className="w-4 h-4 text-[#B8530A]" />
            <span>Local Privacy Guarantee & Encryption Architecture</span>
          </div>
          <p className="leading-relaxed">
            All audio is processed strictly in volatile device memory and discarded by default.
            Transcripts are only persisted when explicit saving consent is enabled. Stored records are encrypted at rest with
            authenticated Fernet (AES-128 in CBC mode with SHA-256 HMAC). The encryption key is isolated in <code className="bg-orange-100 px-1 py-0.5 rounded">backend/secrets/resonance.key</code> and is never stored in the database.
          </p>
          <p className="text-[11px] text-gray-500 italic">
            Disclaimer: Local encryption reduces third-party exposure, but Resonance does not guarantee safety, replace legal interpreters, or claim automatic statutory compliance.
          </p>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search saved sessions by title or content..."
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B8530A] shadow-xs"
          />
        </div>

        {/* Sessions List */}
        {sessions.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-gray-200 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-full bg-indigo-50 text-[#2E2A78] mx-auto flex items-center justify-center">
              <FileText className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-gray-900">No Transcripts Found</h3>
            <p className="text-xs text-gray-500 max-w-md mx-auto">
              {searchQuery
                ? `No sessions matched "${searchQuery}". Try a different query.`
                : "No saved meetings. By default, audio is discarded. Enable 'Explicit Transcript Saving' in Settings or run a Demo session to record history."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {sessions.map((session) => {
              const isExpanded = expandedId === session.id;

              return (
                <div
                  key={session.id}
                  className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden transition-all duration-200"
                >
                  {/* Session Header Card */}
                  <div
                    onClick={() => handleExpand(session.id)}
                    className="p-5 flex flex-wrap items-center justify-between gap-4 cursor-pointer hover:bg-gray-50 transition"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h2 className="text-base font-bold text-gray-900">
                          {session.title}
                        </h2>
                        {session.is_demo ? (
                          <span className="px-2 py-0.5 bg-amber-100 text-[#B8530A] text-[10px] font-bold rounded uppercase tracking-wider">
                            Sample Demo Data
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded uppercase tracking-wider flex items-center space-x-1">
                            <Lock className="w-3 h-3" />
                            <span>Encrypted at Rest</span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-3 text-xs text-gray-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5" />
                          <span>{new Date(session.start_time * 1000).toLocaleDateString()}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>{Math.round(session.duration_seconds)}s</span>
                        </span>
                        <span>•</span>
                        <span>{session.captions_count} captions</span>
                      </div>

                      {session.preview_text && (
                        <p className="text-xs text-gray-600 line-clamp-1 italic pt-1">
                          &ldquo;{session.preview_text}&rdquo;
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-3">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteSession(session.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg transition"
                        title="Delete session"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="p-1 rounded-md text-gray-400">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </div>
                    </div>
                  </div>

                  {/* Expanded Decrypted Transcript View */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 bg-[#F8F9FA] p-5 space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-xs text-gray-700 font-semibold">
                          <Unlock className="w-4 h-4 text-emerald-600" />
                          <span>Decrypted View (Session ID: {session.id})</span>
                        </div>
                        {activeSessionDetails && (
                          <button
                            type="button"
                            onClick={() => exportSessionJson(activeSessionDetails)}
                            className="flex items-center space-x-1 text-xs text-[#2E2A78] hover:underline font-semibold"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Export JSON</span>
                          </button>
                        )}
                      </div>

                      {activeSessionDetails?.captions ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto bg-white rounded-xl p-4 border border-gray-200">
                          {activeSessionDetails.captions.map((cap, i) => (
                            <div key={i} className="text-xs p-2 rounded hover:bg-gray-50 flex items-start space-x-3">
                              <span className="text-[11px] font-mono text-gray-400 w-16 flex-shrink-0 pt-0.5">
                                {new Date(cap.timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                              </span>
                              <div className="flex-1">
                                <span className="font-bold text-gray-900 mr-2">
                                  {cap.speaker || "Neutral Speaker"}:
                                </span>
                                <span className="text-gray-800">{cap.text}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-gray-500 italic py-4 text-center">
                          Decrypting transcript with authenticated local Fernet cipher...
                        </p>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
