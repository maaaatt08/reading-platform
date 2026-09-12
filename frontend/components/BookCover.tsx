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
      className={`flex items-center justify-center bg-neutral-200 p-2 text-center text-xs text-neutral-500 ${className}`}
    >
      {title}
    </div>
  );
}
