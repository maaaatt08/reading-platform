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
      className="group flex flex-col gap-2 transition duration-150 hover:-translate-y-[3px]"
    >
      <BookCover
        src={coverUrl}
        title={title}
        className="aspect-[2/3] w-full rounded-[5px] shadow-[0_4px_10px_-4px_rgba(43,36,32,0.22)] transition-shadow duration-150 group-hover:shadow-[0_14px_22px_-8px_rgba(43,36,32,0.28)]"
      />
      <div>
        <p className="line-clamp-2 font-serif text-[13px] font-semibold leading-tight text-ink group-hover:text-accent">
          {title}
        </p>
        {author && <p className="mt-0.5 text-[11px] text-ink-soft">{author}</p>}
        {footer}
      </div>
    </Link>
  );
}
