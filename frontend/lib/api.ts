import type {
  Book,
  BookDetail,
  FeedItem,
  Recommendation,
  Review,
  Status,
  User,
  UserBook,
  UserSearchResult,
  PublicProfile,
} from "./types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null
): Promise<T> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") ? await res.json() : null;

  if (!res.ok) {
    throw new ApiError(body?.error || `Erreur ${res.status}`, res.status);
  }
  return body as T;
}

export const api = {
  register: (data: { username: string; email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  login: (data: { email: string; password: string }) =>
    request<{ user: User; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  me: (token: string) => request<User>("/auth/me", {}, token),

  searchBooks: (params: { search?: string; mood?: string; pace?: string; genre?: string }) => {
    const qs = new URLSearchParams(
      Object.fromEntries(Object.entries(params).filter(([, v]) => v))
    ).toString();
    return request<Book[]>(`/books${qs ? `?${qs}` : ""}`);
  },

  upcomingBooks: () => request<Book[]>("/books/upcoming"),

  bookDetail: (id: number | string) => request<BookDetail>(`/books/${id}`),

  myLibrary: (token: string, status?: Status) =>
    request<UserBook[]>(`/library${status ? `?status=${status}` : ""}`, {}, token),

  addToLibrary: (
    token: string,
    data: { book_id: number; status: Status; rating?: number | null }
  ) =>
    request<UserBook>(
      "/library",
      { method: "POST", body: JSON.stringify(data) },
      token
    ),

  addReview: (
    token: string,
    data: { book_id: number; content: string; has_spoiler?: boolean }
  ) =>
    request<Review>(
      "/library/reviews",
      { method: "POST", body: JSON.stringify(data) },
      token
    ),

  follow: (token: string, userId: number) =>
    request<{ success: boolean }>(
      `/social/follow/${userId}`,
      { method: "POST" },
      token
    ),

  unfollow: (token: string, userId: number) =>
    request<{ success: boolean }>(
      `/social/follow/${userId}`,
      { method: "DELETE" },
      token
    ),

  feed: (token: string) => request<FeedItem[]>("/social/feed", {}, token),

  recommend: (
    token: string,
    data: { to_user_id: number; book_id: number; message?: string }
  ) =>
    request<Recommendation>(
      "/social/recommend",
      { method: "POST", body: JSON.stringify(data) },
      token
    ),

  recommendations: (token: string) =>
    request<Recommendation[]>("/social/recommendations", {}, token),

  searchUsers: (token: string, q: string) =>
    request<UserSearchResult[]>(`/users/search?q=${encodeURIComponent(q)}`, {}, token),

  userProfile: (token: string, id: number | string) =>
    request<PublicProfile>(`/users/${id}`, {}, token),

  userBooks: (token: string, id: number | string, status?: Status) =>
    request<UserBook[]>(
      `/users/${id}/books${status ? `?status=${status}` : ""}`,
      {},
      token
    ),
};
