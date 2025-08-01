import {
  Link,
  useParams,
  useNavigate,
  useFetcher,
  redirect,
} from "react-router";
import { useEffect, useState } from "react";
import { getCurrentUser } from "~/features/auth/user_api";
import type { Route } from "./+types/book-detail-page";
import { deleteBook, getBook } from "../book_api";
import {
  createReview,
  updateReview,
  deleteReview,
} from "~/features/review/review_api";

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
  const action = formData.get("action")?.toString();

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
    if (action === "delete-review") {
      // 리뷰 삭제
      const reviewId = formData.get("review_id")?.toString();
      if (!reviewId) {
        throw new Response("리뷰 ID가 없습니다.", { status: 400 });
      }
      await deleteReview(bookId, reviewId);
    } else if (action === "delete-book") {
      // 도서 삭제
      await deleteBook(bookId);
      return redirect("/");
    }
  }
}

// 별점 표시 컴포넌트
const StarRating = ({ rating }: { rating: number }) => {
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`w-4 h-4 ${
            star <= rating ? "text-yellow-400 fill-current" : "text-gray-300"
          }`}
          viewBox="0 0 20 20"
        >
          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
        </svg>
      ))}
      <span className="ml-1 text-sm text-gray-600">({rating})</span>
    </div>
  );
};

// 별점 입력 컴포넌트
const StarInput = ({
  name,
  defaultValue = 5,
  onChange,
}: {
  name: string;
  defaultValue?: number;
  onChange?: (rating: number) => void;
}) => {
  const [rating, setRating] = useState(defaultValue);
  const [hover, setHover] = useState(0);

  const handleClick = (star: number) => {
    setRating(star);
    onChange?.(star);
  };

  return (
    <div className="flex items-center gap-1">
      <span className="text-sm text-gray-700 mr-2">평점:</span>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={`w-6 h-6 transition-colors ${
            star <= (hover || rating)
              ? "text-yellow-400"
              : "text-gray-300 hover:text-yellow-200"
          }`}
          onMouseEnter={() => setHover(star)}
          onMouseLeave={() => setHover(0)}
          onClick={() => handleClick(star)}
        >
          <svg className="w-full h-full fill-current" viewBox="0 0 20 20">
            <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
          </svg>
        </button>
      ))}
      <input type="hidden" name={name} value={rating} />
    </div>
  );
};

