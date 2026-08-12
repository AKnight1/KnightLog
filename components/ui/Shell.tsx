export function Screen({ children }: { children: React.ReactNode }) {
  return (
    <main className="px-4 pt-4 pb-[calc(90px+env(safe-area-inset-bottom))] md:px-7 md:pt-7 md:pb-16">
      <div className="md:max-w-[1080px]">{children}</div>
    </main>
  );
}

export function PageTitle({
  title,
  sub,
}: {
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-4">
      <h1 className="font-display text-[30px] font-extrabold tracking-[-0.03em] leading-tight md:text-[34px]">
        {title}
      </h1>
      {sub && <p className="mt-0.5 text-sm text-muted">{sub}</p>}
    </div>
  );
}

export function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-6 mb-2 px-1 text-[12.5px] font-semibold uppercase tracking-[0.04em] text-muted">
      {children}
    </p>
  );
}

export function Group({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-hidden rounded-[13px] border border-line-soft bg-surface">
      {children}
    </div>
  );
}

export function Row({
  title,
  sub,
  right,
  onClick,
}: {
  title: string;
  sub?: string;
  right?: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 border-b border-line-soft px-4 py-3.5 last:border-b-0 ${
        onClick ? "cursor-pointer active:bg-line-soft" : ""
      }`}
    >
      <div className="min-w-0 flex-1">
        <p className="text-[15.5px] font-medium tracking-[-0.01em]">{title}</p>
        {sub && <p className="mt-0.5 text-[13px] leading-snug text-muted">{sub}</p>}
      </div>
      {right}
    </div>
  );
}