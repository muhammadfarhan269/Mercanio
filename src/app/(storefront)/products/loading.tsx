export default function Loading() {
  return (
    <div className="bg-[#F5F0EB] min-h-screen">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="animate-pulse">
          <div className="h-10 w-48 bg-[#E8DDD4] rounded-lg mb-10" />
          <div className="flex gap-10">
            <div className="w-56 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-[#E8DDD4] rounded-lg" />
              ))}
            </div>
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {[...Array(9)].map((_, i) => (
                <div key={i} className="h-72 bg-[#E8DDD4] rounded-xl" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
