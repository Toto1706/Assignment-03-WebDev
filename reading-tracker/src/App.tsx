import { useState } from 'react'
import './App.css'

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
};

// Sample array when starting app, stays in memory nomatter what the user adds to the library
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

  // Hook that initializes an array that holds Book datatype, initialized from starterBooks array
  const [library, setLibrary] = useState<Book[]>(starterBooks);

  // Hook that intializes an empty string for searching books in library 
  const [search, setSearch] = useState("");

  //Search logic
  const filteredLibrary = library.filter((book) => {
    const query = search.toLowerCase();

    return (
      book.title.toLowerCase().includes(query) ||
      book.author.toLowerCase().includes(query)
    );
  });

  // Maniputlates the status of the book where Forward button has been clicked, loops through the 
  // library to find the proper book to modify
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

  
  // Maniputlates the status of the book where back (regarding reading state) 
  // button has been clicked, loops through the library to find the proper book to modify
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

  // Deletes the book from the library array
  function deleteBook(id: string) {
    setLibrary(library.filter((book) => book.id !== id));
  }

  // Updates the rating for the book where the rating was clicked
  function rateBook(id: string, rating: number) {
    setLibrary(
      library.map((book) =>
        book.id === id ? { ...book, rating } : book
      )
    );
  }

  // Arrays containing books depening on state (toRead, reading, finished)
  const toReadCount = library.filter((book) => book.status === "to-read").length;
  const readingCount = library.filter((book) => book.status === "reading").length;
  const finishedCount = library.filter((book) => book.status === "finished").length;

  // Html structure for page
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-4xl font-bold">Reading Tracker</h1>

      <section className="mt-6 rounded-lg border p-4">
        <label htmlFor="search" className="block text-xl font-semibold">
          Search Books
        </label>
        <input
          id="search"
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by title or author"
          className="mt-2 w-full rounded border px-3 py-2"
        />
      </section>

      <section className="mt-6 rounded-lg border p-4">
        <h2 className="text-xl font-semibold">Stats</h2>
        <p className="mt-2">
          {toReadCount} to read · {readingCount} reading · {finishedCount} finished
        </p>
      </section>

      <section className="mt-6">
        <h2 className="text-2xl font-semibold">My Library</h2>

        {/* Conditional render of user entered search*/}
        {filteredLibrary.length === 0 ? (
          <p className="mt-4 text-gray-500">No books yet.</p>
        ) : (
          <div className="mt-4 grid gap-4">
            {filteredLibrary.map((book) => (
              <article key={book.id} className="rounded-lg border p-4 shadow-sm">
                <h3 className="text-xl font-bold">{book.title}</h3>
                <p className="text-gray-600">by {book.author}</p>
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
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;