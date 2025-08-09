"use client";

import React, { useState, useEffect, useRef } from "react";
import { Toaster } from "react-hot-toast";
import ChatWindow from "../components/ChatWindow";
import MessageInput from "../components/MessageInput";
import CharacterSheetDisplay from "../components/CharacterSheetDisplay";
import DiceRoller from "../components/DiceRoller";
import MobileNavToggle from "../components/MobileNavToggle";
import toast from "react-hot-toast"; // Keep toast here for dice rolling

export type Message = {
  role: "player" | "gm";
  content: string;
};

export type CharacterSheet = {
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

  function sendMessageFromInput() {
    sendMessage(input.trim());
  }

  // Moved rollDice here as it interacts with sendMessage (state and API)
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

    sendMessage(`I rolled a d${sides} and got ${roll}!`);
  }

  return (
    <>
      <Toaster position="bottom-center" />

      <main className="flex flex-col md:flex-row h-screen bg-black font-cinzel text-red-100 relative">
        <MobileNavToggle
          showCharSheetMobile={showCharSheetMobile}
          setShowCharSheetMobile={setShowCharSheetMobile}
        />

        <div className="flex flex-col flex-1 max-w-full md:max-w-4xl lg:mx-auto p-6 z-10">
          <ChatWindow
            messages={messages}
            loading={loading}
            scrollRef={scrollRef}
          />
          <MessageInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessageFromInput}
            loading={loading}
          />
        </div>

        <aside
          className={`fixed md:static top-0 right-0 h-full w-72 bg-gray-900 border-l-4 border-red-900 p-6 overflow-y-auto shadow-inner z-40
            transform transition-transform duration-300 ease-in-out
            ${
              showCharSheetMobile
                ? "translate-x-0"
                : "translate-x-full md:translate-x-0"
            }`}
        >
          <CharacterSheetDisplay characterSheet={characterSheet} />
          <DiceRoller onRollDice={rollDice} />
        </aside>

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
