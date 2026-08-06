export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-[420px]">
        {/* Brand lockup */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-11 h-11 rounded-xl bg-ground flex items-center justify-center">
            <svg viewBox="0 0 64 64" className="w-6 h-6">
              <path
                d="M32 6l20 7v20c0 13-8.6 22.6-20 26C20.6 55.6 12 46 12 33V13l20-7z"
                fill="none"
                stroke="#C9A227"
                strokeWidth="3.4"
                strokeLinejoin="round"
              />
              <path
                d="M22 32.5h20M26 24.5h12M26 40.5h12"
                stroke="#E9F0E8"
                strokeWidth="3.2"
                strokeLinecap="round"
              />
            </svg>
          </div>
          <div>
            <div className="font-display font-extrabold text-xl tracking-tight leading-none">
              KnightLog
            </div>
            <div className="font-mono text-[9.5px] tracking-[0.22em] text-gold mt-1">
              SOLUTIONS
            </div>
          </div>
        </div>

        {/* Status card */}
        <div className="bg-surface border border-line-soft rounded-2xl p-5 mb-3">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-signal-amber-soft flex items-center justify-center">
              <svg viewBox="0 0 24 24" fill="none" className="w-5 h-5">
                <circle cx="12" cy="12" r="9" stroke="#B07A16" strokeWidth="1.9" />
                <path d="M12 7v5.2l3.2 3.2" stroke="#B07A16" strokeWidth="1.9" />
              </svg>
            </div>
            <div>
              <div className="font-bold text-[16.5px] tracking-tight">
                Today&apos;s diary not logged
              </div>
              <div className="text-[13.5px] text-muted mt-0.5">
                Takes about a minute
              </div>
            </div>
          </div>
          <button className="w-full bg-accent text-white font-bold text-base rounded-xl py-4 active:scale-[0.985] transition-transform">
            Log today&apos;s entry
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2">
          {[
            ["12", "Entries"],
            ["4", "This week"],
            ["3", "Flags 7d"],
          ].map(([n, label]) => (
            <div
              key={label}
              className="bg-surface border border-line-soft rounded-xl py-4 text-center"
            >
              <div className="font-display font-extrabold text-2xl tracking-tight">
                {n}
              </div>
              <div className="text-[11px] text-muted font-semibold mt-0.5">
                {label}
              </div>
            </div>
          ))}
        </div>

        <p className="stamp mt-8 text-center">Stage 1 · design system live</p>
      </div>
    </main>
  );
}