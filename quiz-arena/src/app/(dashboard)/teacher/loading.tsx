/**
 * Loading UI for the teacher dashboard.
 * Shown by Next.js App Router while the async page component fetches data.
 * Uses the same card skeleton pattern as the real dashboard for zero layout shift.
 */
export default function TeacherDashboardLoading() {
  return (
    <div className="p-8 space-y-8" aria-label="Loading dashboard" aria-busy="true">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-40 rounded-lg" />
          <div className="skeleton h-4 w-64 rounded-md" />
        </div>
        <div className="flex items-center gap-4">
          <div className="skeleton h-10 w-36 rounded-xl" />
          <div className="skeleton h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass rounded-2xl p-6 space-y-3">
            <div className="skeleton h-8 w-8 rounded-lg" />
            <div className="skeleton h-9 w-16 rounded-md" />
            <div className="skeleton h-4 w-24 rounded-md" />
          </div>
        ))}
      </div>

      {/* Quiz list skeleton */}
      <div className="space-y-3">
        <div className="flex items-center justify-between mb-4">
          <div className="skeleton h-6 w-36 rounded-md" />
          <div className="skeleton h-4 w-16 rounded-md" />
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="glass rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="skeleton w-10 h-10 rounded-xl flex-shrink-0" />
              <div className="space-y-2">
                <div className="skeleton h-4 w-48 rounded-md" />
                <div className="skeleton h-3 w-32 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="skeleton h-6 w-20 rounded-full" />
              <div className="skeleton h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
