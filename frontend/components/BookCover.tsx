"use client";

import { useState } from "react";

export function BookCover({
  src,
  title,
  className = "",
}: {
  src: string | null | undefined;
  title: string;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);

  if (src && !failed) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={title}
        className={`object-cover ${className}`}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div
      className={`flex items-center justify-center bg-[#efe2d2] p-3 text-center font-serif text-sm font-semibold text-ink-soft ${className}`}
    >
      {title}
    </div>
  );
}
