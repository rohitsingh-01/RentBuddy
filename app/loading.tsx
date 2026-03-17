export default function Loading() {
  return (
    <div className="flex-1 flex items-center justify-center py-24">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-forest-200 border-t-forest-700 rounded-full animate-spin" />
        <p className="text-xs text-forest-400 font-medium tracking-wide">Loading…</p>
      </div>
    </div>
  )
}
