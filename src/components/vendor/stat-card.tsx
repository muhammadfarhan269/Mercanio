interface StatCardProps {
  label: string
  value: string
  subtext?: string
  icon: React.ReactNode
}

export function StatCard({ label, value, subtext, icon }: StatCardProps) {
  return (
    <div className="rounded-xl p-6" style={{ backgroundColor: '#FFFFFF', border: '1px solid #E8DDD4' }}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-[#8C7B6E]">{label}</p>
          <p className="mt-2 text-2xl font-semibold text-[#1A1410]">{value}</p>
          {subtext && (
            <p className="mt-1 text-xs text-[#8C7B6E]">{subtext}</p>
          )}
        </div>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#F5F0EB] text-[#C2692A]">
          {icon}
        </div>
      </div>
    </div>
  )
}
