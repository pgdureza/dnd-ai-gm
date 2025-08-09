import React from "react";

type MessageInputProps = {
  input: string;
  setInput: (value: string) => void;
  sendMessage: () => void;
  loading: boolean;
};

export default function MessageInput({
  input,
  setInput,
  sendMessage,
  loading,
}: MessageInputProps) {
  return (
    <div className="mt-4 flex space-x-3">
      <input
        type="text"
        placeholder="Speak your words, brave adventurer..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
          }
        }}
        disabled={loading}
        className="flex-1 bg-gray-800 border border-red-700 rounded px-4 py-3
          focus:outline-none focus:ring-2 focus:ring-red-600 placeholder-red-400 text-red-100"
      />
      <button
        onClick={sendMessage}
        disabled={loading}
        className="bg-red-700 hover:bg-red-900 disabled:opacity-50 text-white font-bold px-6 py-3 rounded shadow-lg"
      >
        Send
      </button>
    </div>
  );
}
