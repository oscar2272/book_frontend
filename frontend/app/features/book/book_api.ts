import { ensureCSRFToken } from "../auth/user_api";

const BASE_URL = "http://localhost:8000";

export async function getBooks(query: string) {
  const res = await fetch(`${BASE_URL}/api/books/${query}`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch books");
  }

  return res.json();
}

//수정필요
export async function createBook(title: string, author: string) {
  const token = await ensureCSRFToken();
  const res = await fetch(`${BASE_URL}/api/books/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": token.csrfToken,
    },
    body: JSON.stringify({ title, author }),
  });

  if (!res.ok) {
    throw new Error("Failed to create book");
  }

  return res.json();
}

export async function getBook(id: string) {
  const res = await fetch(`${BASE_URL}/api/books/${id}/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch book");
  }

  return res.json();
}

export async function updateBook(id: string, data: FormData) {
  await ensureCSRFToken();
  const res = await fetch(`${BASE_URL}/api/books/${id}/`, {
    method: "PUT",
    credentials: "include",
    body: data,
  });

  if (!res.ok) {
    throw new Error("Failed to update book");
  }

  return res.json();
}

export async function deleteBook(id: string) {
  const token = await ensureCSRFToken();
  const res = await fetch(`${BASE_URL}/api/books/${id}/delete/`, {
    method: "DELETE",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": token.csrfToken, // CSRF 토큰을 반드시 포함해야 합니다
    },
  });

  if (!res.ok) {
    throw new Error("Failed to delete book");
  }

  return res.json();
}
