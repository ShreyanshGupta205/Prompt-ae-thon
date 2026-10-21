"use client";

import React, { useState, useMemo } from "react";
import { useResonanceStore } from "@/store/useResonanceStore";
import { ActionItem, CaptionEvent } from "@/types";
import {
  History,
  CheckSquare,
  FileText,
  BookmarkPlus,
  X,
  ExternalLink,
  Edit2,
  Check,
  Sparkles,
  Info
} from "lucide-react";

export const ConversationRecovery: React.FC = () => {
  const {
    recoveryOpen,
    setRecoveryOpen,
    captions,
    editCaption
  } = useResonanceStore();

  const [activeTab, setActiveTab] = useState<"summary" | "actions" | "vocabulary">("summary");
  const [vocabTerm, setVocabTerm] = useState("");
  const [vocabCorrection, setVocabCorrection] = useState("");
  const [savedVocabFeedback, setSavedVocabFeedback] = useState<string | null>(null);

  // Extractive Summary Generation (Zero Cloud, Deterministic Extractive Algorithm)
  const extractiveRecap = useMemo(() => {
    if (captions.length === 0) return [];
    // Extract key informational sentences with substantive content
    const significant = captions.filter(
      (c) =>
        c.text.length > 25 &&
        !c.text.toLowerCase().includes("good morning") &&
        !c.text.toLowerCase().includes("someone is knocking")
    );
    return significant.slice(-6);
  }, [captions]);

  // Action Items Extraction (Deterministic keyword analysis: deploy, check, confirm, test, review)
  const actionItems: ActionItem[] = useMemo(() => {
    const actionKeywords = ["deploy", "check", "confirm", "test", "review", "update", "verify", "push"];
    const items: ActionItem[] = [];

    captions.forEach((cap, idx) => {
      const lower = cap.text.toLowerCase();
      const hasAction = actionKeywords.some((kw) => lower.includes(kw));
      if (hasAction && cap.text.length > 20) {
        items.push({
          id: `act_${idx}`,
          text: cap.text,
          assignee: cap.speaker || "Team",
          caption_id: cap.caption_id,
          completed: false,
          source_quote: cap.text
        });
      }
    });

    return items;
  }, [captions]);

  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({});

  const toggleAction = (id: string) => {
    setCompletedActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSaveVocabulary = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vocabTerm.trim()) return;

    try {
      const res = await fetch("http://localhost:8000/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          term: vocabTerm.trim(),
          correction_for: vocabCorrection.trim() || null
        })
      });
      if (res.ok) {
        setSavedVocabFeedback(`Added "${vocabTerm.trim()}" to personal vocabulary`);
        setVocabTerm("");
        setVocabCorrection("");
        setTimeout(() => setSavedVocabFeedback(null), 3500);
      }
    } catch (err) {
      console.warn("Failed to save vocabulary to backend:", err);
    }
  };

  if (!recoveryOpen) return null;

  return (
    <div
      role="dialog"
      aria-labelledby="recovery-drawer-title"
      className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-gray-200 flex flex-col animate-slide-left"
    >
      {/* Header */}
      <div className="p-4 bg-[#2E2A78] text-white flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <History className="w-5 h-5 text-orange-300" />
          <div>
            <h2 id="recovery-drawer-title" className="text-base font-bold">
              Conversation Recovery
            </h2>
            <p className="text-xs text-indigo-200">
              Extractive review, action items, and personal vocabulary
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setRecoveryOpen(false)}
          className="p-1 rounded-lg text-indigo-200 hover:text-white hover:bg-white/10"
          aria-label="Close Conversation Recovery"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-gray-200 bg-[#F8F9FA] px-2 text-xs font-semibold">
        <button
          type="button"
          onClick={() => setActiveTab("summary")}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === "summary"
              ? "border-[#B8530A] text-[#B8530A] bg-white"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Extractive Recap
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("actions")}
          className={`py-3 px-4 border-b-2 transition flex items-center space-x-1 ${
            activeTab === "actions"
              ? "border-[#B8530A] text-[#B8530A] bg-white"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          <span>Action Items</span>
          {actionItems.length > 0 && (
            <span className="bg-orange-100 text-[#B8530A] text-[10px] px-1.5 py-0.2 rounded-full font-bold">
              {actionItems.length}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("vocabulary")}
          className={`py-3 px-4 border-b-2 transition ${
            activeTab === "vocabulary"
              ? "border-[#B8530A] text-[#B8530A] bg-white"
              : "border-transparent text-gray-600 hover:text-gray-900"
          }`}
        >
          Add Vocabulary
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 p-5 overflow-y-auto space-y-4">
        {/* TAB 1: EXTRACTIVE RECAP */}
        {activeTab === "summary" && (
          <div className="space-y-3">
            <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-xl text-xs text-indigo-900 flex items-start space-x-2">
              <Info className="w-4 h-4 text-[#2E2A78] flex-shrink-0 mt-0.5" />
              <div>
                <strong>Extractive Deterministic Recap</strong>
                <p className="text-gray-600 mt-0.5">
                  Extracted strictly from verified transcript sentences. No cloud language models used.
                </p>
              </div>
            </div>

            {extractiveRecap.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-6">
                No captions recorded yet to summarize. Start a session to follow live discussion.
              </p>
            ) : (
              <ul className="space-y-2.5">
                {extractiveRecap.map((c, i) => (
                  <li key={i} className="p-3 bg-[#F8F9FA] rounded-xl border border-gray-200 text-xs text-gray-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-gray-500">
                      <span>{c.speaker || "Neutral Speaker"}</span>
                      <span>{new Date(c.timestamp * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</span>
                    </div>
                    <p className="font-medium text-gray-900">&ldquo;{c.text}&rdquo;</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* TAB 2: ACTION ITEMS */}
        {activeTab === "actions" && (
          <div className="space-y-3">
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start space-x-2">
              <Info className="w-4 h-4 text-amber-800 flex-shrink-0 mt-0.5" />
              <div>
                <strong>Suggested Action Candidates</strong>
                <p className="text-amber-800 mt-0.5">
                  Identified from action-oriented speech patterns and linked to source captions.
                </p>
              </div>
            </div>

            {actionItems.length === 0 ? (
              <p className="text-xs text-gray-500 italic text-center py-6">
                No action items detected in current transcript.
              </p>
            ) : (
              <div className="space-y-2">
                {actionItems.map((act) => {
                  const isDone = !!completedActions[act.id];

                  return (
                    <div
                      key={act.id}
                      className={`p-3 rounded-xl border transition ${
                        isDone ? "bg-gray-50 border-gray-200 opacity-60" : "bg-white border-gray-200 shadow-xs"
                      }`}
                    >
                      <div className="flex items-start space-x-2.5">
                        <input
                          type="checkbox"
                          checked={isDone}
                          onChange={() => toggleAction(act.id)}
                          className="mt-1 h-4 w-4 rounded border-gray-300 text-[#B8530A] focus:ring-[#B8530A]"
                          aria-label={`Mark action item: ${act.text}`}
                        />
                        <div className="flex-1">
                          <p className={`text-xs font-semibold ${isDone ? "line-through text-gray-400" : "text-gray-900"}`}>
                            {act.text}
                          </p>
                          <div className="flex items-center space-x-2 mt-1.5 text-[11px] text-gray-500">
                            <span>Speaker: <strong>{act.assignee}</strong></span>
                            <span>•</span>
                            <span className="text-[#2E2A78] font-mono">Source ID: #{act.caption_id?.slice(-6)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: PERSONAL VOCABULARY */}
        {activeTab === "vocabulary" && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-900">
              <p>
                Teach Resonance your company terminology, project acronyms, or colleague names to boost local matching accuracy.
              </p>
            </div>

            <form onSubmit={handleSaveVocabulary} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Correct Vocabulary Term
                </label>
                <input
                  type="text"
                  value={vocabTerm}
                  onChange={(e) => setVocabTerm(e.target.value)}
                  placeholder="e.g. Kubernetes, Resonance, IndicConformer"
                  required
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8530A]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">
                  Common ASR Misrecognition (Optional)
                </label>
                <input
                  type="text"
                  value={vocabCorrection}
                  onChange={(e) => setVocabCorrection(e.target.value)}
                  placeholder="e.g. Coober netties, Resonans"
                  className="w-full text-xs px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#B8530A]"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-[#2E2A78] hover:bg-[#1f1c54] text-white text-xs font-semibold rounded-lg shadow transition flex items-center justify-center space-x-1.5"
              >
                <BookmarkPlus className="w-4 h-4" />
                <span>Save to Personal Vocabulary</span>
              </button>
            </form>

            {savedVocabFeedback && (
              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg text-xs font-medium border border-emerald-200 flex items-center space-x-1.5">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{savedVocabFeedback}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
