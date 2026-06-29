// Union for status of book
// This limits book.status so it can only be one of these three strings.
export type Status = "to-read" | "reading" | "finished";

// These types are for the filter/sort controls.
// StatusFilter includes "all" because the user can choose to show every book.
export type StatusFilter = "all" | Status;
export type SortBy = "title" | "author" | "dateAdded";
export type SortDirection = "asc" | "desc";

// Book datatype
export type Book = {
  id: string;
  title: string;
  author: string;
  status: Status;
  rating?: number;
  dateAdded: number;
  year?: number;
  coverUrl?: string;
};

// Shape of one book result from the Open Library API.
export type OpenLibraryDoc = {
  key: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
};

// Shape of the full response from Open Library.
export type OpenLibraryResponse = {
  docs: OpenLibraryDoc[];
};