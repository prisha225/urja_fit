"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Mic, RotateCcw, ShieldAlert, Sparkles } from "lucide-react";
import { DayPlan, MealPlan } from "@packages/contracts/types";
import { handleBuddyMessage } from "../lib/buddy";

interface BuddySheetProps {
  currentPlan: DayPlan;
  currentMealPlan?: MealPlan;
  onPlanChange?: (updatedPlan: DayPlan) => void;
  onMealPlanChange?: (updatedMealPlan: MealPlan) => void;
}

interface ChatMessage {
  id: string;
  sender: "user" | "buddy";
  text: string;
  action?: {
    id: string;
    description: string;
    undoData?: any;
    toolCall: any;
  };
  safetyTriggered?: boolean;
}

export const BuddySheet: React.FC<BuddySheetProps> = ({
  currentPlan,
  currentMealPlan,
  onPlanChange,
  onMealPlanChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputText, setInputText] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "buddy",
      text: "Namaste! Main aapki Sakhi hoon. Kaise madad kar sakti hoon aaj?",
    },
  ]);
  const [isListening, setIsListening] = useState(false);

  // Common quick chips
  const quickChips = [
    { label: "10 minute hi hain", query: "aaj 10 minute hi hain" },
    { label: "Make it quieter", query: "make it quiet, kids are sleeping" },
    { label: "Swap dinner", query: "swap dinner to something light" },
  ];

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };

    const buddyResult = handleBuddyMessage(text, currentPlan, currentMealPlan);

    const buddyMsg: ChatMessage = {
      id: `buddy-${Date.now()}`,
      sender: "buddy",
      text: buddyResult.reply,
      action: buddyResult.action,
      safetyTriggered: buddyResult.safetyTriggered,
    };

    setMessages((prev) => [...prev, userMsg, buddyMsg]);
    setInputText("");

    // Execute tool call if attached
    if (buddyResult.action?.toolCall) {
      executeTool(buddyResult.action.toolCall);
    }
  };

  const executeTool = (toolCall: any) => {
    if (toolCall.tool === "shorten_session") {
      const minutes = toolCall.args.minutes || 10;
      const updated = {
        ...currentPlan,
        sessions: currentPlan.sessions.map((s) => ({
          ...s,
          minutes,
          rationale: `Plan shortened to ${minutes} min as requested. Focus on steady moves!`,
        })),
      };
      onPlanChange?.(updated);
    } else if (toolCall.tool === "make_quieter") {
      const updated = {
        ...currentPlan,
        sessions: currentPlan.sessions.map((s) => ({
          ...s,
          rationale: "Quiet mode active: low noise movements only.",
        })),
      };
      onPlanChange?.(updated);
    }
  };

  const handleUndo = (msg: ChatMessage) => {
    if (msg.action?.undoData) {
      const originalMinutes = msg.action.undoData.minutes || 18;
      const updated = {
        ...currentPlan,
        sessions: currentPlan.sessions.map((s) => ({
          ...s,
          minutes: originalMinutes,
          rationale: `Session restored to ${originalMinutes} minutes.`,
        })),
      };
      onPlanChange?.(updated);
    }
  };

  // Web Speech API Voice Input
  const toggleVoice = () => {
    if (typeof window === "undefined" || !("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice recognition is supported in Google Chrome.");
      return;
    }

    try {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = "hi-IN";
      recognition.interimResults = false;

      recognition.onstart = () => setIsListening(true);
      recognition.onend = () => setIsListening(false);
      recognition.onerror = () => setIsListening(false);

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        if (transcript) {
          handleSend(transcript);
        }
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
    }
  };

  return (
    <>
      {/* Floating launcher button */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-aubergine text-white px-4 py-3 rounded-chip shadow-lg hover:bg-opacity-95 flex items-center gap-2 text-sm font-medium"
      >
        <MessageCircle className="w-4 h-4 text-marigold" />
        <span>Ask Sakhi</span>
      </button>

      {/* Bottom Sheet Backdrop & Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 280 }}
              className="w-full max-w-lg bg-white rounded-sheet shadow-2xl flex flex-col max-h-[85vh] h-[520px] overflow-hidden"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-ink-12 bg-white">
                <div>
                  <h3 className="font-display text-lg text-aubergine">Sakhi Companion</h3>
                  <p className="text-xs text-ink-70">Always here to adapt your plan · Natural Hinglish</p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="p-2 rounded-full hover:bg-mist text-ink-70"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex-1 p-4 overflow-y-auto space-y-3">
                {messages.map((m) => {
                  const isBuddy = m.sender === "buddy";
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isBuddy ? "items-start" : "items-end"}`}
                    >
                      <div
                        className={`max-w-[85%] px-3.5 py-2.5 rounded-field text-sm ${
                          isBuddy
                            ? m.safetyTriggered
                              ? "bg-red-50 text-red-900 border border-hibiscus/30"
                              : "bg-mist text-aubergine"
                            : "bg-aubergine text-white"
                        }`}
                      >
                        {m.safetyTriggered && (
                          <div className="flex items-center gap-1.5 font-semibold text-hibiscus text-xs mb-1">
                            <ShieldAlert className="w-3.5 h-3.5" />
                            <span>Safety Priority</span>
                          </div>
                        )}
                        <p>{m.text}</p>
                      </div>

                      {/* Action chip with undo if attached */}
                      {m.action && (
                        <div className="mt-1.5 flex items-center gap-2 text-xs">
                          <span className="px-2.5 py-1 rounded-chip bg-peacock/10 text-peacock font-medium">
                            {m.action.description}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleUndo(m)}
                            className="flex items-center gap-1 text-ink-70 hover:text-aubergine underline text-[11px]"
                          >
                            <RotateCcw className="w-3 h-3" /> Undo
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-4 py-2 flex items-center gap-2 overflow-x-auto no-scrollbar border-t border-ink-12 bg-white">
                {quickChips.map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSend(chip.query)}
                    className="whitespace-nowrap px-3 py-1.5 rounded-chip border border-ink-12 text-xs text-aubergine bg-white hover:bg-mist font-medium"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input field & Mic */}
              <div className="p-3 bg-white border-t border-ink-12 flex items-center gap-2">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Ask Sakhi or give instructions..."
                  className="flex-1 px-3.5 py-2.5 rounded-field border border-ink-12 bg-mist text-sm text-aubergine focus:outline-none focus:ring-1 focus:ring-aubergine"
                />
                <button
                  type="button"
                  onClick={toggleVoice}
                  title="Speak in Hindi/Hinglish"
                  className={`p-2.5 rounded-field border border-ink-12 ${
                    isListening ? "bg-hibiscus text-white" : "hover:bg-mist text-ink-70"
                  }`}
                >
                  <Mic className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleSend()}
                  className="p-2.5 rounded-field bg-aubergine text-white hover:bg-opacity-90"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
