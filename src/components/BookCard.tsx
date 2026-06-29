import type { Book } from "../types";

type BookCardProps = {
  book: Book;
  onMoveBack: (id: string) => void;
  onMoveForward: (id: string) => void;
  onDeleteBook: (id: string) => void;
  onRateBook: (id: string, rating: number) => void;
};

function BookCard({
  book,
  onMoveBack,
  onMoveForward,
  onDeleteBook,
  onRateBook,
}: BookCardProps) {
  return (
    <article className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      {book.coverUrl ? (
        <img
          src={book.coverUrl}
          alt={`Cover of ${book.title}`}
          className="h-32 w-24 rounded object-cover"
        />
      ) : (
        <div className="flex h-32 w-24 items-center justify-center rounded bg-slate-200 text-center text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          No cover
        </div>
      )}

      <div className="flex-1">
        <h3 className="text-xl font-bold">{book.title}</h3>
        <p className="text-slate-600 dark:text-slate-300">by {book.author}</p>
        {book.year && <p className="text-sm">First published: {book.year}</p>}

        <p className="mt-2">
          Status: <strong>{book.status}</strong>
        </p>

        {/*
          The rating UI only appears for finished books, matching the assignment.
          Clicking a star calls back to App, where the actual library state is updated.
        */}
        {book.status === "finished" && (
          <div className="mt-3">
            <p>Rating:</p>
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => onRateBook(book.id, star)}
                className="mr-1 text-xl text-yellow-500"
              >
                {book.rating && book.rating >= star ? "★" : "☆"}
              </button>
            ))}
          </div>
        )}

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => onMoveBack(book.id)}
            className="rounded bg-slate-200 px-3 py-1 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
          >
            Back
          </button>

          <button
            onClick={() => onMoveForward(book.id)}
            className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
          >
            Forward
          </button>

          <button
            onClick={() => onDeleteBook(book.id)}
            className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
          >
            Delete
          </button>
        </div>
      </div>
    </article>
  );
}

export default BookCard;
