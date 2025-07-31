import { fetchWithCSRF } from "../auth/user_api";

const BASE_URL = "http://127.0.0.1:8000";

// 리뷰목록 조회
export async function getReviews(bookId: string) {
  const res = await fetch(`${BASE_URL}/books/${bookId}/reviews/`, {
    method: "GET",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return res.json();
}

// 리뷰 상세 조회
export async function getReview(bookId: string, reviewId: string) {
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) {
    throw new Error("Failed to fetch review");
  }
  return res.json();
}

//리뷰 등록
export async function createReview(bookId: string, data: FormData) {
  const res = await fetchWithCSRF(`${BASE_URL}/reviews/`, {
    method: "POST",
    credentials: "include",
    body: data,
  });

  if (!res.ok) {
    throw new Error("Failed to create review");
  }

  return res.json();
}

// 리뷰 수정
export async function updateReview(
  bookId: string,
  reviewId: string,
  data: FormData
) {
  const res = await fetchWithCSRF(`${BASE_URL}/reviews/${reviewId}/`, {
    method: "PUT",
    credentials: "include",
    body: data,
  });

  if (!res.ok) {
    throw new Error("Failed to update review");
  }

  return res.json();
}

// 리뷰 삭제
export async function deleteReview(bookId: string, reviewId: string) {
  const res = await fetchWithCSRF(`${BASE_URL}/reviews/${reviewId}/`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete review");
  }

  return res.json();
}
