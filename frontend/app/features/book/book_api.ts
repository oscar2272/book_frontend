import { fetchWithCSRF } from "../auth/user_api";

const BASE_URL = "http://localhost:8000";

export async function getBooks() {
  const res = await fetch(`${BASE_URL}/books/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch books");
  }

  return res.json();
}

//수정필요
export async function createBook(data: FormData) {
  const res = await fetchWithCSRF(`${BASE_URL}/books/`, {
    method: "POST",
    credentials: "include",
    body: data,
  });

  if (!res.ok) {
    throw new Error("Failed to create book");
  }

  return res.json();
}

export async function getBook(id: string) {
  const res = await fetch(`${BASE_URL}/books/${id}/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch book");
  }

  return res.json();
}

export async function updateBook(id: string, data: FormData) {
  const res = await fetchWithCSRF(`${BASE_URL}/books/${id}/`, {
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
  const res = await fetchWithCSRF(`${BASE_URL}/books/${id}/`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete book");
  }

  return res.json();
}
