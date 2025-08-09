import React from "react";

type MobileNavToggleProps = {
  showCharSheetMobile: boolean;
  setShowCharSheetMobile: React.Dispatch<React.SetStateAction<boolean>>;
};

export default function MobileNavToggle({
  showCharSheetMobile,
  setShowCharSheetMobile,
}: MobileNavToggleProps) {
  return (
    <button
      onClick={() => setShowCharSheetMobile((v) => !v)}
      className="md:hidden fixed top-4 right-4 z-50 p-2 rounded bg-red-700 hover:bg-red-900 text-white shadow-lg"
      aria-label="Toggle Character Sheet"
      title="Toggle Character Sheet"
    >
      <svg
        className="w-6 h-6"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        {showCharSheetMobile ? (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M6 18L18 6M6 6l12 12"
          />
        ) : (
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4 6h16M4 12h16M4 18h16"
          />
        )}
      </svg>
    </button>
  );
}
