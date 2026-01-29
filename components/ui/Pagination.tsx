import Link from "next/link";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  basePath: string;
}

export default function Pagination({
  currentPage,
  totalPages,
  basePath,
}: PaginationProps) {
  return (
    <div className="flex justify-center gap-2 mt-12">
      {Array.from({ length: totalPages }).map((_, index) => {
        const page = index + 1;

        return (
          <Link
            key={page}
            href={`${basePath}?page=${page}`}
            className={`px-4 py-2 rounded-md border text-sm font-medium transition
              ${
                page === currentPage
                  ? "bg-primary text-white"
                  : "hover:bg-muted"
              }
            `}
          >
            {page}
          </Link>
        );
      })}
    </div>
  );
}
