import type { SortBy, SortDirection, StatusFilter } from "../types";

type LibraryControlsProps = {
  librarySearch: string;
  statusFilter: StatusFilter;
  sortBy: SortBy;
  sortDirection: SortDirection;
  onLibrarySearchChange: (value: string) => void;
  onStatusFilterChange: (value: StatusFilter) => void;
  onSortByChange: (value: SortBy) => void;
  onSortDirectionChange: (value: SortDirection) => void;
};

function LibraryControls({
  librarySearch,
  statusFilter,
  sortBy,
  sortDirection,
  onLibrarySearchChange,
  onStatusFilterChange,
  onSortByChange,
  onSortDirectionChange,
}: LibraryControlsProps) {
  return (
    <section className="mt-6 rounded-lg border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <label htmlFor="library-search" className="block text-xl font-semibold">
        Search My Library
      </label>

      <input
        id="library-search"
        type="text"
        value={librarySearch}
        onChange={(event) => onLibrarySearchChange(event.target.value)}
        placeholder="Search your library by title or author"
        className="mt-2 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 placeholder:text-slate-400 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
      />

      {/*
        These controls are the assignment's required library filter/sort UI.
        Changing them updates state in App, which recalculates visibleLibrary.
      */}
      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <label className="block">
          <span className="font-semibold">Filter status</span>
          <select
            value={statusFilter}
            onChange={(event) =>
              onStatusFilterChange(event.target.value as StatusFilter)
            }
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
            onChange={(event) => onSortByChange(event.target.value as SortBy)}
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
              onSortDirectionChange(event.target.value as SortDirection)
            }
            className="mt-1 w-full rounded border border-slate-300 bg-white px-3 py-2 text-slate-900 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="asc">Ascending</option>
            <option value="desc">Descending</option>
          </select>
        </label>
      </div>
    </section>
  );
}

export default LibraryControls;
