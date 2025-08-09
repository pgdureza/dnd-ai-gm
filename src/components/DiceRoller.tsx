import React from "react";

type DiceRollerProps = {
  onRollDice: (sides: number) => void;
};

export default function DiceRoller({ onRollDice }: DiceRollerProps) {
  return (
    <div className="mt-8 border-t border-red-700 pt-6">
      <h3 className="text-xl font-semibold text-red-500 mb-3">Roll a Dice</h3>
      <div className="flex flex-wrap gap-3">
        {[4, 6, 8, 10, 12, 20].map((sides) => (
          <button
            key={sides}
            onClick={() => onRollDice(sides)}
            className="bg-red-700 hover:bg-red-900 text-white font-bold px-4 py-2 rounded shadow-lg flex-1 min-w-[64px] text-center"
          >
            d{sides}
          </button>
        ))}
      </div>
    </div>
  );
}
