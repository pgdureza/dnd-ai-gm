import React from "react";
import { CharacterSheet } from "../app/page"; // Import the type

type CharacterSheetDisplayProps = {
  characterSheet: CharacterSheet | null;
};

export default function CharacterSheetDisplay({
  characterSheet,
}: CharacterSheetDisplayProps) {
  return (
    <>
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
    </>
  );
}
