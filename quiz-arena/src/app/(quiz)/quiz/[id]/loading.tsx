/**
 * Loading UI for the quiz-taking lobby page.
 */
export default function QuizLobbyLoading() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4" aria-label="Loading quiz" aria-busy="true">
      <div className="w-full max-w-lg">
        <div className="glass rounded-3xl p-8 text-center space-y-6">
          <div className="skeleton w-20 h-20 mx-auto rounded-2xl" />
          <div className="space-y-2">
            <div className="skeleton h-8 w-3/4 mx-auto rounded-lg" />
            <div className="skeleton h-4 w-full rounded-md" />
            <div className="skeleton h-4 w-1/2 mx-auto rounded-md" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="bg-[#111111] rounded-xl p-3 space-y-2">
                <div className="skeleton h-6 w-6 mx-auto rounded" />
                <div className="skeleton h-5 w-10 mx-auto rounded-md" />
                <div className="skeleton h-3 w-16 mx-auto rounded-md" />
              </div>
            ))}
          </div>
          <div className="skeleton h-24 w-full rounded-xl" />
          <div className="flex gap-3">
            <div className="skeleton flex-1 h-12 rounded-xl" />
            <div className="skeleton flex-[2] h-12 rounded-xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
