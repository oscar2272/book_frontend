import { Link, useParams } from "react-router";
import { useState } from "react";

const mockUser = {
  id: 1,
  username: "user123",
  isAdmin: true, // ✅ 관리자 여부
};

const mockBook = {
  id: 1,
  title: "예시 책 제목",
  author: "홍길동",
  publishedAt: "2023-12-01",
  avgRating: 4.3,
  reviewCount: 2,
  reviews: [
    {
      id: 1,
      content: "정말 유익한 책이에요!",
      author: "user123",
      authorId: 1,
      createdAt: "2025-07-25",
    },
    {
      id: 2,
      content: "전반적으로 괜찮아요.",
      author: "booklover",
      authorId: 2,
      createdAt: "2025-07-24",
    },
  ],
};

export default function BookDetailPage() {
  const { id } = useParams();
  const user = mockUser;
  const [reviews, setReviews] = useState(mockBook.reviews);
  const [newReview, setNewReview] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState("");

  if (parseInt(id ?? "") !== mockBook.id) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <p>도서를 찾을 수 없습니다. (404)</p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReview.trim()) return;

    const newId = reviews.length + 1;
    const today = new Date().toISOString().split("T")[0];

    setReviews([
      ...reviews,
      {
        id: newId,
        content: newReview,
        author: user.username,
        authorId: user.id,
        createdAt: today,
      },
    ]);
    setNewReview("");
  };

  const handleEdit = (id: number, content: string) => {
    setEditingId(id);
    setEditContent(content);
  };

  const handleEditSubmit = (id: number) => {
    setReviews(
      reviews.map((r) => (r.id === id ? { ...r, content: editContent } : r))
    );
    setEditingId(null);
    setEditContent("");
  };

  const handleDelete = (id: number) => {
    setReviews(reviews.filter((r) => r.id !== id));
  };

  const handleDeleteBook = () => {
    const confirmed = window.confirm("정말 이 도서를 삭제하시겠습니까?");
    if (confirmed) {
      alert("삭제 처리되었습니다 (실제 API 연결 필요)");
      // 예: navigate('/') 등 목록 페이지로 이동
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">{mockBook.title}</h2>
          <div className="flex gap-3 items-center">
            <Link to="/" className="text-sm text-blue-500 hover:underline">
              ← 목록으로
            </Link>
            {user?.isAdmin && (
              <>
                <Link
                  to={`/books/${mockBook.id}/edit`}
                  className="text-sm text-yellow-600 hover:underline"
                >
                  도서 수정
                </Link>
                <button
                  className="text-sm text-red-600 hover:underline"
                  onClick={handleDeleteBook}
                >
                  도서 삭제
                </button>
              </>
            )}
          </div>
        </div>

        <p className="text-gray-600 mb-1">저자: {mockBook.author}</p>
        <p className="text-gray-600 mb-1">출판일: {mockBook.publishedAt}</p>
        <p className="text-gray-700 mb-4">
          ⭐ 평균 평점: {mockBook.avgRating} / 리뷰 {reviews.length}개
        </p>

        <hr className="my-4" />

        <h3 className="text-xl font-semibold mb-3">리뷰</h3>
        <ul className="space-y-4 mb-6">
          {reviews.map((review) => (
            <li key={review.id} className="border-t pt-2">
              {editingId === review.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full border rounded px-2 py-1"
                    rows={2}
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditSubmit(review.id)}
                      className="text-blue-500 hover:underline"
                    >
                      저장
                    </button>
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-gray-500 hover:underline"
                    >
                      취소
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-gray-800">{review.content}</p>
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>
                      - {review.author}, {review.createdAt}
                    </span>
                    {user && user.id === review.authorId && (
                      <div className="space-x-2">
                        <button
                          onClick={() => handleEdit(review.id, review.content)}
                          className="text-blue-500 hover:underline"
                        >
                          수정
                        </button>
                        <button
                          onClick={() => handleDelete(review.id)}
                          className="text-red-500 hover:underline"
                        >
                          삭제
                        </button>
                      </div>
                    )}
                  </div>
                </>
              )}
            </li>
          ))}
        </ul>

        {user ? (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <textarea
              placeholder="리뷰를 입력하세요"
              value={newReview}
              onChange={(e) => setNewReview(e.target.value)}
              className="w-full border rounded px-3 py-2"
              rows={3}
            />
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              리뷰 등록
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500">
            리뷰를 작성하려면 로그인해주세요.
          </p>
        )}
      </div>
    </div>
  );
}
