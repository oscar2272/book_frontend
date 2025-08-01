import { Link, useParams, useNavigate, useFetcher } from "react-router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "~/features/auth/user_api";
import type { Route } from "./+types/book-detail-page";
import { deleteBook, getBook } from "../book_api";
import { createReview, updateReview } from "~/features/review/review_api";

export async function loader({ request, params }: Route.LoaderArgs) {
  const bookId = params.id;
  if (!bookId) {
    throw new Response("도서 ID가 없습니다.", { status: 400 });
  }
  const book = await getBook(bookId);
  console.log("도서 상세 정보 로드:", book);
  const user = await getCurrentUser(request);
  const userId = user?.id || null;
  const isAdmin = user?.is_admin;
  return { book, userId, isAdmin };
}

export async function action({ request, params }: Route.ActionArgs) {
  const bookId = params.id;
  const formData = await request.formData();

  if (!bookId) {
    throw new Response("도서 ID가 없습니다.", { status: 400 });
  }

  if (request.method === "POST") {
    const content = formData.get("content")?.toString() || "";
    const ratingStr = formData.get("rating")?.toString();
    const rating = ratingStr ? parseInt(ratingStr) : 5;

    if (!content || isNaN(rating)) {
      throw new Response("내용 또는 평점이 누락되었습니다.", { status: 400 });
    }

    await createReview(bookId, content, rating);
  } else if (request.method === "PUT") {
    const reviewId = formData.get("review_id")?.toString();
    const newContent = formData.get("content")?.toString() || "";
    const ratingStr = formData.get("rating")?.toString();
    const rating = ratingStr ? parseInt(ratingStr) : 5;
    console.log("도서 ID:", bookId);
    console.log("reviewId:", reviewId);
    console.log("newContent:", newContent);
    console.log("rating:", rating);
    if (!reviewId || !newContent || isNaN(rating)) {
      throw new Response("필수 데이터 누락", { status: 400 });
    }

    await updateReview(bookId, reviewId, newContent, rating);
  } else if (request.method === "DELETE") {
    // 도서 삭제 로직은 여기서 처리
    await deleteBook(bookId);
    throw new Response("도서 삭제는 아직 구현되지 않았습니다.", {
      status: 501,
    });
  }
}

export default function BookDetailPage({ loaderData }: Route.ComponentProps) {
  const { book, userId, isAdmin } = loaderData;
  const { id } = useParams();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [editContent, setEditContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  useEffect(() => {
    if (fetcher.state === "idle" && editingId !== null) {
      setEditingId(null);
      setEditContent("");
    }
  }, [fetcher.state]);
  if (!book) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <p>도서를 찾을 수 없습니다. (404)</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4 max-w-3xl mx-auto">
      <h1 className="text-3xl font-bold mb-2">{book.title}</h1>
      <p className="text-gray-600 mb-4">
        저자: {book.author.name} | 출판일:{" "}
        {new Date(book.published_at).toLocaleDateString()}
      </p>
      <p className="mb-6">
        평균 평점: {book.average_rating} / 리뷰 수: {book.review_count}
      </p>

      {isAdmin && (
        <fetcher.Form method="DELETE">
          <button
            type="submit"
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 mb-6"
            onClick={(e) => {
              if (!window.confirm("정말 이 도서를 삭제하시겠습니까?")) {
                e.preventDefault();
              }
            }}
          >
            도서 삭제
          </button>
        </fetcher.Form>
      )}

      <section>
        <h2 className="text-xl font-semibold mb-3">리뷰 목록</h2>
        {book.reviews.length === 0 ? (
          <p className="text-gray-500">아직 리뷰가 없습니다.</p>
        ) : (
          book.reviews.map((review: any) => (
            <div
              key={review.review_id}
              className="border rounded p-3 mb-3 bg-white"
            >
              {editingId === review.review_id ? (
                <fetcher.Form method="PUT">
                  <input
                    type="hidden"
                    name="review_id"
                    value={review.review_id}
                  />
                  <textarea
                    name="content"
                    className="w-full border p-2 mb-2"
                    rows={3}
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                  />
                  <input
                    type="number"
                    name="rating"
                    min={1}
                    max={5}
                    defaultValue={review.rating}
                    className="border rounded p-1 mr-2"
                  />
                  <div className="mt-2 space-x-2">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 text-white rounded"
                    >
                      저장
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingId(null)}
                      className="px-3 py-1 bg-gray-300 text-black rounded"
                    >
                      취소
                    </button>
                  </div>
                </fetcher.Form>
              ) : (
                <>
                  <p>{review.content}</p>
                  <p className="text-sm text-gray-500">
                    작성자: {review.user_name} | 평점: {review.rating} | 작성일:{" "}
                    {new Date(review.created_at).toLocaleString()}
                  </p>
                  {userId === review.user_id && (
                    <button
                      onClick={() => {
                        setEditingId(review.review_id);
                        setEditContent(review.content);
                      }}
                      className="text-blue-600 hover:underline mt-2"
                    >
                      수정
                    </button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </section>

      {userId ? (
        <section className="mt-8">
          <h2 className="text-xl font-semibold mb-3">리뷰 작성</h2>
          <fetcher.Form method="POST">
            <textarea
              name="content"
              className="w-full border rounded p-2 mb-2"
              rows={4}
              placeholder="리뷰를 입력하세요..."
            />
            <input
              type="number"
              name="rating"
              min={1}
              max={5}
              defaultValue={5}
              className="border rounded p-1 mr-2"
            />
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              작성
            </button>
          </fetcher.Form>
        </section>
      ) : (
        <p className="mt-8 text-gray-500">
          로그인 후 리뷰를 작성할 수 있습니다.
        </p>
      )}
    </div>
  );
}
