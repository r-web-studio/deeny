'use client';

export default function RetryButton() {
  return (
    <button
      onClick={() => window.location.reload()}
      className="rounded-xl bg-emerald-600 px-8 py-3 text-lg font-semibold text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-500 hover:shadow-emerald-600/30 active:scale-95"
    >
      Try Again
    </button>
  );
}