export default function BookDetailPage({ loaderData }: Route.ComponentProps) {
  const { book, userId, isAdmin } = loaderData;
  const { id } = useParams();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const [editContent, setEditContent] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editRating, setEditRating] = useState(5);

  useEffect(() => {
    if (fetcher.state === "idle" && editingId !== null) {
      setEditingId(null);
      setEditContent("");
      setEditRating(5);
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
    <div className="min-h-screen bg-gray-50 py-10 px-4 max-w-4xl mx-auto">
      {/* 도서 정보 섹션 */}
      <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
        <h1 className="text-3xl font-bold mb-4 text-gray-900">{book.title}</h1>
        <div className="flex flex-wrap items-center gap-4 text-gray-600 mb-6">
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            {book.author.name}
          </span>
          <span className="flex items-center gap-2">
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            {new Date(book.published_at).toLocaleDateString()}
          </span>
        </div>

        <div className="flex items-center gap-6 mb-6">
          <div className="flex items-center gap-2">
            <StarRating rating={book.average_rating} />
            <span className="text-sm text-gray-500">평균 평점</span>
          </div>
          <span className="text-sm text-gray-500">
            리뷰 {book.review_count}개
          </span>
        </div>

        {isAdmin && (
          <fetcher.Form method="DELETE">
            <input type="hidden" name="action" value="delete-book" />
            <button
              type="submit"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 flex items-center gap-2"
              onClick={(e) => {
                if (!window.confirm("정말 이 도서를 삭제하시겠습니까?")) {
                  e.preventDefault();
                }
              }}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              도서 삭제
            </button>
          </fetcher.Form>
        )}
      </div>

      {/* 리뷰 목록 섹션 */}
      <section className="mb-8">
        <h2 className="text-2xl font-bold mb-6 text-gray-900">리뷰</h2>

        <div className="space-y-4">
          {book.reviews.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <svg
                className="w-16 h-16 text-gray-300 mx-auto mb-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 8h10m0 0V6a2 2 0 00-2-2H9a2 2 0 00-2 2v2m10 0v10a2 2 0 01-2 2H9a2 2 0 01-2-2V8m10 0H7"
                />
              </svg>
              <p className="text-gray-500 text-lg">
                아직 작성된 리뷰가 없습니다.
              </p>
              <p className="text-gray-400 text-sm mt-2">
                첫 번째 리뷰를 작성해보세요!
              </p>
            </div>
          ) : (
            book.reviews.map((review: any) => (
              <div
                key={review.review_id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200"
              >
                {editingId === review.review_id ? (
                  <fetcher.Form method="PUT" className="space-y-4">
                    <input
                      type="hidden"
                      name="review_id"
                      value={review.review_id}
                    />
                    <textarea
                      name="content"
                      className="w-full border-2 border-gray-200 rounded-lg p-4 focus:border-blue-500 focus:ring-0 resize-none transition-colors duration-200"
                      rows={4}
                      value={editContent}
                      onChange={(e) => setEditContent(e.target.value)}
                      placeholder="리뷰 내용을 입력하세요..."
                    />
                    <StarInput
                      name="rating"
                      defaultValue={review.rating}
                      onChange={setEditRating}
                    />
                    <div className="flex gap-3 pt-2">
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                        저장
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingId(null)}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors duration-200"
                      >
                        취소
                      </button>
                    </div>
                  </fetcher.Form>
                ) : (
                  <div>
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {review.user_name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">
                            {review.user_name}
                          </p>
                          <div className="flex items-center gap-2">
                            <StarRating rating={review.rating} />
                            <span className="text-sm text-gray-400">
                              {new Date(review.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>

                      {userId === review.user_id && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              setEditingId(review.review_id);
                              setEditContent(review.content);
                              setEditRating(review.rating);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1 rounded transition-colors duration-200"
                            title="수정"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>
                          <fetcher.Form
                            method="DELETE"
                            style={{ display: "inline" }}
                          >
                            <input
                              type="hidden"
                              name="action"
                              value="delete-review"
                            />
                            <input
                              type="hidden"
                              name="review_id"
                              value={review.review_id}
                            />
                            <button
                              type="submit"
                              className="text-red-600 hover:text-red-800 p-1 rounded transition-colors duration-200"
                              title="삭제"
                              onClick={(e) => {
                                if (
                                  !window.confirm(
                                    "정말 이 리뷰를 삭제하시겠습니까?"
                                  )
                                ) {
                                  e.preventDefault();
                                }
                              }}
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={2}
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </fetcher.Form>
                        </div>
                      )}
                    </div>

                    <p className="text-gray-700 leading-relaxed">
                      {review.content}
                    </p>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </section>

      {/* 리뷰 작성 섹션 */}
      {userId ? (
        <section className="bg-white rounded-lg shadow-sm p-6">
          <h3 className="text-xl font-semibold mb-4 text-gray-900">
            리뷰 작성하기
          </h3>
          <fetcher.Form method="POST" className="space-y-4">
            <textarea
              name="content"
              className="w-full border-2 border-gray-200 rounded-lg p-4 focus:border-blue-500 focus:ring-0 resize-none transition-colors duration-200"
              rows={5}
              placeholder="이 책에 대한 당신의 생각을 자유롭게 적어주세요..."
            />
            <div className="flex items-center justify-between">
              <StarInput name="rating" defaultValue={5} />
              <button
                type="submit"
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2 font-semibold"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                리뷰 등록
              </button>
            </div>
          </fetcher.Form>
        </section>
      ) : (
        <div className="bg-white rounded-lg shadow-sm p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
            />
          </svg>
          <p className="text-gray-500 text-lg mb-2">로그인이 필요합니다</p>
          <p className="text-gray-400 text-sm">
            리뷰를 작성하려면 먼저 로그인해주세요.
          </p>
        </div>
      )}
    </div>
  );
}
