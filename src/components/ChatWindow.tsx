import React, { RefObject } from "react";
import { Message } from "../app/page"; // Import the type

type ChatWindowProps = {
  messages: Message[];
  loading: boolean;
  scrollRef: RefObject<HTMLDivElement | null>;
};

export default function ChatWindow({
  messages,
  loading,
  scrollRef,
}: ChatWindowProps) {
  return (
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
  );
}
