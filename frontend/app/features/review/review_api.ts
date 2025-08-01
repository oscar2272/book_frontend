import { ensureCSRFToken } from "../auth/user_api";

const BASE_URL = "http://127.0.0.1:8000/api";

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
export async function createReview(
  bookId: string,
  content: string,
  rating: number
) {
  const token = await ensureCSRFToken();
  const res = await fetch(`${BASE_URL}/reviews/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": token.csrfToken,
    },
    body: JSON.stringify({ book_id: bookId, content: content, rating }),
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
  content: string,
  rating: number
) {
  const token = await ensureCSRFToken();
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/`, {
    method: "PUT",
    credentials: "include",
    body: JSON.stringify({
      book_id: bookId,
      content: content,
      rating: rating,
    }),
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": token.csrfToken,
    },
  });

  if (!res.ok) {
    throw new Error("Failed to update review");
  }

  return res.json();
}

// 리뷰 삭제
export async function deleteReview(bookId: string, reviewId: string) {
  await ensureCSRFToken();
  const res = await fetch(`${BASE_URL}/reviews/${reviewId}/`, {
    method: "DELETE",
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to delete review");
  }
  // 204 No Content 응답은 본문이 없으므로 .json() 호출하지 않음
  if (res.status === 204) {
    console.log("Book deleted successfully");
    return null; // 삭제 완료 후 특별한 데이터 반환 없이 종료
  }

  // 다른 응답인 경우 JSON 데이터 반환
  return res.json();
}
