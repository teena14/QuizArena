/**
 * Loading UI for the student dashboard.
 * Shown by Next.js App Router while the async page component fetches data.
 */
export default function StudentDashboardLoading() {
  return (
    <div className="p-8 space-y-6" aria-label="Loading dashboard" aria-busy="true">
      {/* Header skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <div className="skeleton h-7 w-52 rounded-lg" />
          <div className="skeleton h-4 w-44 rounded-md" />
        </div>
        <div className="skeleton h-10 w-40 rounded-xl" />
      </div>

      {/* Stats skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[0, 1, 2].map((i) => (
          <div key={i} className="glass rounded-2xl p-6 flex justify-between items-center">
            <div className="space-y-2">
              <div className="skeleton h-8 w-10 rounded-md" />
              <div className="skeleton h-4 w-20 rounded-md" />
            </div>
            <div className="skeleton w-8 h-8 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Quiz cards skeleton */}
      <div className="space-y-4">
        <div className="skeleton h-6 w-24 rounded-md" />
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="glass rounded-xl p-5 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <div className="skeleton h-5 w-3/4 rounded-md" />
                <div className="skeleton h-5 w-16 rounded-full" />
              </div>
              <div className="skeleton h-4 w-full rounded-md" />
              <div className="skeleton h-4 w-2/3 rounded-md" />
              <div className="flex items-center justify-between pt-2">
                <div className="skeleton h-4 w-24 rounded-md" />
                <div className="skeleton h-8 w-24 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
