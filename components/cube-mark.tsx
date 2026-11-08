const tiles = [
  "bg-white", "bg-[#B7E8E1]", "bg-[#E0663E]",
  "bg-[#B7E8E1]", "bg-[#079E8D]", "bg-white",
  "bg-[#E0663E]", "bg-white", "bg-[#B7E8E1]",
]

export function CubeMark({ className = "size-8" }: { className?: string }) {
  return (
    <div className={`grid shrink-0 grid-cols-3 grid-rows-3 gap-0.5 ${className}`}>
      {tiles.map((color, i) => (
        <span key={i} className={`rounded-[2px] ${color}`} />
      ))}
    </div>
  )
}