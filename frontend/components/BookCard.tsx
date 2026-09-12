import Link from "next/link";
import { BookCover } from "./BookCover";

export function BookCard({
  id,
  title,
  author,
  coverUrl,
  footer,
}: {
  id: number;
  title: string;
  author?: string | null;
  coverUrl?: string | null;
  footer?: React.ReactNode;
}) {
  return (
    <Link
      href={`/books/${id}`}
      className="group flex flex-col overflow-hidden rounded-lg border border-neutral-200 bg-white transition hover:shadow-md"
    >
      <BookCover src={coverUrl} title={title} className="h-48 w-full" />
      <div className="flex flex-1 flex-col gap-1 p-3">
        <p className="line-clamp-2 text-sm font-medium group-hover:underline">{title}</p>
        {author && <p className="text-xs text-neutral-500">{author}</p>}
        {footer && <div className="mt-auto pt-2">{footer}</div>}
      </div>
    </Link>
  );
}
