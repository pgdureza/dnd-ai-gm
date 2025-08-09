"use client";

import React, { useState, useEffect, useRef } from "react";
import toast, { Toaster } from "react-hot-toast";

type Message = {
  role: "player" | "gm";
  content: string;
};

type CharacterSheet = {
  name: string;
  race: string;
  class: string;
  level: number;
  hitPoints: number;
  armorClass: number;
  mainWeapon: string;
  personality?: string;
  stats: {
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
  };
};

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [characterSheet, setCharacterSheet] = useState<CharacterSheet | null>(
    null
  );
  const [isNewSession, setIsNewSession] = useState(true);
  const [loading, setLoading] = useState(false);
  const [showCharSheetMobile, setShowCharSheetMobile] = useState(false);

  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    if (isNewSession) {
      sendMessage("begin session");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isNewSession]);

  async function sendMessage(msg: string) {
    const message = msg || input.trim();
    if (!message) return;

    setMessages((prev) => [...prev, { role: "player", content: message }]);
    setLoading(true);

    try {
      const res = await fetch("/api/gm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          playerText: message,
          isNewSession,
          characterSheet,
        }),
      });

      const data = await res.json();

      if (data.error) {
        toast.error("Error: " + data.error);
        setLoading(false);
        return;
      }

      setMessages((prev) => [...prev, { role: "gm", content: data.narration }]);

      if (isNewSession && data.characterSheet) {
        setCharacterSheet(data.characterSheet);
        setIsNewSession(false);
      } else if (data.characterSheet) {
        setCharacterSheet(data.characterSheet);
      }
    } catch {
      toast.error("Request failed.");
    } finally {
      setInput("");
      setLoading(false);
    }
  }

  async function sendMessageFromInput() {
    sendMessage(input.trim());
  }

  function updateHitPoints(delta: number) {
    if (!characterSheet) return;
    setCharacterSheet((cs) => {
      if (!cs) return cs;
      const newHp = Math.max(0, cs.hitPoints + delta);
      return { ...cs, hitPoints: newHp };
    });
  }

  function rollDice(sides: number) {
    const roll = Math.floor(Math.random() * sides) + 1;
    toast(`You rolled a d${sides} and got ${roll}!`, {
      icon: "🎲",
      style: {
        borderRadius: "8px",
        background: "#7f1d1d",
        color: "#fca5a5",
        fontWeight: "bold",
        fontFamily: "'Cinzel', serif",
      },
      duration: 4000,
    });
  }

  return (
    <>
      <Toaster position="top-right" />

      <main className="flex flex-col md:flex-row h-screen bg-black font-cinzel text-red-100 relative">
        {/* Hamburger Button - only on mobile */}
        <button
          onClick={() => setShowCharSheetMobile((v) => !v)}
          className="md:hidden fixed top-4 right-4 z-50 p-2 rounded bg-red-700 hover:bg-red-900 text-white shadow-lg"
          aria-label="Toggle Character Sheet"
          title="Toggle Character Sheet"
        >
          {/* Hamburger icon */}
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            strokeWidth={2}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            {showCharSheetMobile ? (
              // X icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              // Hamburger icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>

        {/* Chat area */}
        <div className="flex flex-col flex-1 max-w-full md:max-w-4xl lg:mx-auto p-6 z-10">
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto border-4 border-red-900 rounded-lg p-6 bg-gray-900 shadow-lg"
          >
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-6 max-w-[75%] whitespace-pre-wrap rounded-lg p-4
                ${
                  msg.role === "player"
                    ? "bg-red-800 text-gray-100 self-end ml-auto border-2 border-red-600 shadow-md"
                    : "bg-gray-800 text-red-400 border border-red-700 shadow-inner"
                }`}
                style={{ textShadow: "0 0 3px #8b0000" }}
              >
                <strong className="uppercase tracking-wide font-semibold">
                  {msg.role === "player" ? "You" : "GM"}:
                </strong>{" "}
                {msg.content}
              </div>
            ))}
            {loading && (
              <div className="text-red-600 italic font-semibold mt-2">
                GM is thinking...
              </div>
            )}
          </div>

          <div className="mt-4 flex space-x-3">
            <input
              type="text"
              placeholder="Speak your words, brave adventurer..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  sendMessageFromInput();
                }
              }}
              disabled={loading}
              className="flex-1 bg-gray-800 border border-red-700 rounded px-4 py-3
            focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-red-400 text-red-100"
            />
            <button
              onClick={sendMessageFromInput}
              disabled={loading}
              className="bg-red-700 hover:bg-red-900 disabled:opacity-50 text-white font-bold px-6 py-3 rounded shadow-lg"
            >
              Send
            </button>
          </div>
        </div>

        {/* Character Sheet Panel */}
        {/* Desktop: always visible, Mobile: slide in/out */}
        <aside
          className={`fixed md:static top-0 right-0 h-full w-72 bg-gray-900 border-l-4 border-red-900 p-6 overflow-y-auto shadow-inner z-40
            transform transition-transform duration-300 ease-in-out
            ${
              showCharSheetMobile
                ? "translate-x-0"
                : "translate-x-full md:translate-x-0"
            }`}
        >
          <h2 className="text-3xl font-bold text-red-600 mb-6 tracking-wide drop-shadow-md">
            Character Sheet
          </h2>
          {!characterSheet ? (
            <p className="text-red-600 italic">
              Your character’s story will begin here once the session starts.
            </p>
          ) : (
            <div className="space-y-4 text-red-300">
              <p>
                <strong className="text-red-500">Name:</strong>{" "}
                {characterSheet.name}
              </p>
              <p>
                <strong className="text-red-500">Race:</strong>{" "}
                {characterSheet.race}
              </p>
              <p>
                <strong className="text-red-500">Class:</strong>{" "}
                {characterSheet.class}
              </p>
              <p>
                <strong className="text-red-500">Level:</strong>{" "}
                {characterSheet.level}
              </p>
              <p>
                <strong className="text-red-500">Hit Points:</strong>{" "}
                {characterSheet.hitPoints}
              </p>
              <p>
                <strong className="text-red-500">Armor Class:</strong>{" "}
                {characterSheet.armorClass}
              </p>
              <p>
                <strong className="text-red-500">Main Weapon:</strong>{" "}
                {characterSheet.mainWeapon}
              </p>
              {characterSheet.personality && (
                <p>
                  <strong className="text-red-500">Personality:</strong>{" "}
                  {characterSheet.personality}
                </p>
              )}
              <div>
                <strong className="text-red-500">Stats:</strong>
                <ul className="list-disc list-inside ml-5 mt-1 space-y-0.5">
                  {Object.entries(characterSheet.stats).map(([stat, val]) => (
                    <li key={stat}>
                      {stat.charAt(0).toUpperCase() + stat.slice(1)}: {val}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Dice Roller */}
          <div className="mt-8 border-t border-red-700 pt-6">
            <h3 className="text-xl font-semibold text-red-500 mb-3">
              Roll a Dice
            </h3>
            <div className="flex flex-wrap gap-3">
              {[4, 6, 8, 10, 12, 20].map((sides) => (
                <button
                  key={sides}
                  onClick={() => rollDice(sides)}
                  className="bg-red-700 hover:bg-red-900 text-white font-bold px-4 py-2 rounded shadow-lg flex-1 min-w-[64px] text-center"
                >
                  d{sides}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Overlay behind character sheet on mobile when open */}
        {showCharSheetMobile && (
          <div
            onClick={() => setShowCharSheetMobile(false)}
            className="fixed inset-0 bg-black/70 z-30 md:hidden"
            aria-hidden="true"
          />
        )}
      </main>
    </>
  );
}
