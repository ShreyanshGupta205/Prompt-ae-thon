"use client";

import React from "react";
import { useResonanceStore } from "@/store/useResonanceStore";
import {
  Bell,
  DoorOpen,
  Phone,
  Volume2,
  UserCheck,
  Check,
  X,
  AlertOctagon,
  Clock
} from "lucide-react";

export const AlertBanner: React.FC = () => {
  const {
    activeNameAlert,
    acknowledgeNameAlert,
    activeAmbientAlerts,
    acknowledgeAmbient
  } = useResonanceStore();

  const getSoundIcon = (category: string) => {
    switch (category) {
      case "alarm":
        return <AlertOctagon className="w-5 h-5 text-red-600 animate-bounce" />;
      case "knock":
        return <DoorOpen className="w-5 h-5 text-amber-700" />;
      case "phone_ring":
        return <Phone className="w-5 h-5 text-purple-700 animate-pulse" />;
      case "doorbell":
        return <Volume2 className="w-5 h-5 text-blue-700" />;
      default:
        return <Bell className="w-5 h-5 text-indigo-700" />;
    }
  };

  return (
    <div className="space-y-2 mb-4" aria-live="assertive" aria-atomic="true">
      {/* 1. Name Mention Alert (Urgent Peach & Burnt Orange) */}
      {activeNameAlert && (
        <div
          role="alert"
          className="bg-[#FFF3E3] border-2 border-[#B8530A] rounded-xl p-4 shadow-lg flex items-center justify-between animate-pulse-slow"
        >
          <div className="flex items-center space-x-3.5">
            <div className="p-2.5 bg-[#B8530A] text-white rounded-lg shadow-sm">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-[#B8530A] bg-orange-100 px-2 py-0.5 rounded">
                  Name Mentioned
                </span>
                <span className="text-xs text-gray-500 flex items-center">
                  <Clock className="w-3 h-3 mr-1" />
                  Just now
                </span>
              </div>
              <h3 className="text-lg font-bold text-gray-900 mt-0.5">
                Someone mentioned <span className="text-[#B8530A] font-extrabold underline decoration-2">{activeNameAlert.name}</span>
                {activeNameAlert.speaker && <span className="text-gray-700 font-medium"> in speech by {activeNameAlert.speaker}</span>}
              </h3>
              {activeNameAlert.context && (
                <p className="text-sm text-gray-700 italic mt-0.5 max-w-2xl bg-white/60 p-1.5 rounded border border-orange-200">
                  &ldquo;{activeNameAlert.context}&rdquo;
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={acknowledgeNameAlert}
              className="px-4 py-2 bg-[#B8530A] hover:bg-[#9c4506] text-white text-sm font-semibold rounded-lg shadow transition flex items-center space-x-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#B8530A]"
            >
              <Check className="w-4 h-4" />
              <span>Acknowledge</span>
            </button>
          </div>
        </div>
      )}

      {/* 2. Ambient Sound Alerts (Fire alarm, knock, doorbell, phone ring) */}
      {activeAmbientAlerts.map((alert) => {
        const isCritical = alert.severity === "critical" || alert.category === "alarm";

        return (
          <div
            key={alert.category}
            role="alert"
            className={`border-2 rounded-xl p-4 shadow-md flex items-center justify-between transition-all ${
              isCritical
                ? "bg-red-50 border-red-500 animate-pulse"
                : "bg-[#FFF3E3] border-[#FED7AA]"
            }`}
          >
            <div className="flex items-center space-x-3.5">
              <div
                className={`p-2.5 rounded-lg shadow-sm ${
                  isCritical ? "bg-red-600 text-white" : "bg-orange-100 text-[#B8530A]"
                }`}
              >
                {getSoundIcon(alert.category)}
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <span
                    className={`text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                      isCritical
                        ? "bg-red-200 text-red-900"
                        : "bg-amber-100 text-amber-900"
                    }`}
                  >
                    {isCritical ? "CRITICAL SOUND ALERT" : "ENVIRONMENTAL SOUND DETECTED"}
                  </span>
                  <span className="text-xs text-gray-500 font-medium">
                    Confidence: {Math.round(alert.score * 100)}%
                  </span>
                </div>
                <h4 className="text-base font-bold text-gray-900 mt-0.5">
                  {alert.label}
                </h4>
                <p className="text-xs text-gray-600">
                  {isCritical
                    ? "Check immediate surroundings or safety exit."
                    : "Sound category verified locally on your device with rate-limiting cooldown active."}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => acknowledgeAmbient(alert.category)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold shadow transition flex items-center space-x-1 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                  isCritical
                    ? "bg-red-600 hover:bg-red-700 text-white focus:ring-red-600"
                    : "bg-[#2E2A78] hover:bg-[#1f1c54] text-white focus:ring-[#2E2A78]"
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                <span>Dismiss</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
