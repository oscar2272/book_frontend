import { fetchWithCSRF } from "../auth/user_api";

const BASE_URL = "http://localhost:8000";
export async function getAuthors() {
  const res = await fetch(`${BASE_URL}/authors/`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("저자 조회 실패");
  return res.json();
}

export async function createAuthor(data: FormData) {
  const res = await fetchWithCSRF(`${BASE_URL}/authors/`, {
    method: "POST",
    body: data,
  });
  if (!res.ok) throw new Error("저자 등록 실패");
  return res.json();
}

export async function updateAuthor(id: string, data: FormData) {
  const res = await fetchWithCSRF(`${BASE_URL}/authors/${id}/`, {
    method: "PUT",
    body: data,
  });
  if (!res.ok) throw new Error("저자 수정 실패");
  return res.json();
}

export async function deleteAuthor(id: string) {
  const res = await fetchWithCSRF(`${BASE_URL}/authors/${id}/`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("저자 삭제 실패");
  return res.json();
}
