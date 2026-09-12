export type Status = "read" | "reading" | "to_read" | "dnf";

export type User = {
  id: number;
  username: string;
  email?: string;
  bio?: string | null;
  avatar_url?: string | null;
  created_at: string;
};

export type PublicProfile = User & {
  is_followed_by_me: boolean;
  followers_count: number;
  following_count: number;
  books_read_count: number;
};

export type Book = {
  id: number;
  google_books_id?: string | null;
  title: string;
  author: string | null;
  cover_url: string | null;
  description?: string | null;
  genre: string | null;
  language?: string | null;
  release_date: string | null;
  created_at: string;
};

export type BookTag = { tag_type: "mood" | "pace" | "genre" | "literature" | "theme"; tag_value: string };

export type Review = {
  id: number;
  content: string;
  has_spoiler: boolean;
  created_at: string;
  username: string;
};

export type BookDetail = Book & { tags: BookTag[]; reviews: Review[] };

export type UserBook = {
  id: number;
  user_id: number;
  book_id: number;
  status: Status;
  rating: number | null;
  started_at: string | null;
  finished_at: string | null;
  added_at: string;
  title: string;
  author: string | null;
  cover_url: string | null;
};

export type FeedItem = {
  status: Status;
  rating: number | null;
  added_at: string;
  username: string;
  title: string;
  cover_url: string | null;
  book_id: number;
};

export type Recommendation = {
  id: number;
  message: string | null;
  created_at: string;
  from_username: string;
  book_id: number;
  title: string;
  cover_url: string | null;
};

export type UserSearchResult = { id: number; username: string; avatar_url: string | null };
