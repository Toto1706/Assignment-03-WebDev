import { useState } from "react";

// Union for status of book
type Status = "to-read" | "reading" | "finished";

// Book datatype
type Book = {
  id: string;
  title: string;
  author: string;
  status: Status;
  rating?: number;
  dateAdded: number;
  year?: number;
  coverUrl?: string;
};

type OpenLibraryDoc = {
  key: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
};

type OpenLibraryResponse = {
  docs: OpenLibraryDoc[];
};

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
  // Books currently in user's library
  const [library, setLibrary] = useState<Book[]>(starterBooks);

  // Search/filter text for books already in library
  const [librarySearch, setLibrarySearch] = useState("");

  // Search state for Open Library API
  const [bookQuery, setBookQuery] = useState("");
  const [searchResults, setSearchResults] = useState<Book[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Filters existing library based on the library search input
  const filteredLibrary = library.filter((book) => {
    const query = librarySearch.toLowerCase().trim();

    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
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
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-4xl font-bold">Reading Tracker</h1>

      <section className="mt-6 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">Search Open Library</h2>

        <form
          className="mt-2 flex gap-2"
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
            className="w-full rounded border px-3 py-2"
          />

          <button
            type="submit"
            className="rounded bg-blue-600 px-4 py-2 text-white"
          >
            Search
          </button>
        </form>

        {isLoading && <p className="mt-3 text-gray-500">Searching...</p>}
        {error && <p className="mt-3 text-red-600">{error}</p>}
        {message && <p className="mt-3 text-gray-600">{message}</p>}

        {searchResults.length > 0 && (
          <div className="mt-4 grid gap-3">
            {searchResults.map((book) => (
              <article
                key={book.id}
                className="flex gap-4 rounded border p-3 shadow-sm"
              >
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={`Cover of ${book.title}`}
                    className="h-28 w-20 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-28 w-20 items-center justify-center rounded bg-gray-200 text-center text-xs text-gray-600">
                    No cover
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="font-bold">{book.title}</h3>
                  <p className="text-gray-600">by {book.author}</p>
                  {book.year && <p className="text-sm">First published: {book.year}</p>}

                  <button
                    onClick={() => addBookToLibrary(book)}
                    className="mt-3 rounded bg-green-600 px-3 py-1 text-white"
                  >
                    Add to Library
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-lg border p-4">
        <label htmlFor="library-search" className="block text-xl font-semibold">
          Search My Library
        </label>

        <input
          id="library-search"
          type="text"
          value={librarySearch}
          onChange={(event) => setLibrarySearch(event.target.value)}
          placeholder="Search your library by title or author"
          className="mt-2 w-full rounded border px-3 py-2"
        />
      </section>

      <section className="mt-6 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">Stats</h2>
        <p className="mt-2">
          {toReadCount} to read · {readingCount} reading · {finishedCount} finished
        </p>
        <p className="mt-1">Average finished-book rating: {averageRating}</p>
      </section>

      <section className="mt-6">
        <h2 className="text-2xl font-semibold">My Library</h2>

        {library.length === 0 ? (
          <p className="mt-4 text-gray-500">No books yet.</p>
        ) : filteredLibrary.length === 0 ? (
          <p className="mt-4 text-gray-500">No books match your search.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {filteredLibrary.map((book) => (
              <article
                key={book.id}
                className="flex gap-4 rounded-lg border p-4 shadow-sm"
              >
                {book.coverUrl ? (
                  <img
                    src={book.coverUrl}
                    alt={`Cover of ${book.title}`}
                    className="h-32 w-24 rounded object-cover"
                  />
                ) : (
                  <div className="flex h-32 w-24 items-center justify-center rounded bg-gray-200 text-center text-xs text-gray-600">
                    No cover
                  </div>
                )}

                <div className="flex-1">
                  <h3 className="text-xl font-bold">{book.title}</h3>
                  <p className="text-gray-600">by {book.author}</p>
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
                          className="mr-1 text-xl"
                        >
                          {book.rating && book.rating >= star ? "★" : "☆"}
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => moveBack(book.id)}
                      className="rounded bg-gray-200 px-3 py-1"
                    >
                      Back
                    </button>

                    <button
                      onClick={() => moveForward(book.id)}
                      className="rounded bg-blue-600 px-3 py-1 text-white"
                    >
                      Forward
                    </button>

                    <button
                      onClick={() => deleteBook(book.id)}
                      className="rounded bg-red-600 px-3 py-1 text-white"
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
  );
}

export default App;
