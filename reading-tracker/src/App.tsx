import { useEffect, useState } from "react";
import StatsBar from "./components/StatsBar";
import type {
  Book,
  OpenLibraryResponse,
  SortBy,
  SortDirection,
  StatusFilter,
} from "./types";

// Sample array when starting app
const starterBooks: Book[] = [
  {
    id: "1",
    title: "Ogilvy on Advertising",
    author: "David Ogilvy",
    status: "to-read",
    dateAdded: Date.now(),
  },
];

function App() {
  // Books currently in the user's library.
  // The function form of useState runs only once when the app first loads.
  // First, we try to load the saved library from localStorage.
  // If there is nothing saved yet, we fall back to starterBooks.
  const [library, setLibrary] = useState<Book[]>(() => {
    const savedLibrary = localStorage.getItem("reading-tracker-library");

    if (!savedLibrary) {
      return starterBooks;
    }

    try {
      return JSON.parse(savedLibrary) as Book[];
    } catch {
      // If the saved data is broken for some reason, do not crash the app.
      // Just restart with the starter books.
      return starterBooks;
    }
  });

  // This state controls whether the app is in light mode or dark mode.
  // It also loads the saved theme when the app first starts.
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem("reading-tracker-theme") === "dark";
  });

  // Search/filter text for books already in library
  const [librarySearch, setLibrarySearch] = useState("");

  // Search state for Open Library API
  const [bookQuery, setBookQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // State for the library controls.
  // These do not change the actual library array; they only affect what is displayed.
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortBy, setSortBy] = useState<SortBy>("dateAdded");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  // This is a side effect: saving data outside of React.
  // Every time the library changes, this writes the latest library to localStorage.
  // That is what makes the user's books survive a browser refresh.
  useEffect(() => {
    localStorage.setItem("reading-tracker-library", JSON.stringify(library));
  }, [library]);

  // This side effect saves the selected theme and puts/removes the "dark" class
  // on the root html element. That gives the project a class-based dark mode toggle.
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("reading-tracker-theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("reading-tracker-theme", "light");
    }
  }, [isDarkMode]);

  // This is DERIVED DATA.
  // We do not store visibleLibrary in useState because it can be recalculated
  // from the current library, search text, status filter, and sort settings.
  const visibleLibrary = library
    // 1. Text search: only keep books whose title or author matches the search box.
    .filter((book) => {
      const query = librarySearch.toLowerCase().trim();

      return (
        book.title.toLowerCase().includes(query) ||
        book.author.toLowerCase().includes(query)
      );
    })
    // 2. Status filter: if statusFilter is "all", keep everything.
    // Otherwise, keep only books with the selected status.
    .filter((book) => {
      return statusFilter === "all" || book.status === statusFilter;
    })
    // 3. Sorting: arrange the filtered books based on the user's sort controls.
    .sort((a, b) => {
      let comparison = 0;

      if (sortBy === "title") {
        comparison = a.title.localeCompare(b.title);
      }

      if (sortBy === "author") {
        comparison = a.author.localeCompare(b.author);
      }

      if (sortBy === "dateAdded") {
        comparison = a.dateAdded - b.dateAdded;
      }

      // If direction is ascending, use comparison normally.
      // If direction is descending, flip the sign.
      return sortDirection === "asc" ? comparison : -comparison;
    });

  // Calls Open Library API and stores the results in searchResults
  async function searchOpenLibrary() {
    const trimmedQuery = bookQuery.trim();

    if (trimmedQuery === "") {
      setError("Type a book title or author before searching.");
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?q=${encodeURIComponent(trimmedQuery)}&limit=10`
      );

      if (!response.ok) {
        throw new Error("Search failed");
      }

      const data: OpenLibraryResponse = await response.json();

      const booksFromApi: Book[] = data.docs.map((doc) => ({
        id: doc.key,
        title: doc.title ?? "Unknown title",
        author: doc.author_name?.[0] ?? "Unknown author",
        year: doc.first_publish_year,
        coverUrl: doc.cover_i
          ? `https://covers.openlibrary.org/b/id/${doc.cover_i}-M.jpg`
          : undefined,
        status: "to-read",
        dateAdded: Date.now(),
      }));

      setSearchResults(booksFromApi);

      if (booksFromApi.length === 0) {
        setMessage("No results found.");
      }
    } catch {
      setError("Could not search books. Try again.");
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  }

  // Adds a search result to the library and prevents duplicates
  function addBookToLibrary(bookToAdd: Book) {
    const alreadyExists = library.some((book) => book.id === bookToAdd.id);

    if (alreadyExists) {
      setMessage(`${bookToAdd.title} is already in your library.`);
      return;
    }

    setLibrary([
      ...library,
      {
        ...bookToAdd,
        status: "to-read",
        rating: undefined,
        dateAdded: Date.now(),
      },
    ]);

    setMessage(`${bookToAdd.title} added to your library.`);
  }

  // Moves a book forward through the status pipeline
  function moveForward(id: string) {
    setLibrary(
      library.map((book) => {
        if (book.id !== id) return book;

        if (book.status === "to-read") {
          return { ...book, status: "reading" };
        }

        if (book.status === "reading") {
          return { ...book, status: "finished" };
        }

        return book;
      })
    );
  }

  // Moves a book backward through the status pipeline
  function moveBack(id: string) {
    setLibrary(
      library.map((book) => {
        if (book.id !== id) return book;

        if (book.status === "finished") {
          return { ...book, status: "reading", rating: undefined };
        }

        if (book.status === "reading") {
          return { ...book, status: "to-read" };
        }

        return book;
      })
    );
  }

  // Deletes a book from the library array
  function deleteBook(id: string) {
    setLibrary(library.filter((book) => book.id !== id));
  }

  // Updates the rating for a finished book
  function rateBook(id: string, rating: number) {
    setLibrary(
      library.map((book) => (book.id === id ? { ...book, rating } : book))
    );
  }

  // Derived stats
  const toReadCount = library.filter((book) => book.status === "to-read").length;
  const readingCount = library.filter((book) => book.status === "reading").length;
  const finishedBooks = library.filter((book) => book.status === "finished");
  const finishedCount = finishedBooks.length;

  const ratedFinishedBooks = finishedBooks.filter(
    (book) => book.rating !== undefined
  );

  const averageRating =
    ratedFinishedBooks.length === 0
      ? "N/A"
      : (
          ratedFinishedBooks.reduce((sum, book) => sum + (book.rating ?? 0), 0) /
          ratedFinishedBooks.length
        ).toFixed(1);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors dark:bg-slate-950 dark:text-slate-100">
      <main className="mx-auto max-w-4xl p-6">
        <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-bold">Reading Tracker</h1>
            <p className="mt-2 text-slate-600 dark:text-slate-300">
              Search books, track your reading, and save your library.
            </p>
          </div>

          {/* Dark mode toggle.
            Clicking this button flips isDarkMode.
            The useEffect above saves the choice and adds/removes the "dark" class.
          */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="rounded-lg border border-slate-300 bg-white px-4 py-2 font-semibold text-slate-900 shadow-sm hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
          >
            {isDarkMode ? "☀️ Light mode" : "🌙 Dark mode"}
          </button>
        </header>

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <h2 className="text-xl font-semibold">Search Open Library</h2>

          <form
            className="mt-2 flex flex-col gap-2 sm:flex-row"
            onSubmit={(event) => {
              event.preventDefault();
              void searchOpenLibrary();
            }}
          >
            <input
              id="book-query"
              type="text"
              value={bookQuery}
              onChange={(event) => setBookQuery(event.target.value)}
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

          {isLoading && <p className="mt-3 text-slate-500 dark:text-slate-400">Searching...</p>}
          {error && <p className="mt-3 text-red-600 dark:text-red-400">{error}</p>}
          {message && <p className="mt-3 text-slate-600 dark:text-slate-300">{message}</p>}

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
                      onClick={() => addBookToLibrary(book)}
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

        <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <label htmlFor="library-search" className="block text-xl font-semibold">
            Search My Library
          </label>

          <input
            id="library-search"
            type="text"
            value={librarySearch}
            onChange={(event) => setLibrarySearch(event.target.value)}
            placeholder="Search your library by title or author"
            className="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
          />

          {/*
            These controls are the assignment's required library filter/sort UI.
            Changing them updates state, which recalculates visibleLibrary above.
          */}
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <label className="block">
              <span className="font-semibold">Filter status</span>
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="all">All</option>
                <option value="to-read">To Read</option>
                <option value="reading">Reading</option>
                <option value="finished">Finished</option>
              </select>
            </label>

            <label className="block">
              <span className="font-semibold">Sort by</span>
              <select
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as SortBy)}
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="dateAdded">Date added</option>
                <option value="title">Title</option>
                <option value="author">Author</option>
              </select>
            </label>

            <label className="block">
              <span className="font-semibold">Direction</span>
              <select
                value={sortDirection}
                onChange={(event) =>
                  setSortDirection(event.target.value as SortDirection)
                }
                className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </label>
          </div>
        </section>

        <StatsBar
          toReadCount={toReadCount}
          readingCount={readingCount}
          finishedCount={finishedCount}
          averageRating={averageRating}
        />

        <section className="mt-6">
          <h2 className="text-2xl font-semibold">My Library</h2>

          {library.length === 0 ? (
            <p className="mt-4 text-slate-500 dark:text-slate-400">No books yet.</p>
          ) : visibleLibrary.length === 0 ? (
            <p className="mt-4 text-slate-500 dark:text-slate-400">No books match your current filters.</p>
          ) : (
            <div className="mt-4 grid gap-4">
              {visibleLibrary.map((book) => (
                <article
                  key={book.id}
                  className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900"
                >
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

                    {book.status === "finished" && (
                      <div className="mt-3">
                        <p>Rating:</p>
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            onClick={() => rateBook(book.id, star)}
                            className="mr-1 text-xl text-yellow-500"
                          >
                            {book.rating && book.rating >= star ? "★" : "☆"}
                          </button>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex flex-wrap gap-2">
                      <button
                        onClick={() => moveBack(book.id)}
                        className="rounded bg-slate-200 px-3 py-1 text-slate-900 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600"
                      >
                        Back
                      </button>

                      <button
                        onClick={() => moveForward(book.id)}
                        className="rounded bg-blue-600 px-3 py-1 text-white hover:bg-blue-700"
                      >
                        Forward
                      </button>

                      <button
                        onClick={() => deleteBook(book.id)}
                        className="rounded bg-red-600 px-3 py-1 text-white hover:bg-red-700"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default App;
