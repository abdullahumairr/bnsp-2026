import React from "react";
import { Link } from "react-router-dom";

export const Success: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#fbfbfa] flex flex-col justify-center items-center space-y-6 animate-fade-in">
      <div className="w-20 h-20 bg-black rounded-full flex items-center justify-center text-white">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-10 h-10"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.5 12.75l6 6 9-13.5"
          />
        </svg>
      </div>
      <h1 className="font-serif text-3xl tracking-tight text-neutral-900">
        Transaction Secure & Complete
      </h1>
      <p className="text-neutral-500 font-light max-w-sm text-center text-sm">
        Your literary volume selections have been formalized into our digital
        dispatch protocols.
      </p>
      <Link
        to="/"
        className="text-xs uppercase tracking-widest border-b border-black pb-1 hover:text-neutral-600"
      >
        Return to Archive
      </Link>
    </div>
  );
};
