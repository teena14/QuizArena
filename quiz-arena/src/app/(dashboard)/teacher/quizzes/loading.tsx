/**
 * Loading UI for the teacher quizzes list page.
 */
export default function QuizzesLoading() {
  return (
    <div className="p-8 space-y-8" aria-label="Loading quizzes" aria-busy="true">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="skeleton h-8 w-36 rounded-lg" />
          <div className="skeleton h-4 w-28 rounded-md" />
        </div>
        <div className="skeleton h-10 w-32 rounded-full" />
      </div>

      <div className="grid gap-4">
        {[0, 1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="glass rounded-xl p-5 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="skeleton w-12 h-12 rounded-xl flex-shrink-0" />
              <div className="space-y-2">
                <div className="skeleton h-5 w-48 rounded-md" />
                <div className="skeleton h-3 w-64 rounded-md" />
                <div className="flex gap-4">
                  <div className="skeleton h-3 w-20 rounded-md" />
                  <div className="skeleton h-3 w-16 rounded-md" />
                  <div className="skeleton h-3 w-18 rounded-md" />
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="skeleton h-6 w-24 rounded-full" />
              <div className="skeleton h-8 w-8 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
