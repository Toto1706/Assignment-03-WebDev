export type Status = "to-read" | "reading" | "finished";

export type StatusFilter = "all" | Status;

export type SortBy = "title" | "author" | "dateAdded";

export type SortDirection = "asc" | "desc";

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

export type OpenLibraryDoc = {
  key: string;
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  cover_i?: number;
};

export type OpenLibraryResponse = {
  docs: OpenLibraryDoc[];
};
