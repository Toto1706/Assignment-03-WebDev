import type { Book } from "../types";

type SearchPanelProps = {
  bookQuery: string;
  searchResults: Book[];
  isLoading: boolean;
  error: string;
  message: string;
  onBookQueryChange: (value: string) => void;
  onSearch: () => void | Promise<void>;
  onAddBookToLibrary: (book: Book) => void;
};

function SearchPanel({
  bookQuery,
  searchResults,
  isLoading,
  error,
  message,
  onBookQueryChange,
  onSearch,
  onAddBookToLibrary,
}: SearchPanelProps) {
  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <h2 className="text-xl font-semibold">Search Open Library</h2>

      {/*
        This form does not reload the page.
        preventDefault keeps React in control, then onSearch calls the Open Library API.
      */}
      <form
        className="mt-2 flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          void onSearch();
        }}
      >
        <input
          id="book-query"
          type="text"
          value={bookQuery}
          onChange={(event) => onBookQueryChange(event.target.value)}
          placeholder="Search for books to add"
          className="w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
        />

        <button
          type="submit"
          className="rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
        >
          Search
        </button>
      </form>

      {isLoading && (
        <p className="mt-3 text-slate-500 dark:text-slate-400">Searching...</p>
      )}
      {error && <p className="mt-3 text-red-600 dark:text-red-400">{error}</p>}
      {message && (
        <p className="mt-3 text-slate-600 dark:text-slate-300">{message}</p>
      )}

      {/* Search results returned by Open Library. */}
      {searchResults.length > 0 && (
        <div className="mt-4 grid gap-3">
          {searchResults.map((book) => (
            <article
              key={book.id}
              className="flex gap-4 rounded border border-slate-200 bg-slate-50 p-3 shadow-sm dark:border-slate-800 dark:bg-slate-950"
            >
              {book.coverUrl ? (
                <img
                  src={book.coverUrl}
                  alt={`Cover of ${book.title}`}
                  className="h-28 w-20 rounded object-cover"
                />
              ) : (
                <div className="flex h-28 w-20 items-center justify-center rounded bg-slate-200 text-center text-xs text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                  No cover
                </div>
              )}

              <div className="flex-1">
                <h3 className="font-bold">{book.title}</h3>
                <p className="text-slate-600 dark:text-slate-300">by {book.author}</p>
                {book.year && <p className="text-sm">First published: {book.year}</p>}

                <button
                  onClick={() => onAddBookToLibrary(book)}
                  className="mt-3 rounded bg-green-600 px-3 py-1 text-white hover:bg-green-700"
                >
                  Add to Library
                </button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

export default SearchPanel;
