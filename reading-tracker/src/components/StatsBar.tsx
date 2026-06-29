type StatsBarProps = {
  toReadCount: number;
  readingCount: number;
  finishedCount: number;
  averageRating: string;
};

function StatsBar({
  toReadCount,
  readingCount,
  finishedCount,
  averageRating,
}: StatsBarProps) {
  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold">Stats</h2>

      <p className="mt-2">
        {toReadCount} to read · {readingCount} reading · {finishedCount} finished
      </p>

      <p className="mt-1">Average finished-book rating: {averageRating}</p>
    </section>
  );
}

export default StatsBar;