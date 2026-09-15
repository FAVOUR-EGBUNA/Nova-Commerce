type PageLoaderProps = {
  message?: string;
  fullPage?: boolean;
};

export default function PageLoader({
  message = "Loading...",
  fullPage = false,
}: PageLoaderProps) {
  return (
    <div
      className={`flex items-center justify-center ${
        fullPage ? "min-h-[70vh]" : "min-h-[320px]"
      }`}
    >
      <div className="flex flex-col items-center gap-5">
        <div className="relative flex h-14 w-14 items-center justify-center">
          <div className="absolute h-full w-full animate-spin rounded-full border-2 border-black/10 border-t-black" />

          <span className="text-[10px] font-black tracking-[0.18em]">N</span>
        </div>

        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-500">
            NOVA
          </p>

          <p className="mt-2 text-sm text-neutral-500">{message}</p>
        </div>
      </div>
    </div>
  );
}
