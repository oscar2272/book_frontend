import { ensureCSRFToken } from "../auth/user_api";

const BASE_URL = "http://localhost:8000/api";

export async function getAuthors() {
  const res = await fetch(`${BASE_URL}/authors/`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("저자 조회 실패");
  return res.json();
}

export async function createAuthor(author: string) {
  const token = await ensureCSRFToken();

  const res = await fetch(`${BASE_URL}/authors/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": token.csrfToken, // 반드시 넣어야 함
    },
    body: JSON.stringify({ name: author }),
  });
  if (!res.ok) throw new Error("저자 등록 실패");
  return res.json();
}

export async function updateAuthor(id: string, data: FormData) {
  await ensureCSRFToken();

  const res = await fetch(`${BASE_URL}/authors/${id}/`, {
    method: "PUT",
    body: data,
    credentials: "include",
  });
  if (!res.ok) throw new Error("저자 수정 실패");
  return res.json();
}

// 저자 삭제
export async function deleteAuthor(id: string) {
  await ensureCSRFToken();

  const res = await fetch(`${BASE_URL}/authors/${id}/`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("저자 삭제 실패");
  return res.json();
}
