import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { signout } from "~/features/auth/user_api";

const mockUser = {
  id: 1,
  username: "admin",
  isAdmin: true,
};

const books = Array.from({ length: 30 }, (_, i) => ({
  id: i + 1,
  title: `책 제목 ${i + 1}`,
  author: `저자 ${i + 1}`,
  avgRating: (Math.random() * 5).toFixed(1),
  reviewCount: Math.floor(Math.random() * 100),
  createdAt: `2025-07-${(i % 30) + 1}`.padStart(10, "0"),
}));

const ITEMS_PER_PAGE = 10;
export const loader = async () => {
  return books;
};
export default function HomePage() {
  const [page, setPage] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  const ordering = searchParams.get("ordering") || "-created_at";
  const totalPages = Math.ceil(books.length / ITEMS_PER_PAGE);
  const currentItems = books.slice(
    (page - 1) * ITEMS_PER_PAGE,
    page * ITEMS_PER_PAGE
  );

  const handleSort = (field: string) => {
    const current = searchParams.get("ordering");
    const nextOrdering = current === field ? `-${field}` : field;

    setSearchParams((prev) => {
      const newParams = new URLSearchParams(prev);
      newParams.set("ordering", nextOrdering);
      return newParams;
    });
  };

  const renderSortButton = (label: string, field: string) => {
    const isActive = ordering.includes(field);
    const isDesc = ordering === `-${field}`;
    const arrow = isActive ? (isDesc ? "↓" : "↑") : "";

    return (
      <button
        onClick={() => handleSort(field)}
        className={`px-3 py-1 border rounded hover:bg-gray-100 ${
          isActive ? "font-semibold text-blue-600" : ""
        }`}
      >
        {label} {arrow}
      </button>
    );
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 text-gray-800">
      {/* 상단 헤더 */}
      <header className="flex items-center justify-between mb-8 border-b pb-4">
        <h1 className="text-xl font-bold text-blue-700">📚 Book App</h1>

        <div className="flex gap-2">
          {mockUser ? (
            <>
              {mockUser.isAdmin && (
                <button
                  onClick={() => navigate("/books/new")}
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                >
                  도서 등록
                </button>
              )}
              <button
                onClick={async () => {
                  try {
                    await signout();
                    alert("로그아웃 되었습니다");
                    navigate("/login");
                  } catch (err) {
                    console.error("❌ 로그아웃 실패", err);
                    alert("로그아웃에 실패했습니다.");
                  }
                }}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                로그아웃
              </button>
            </>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              로그인
            </button>
          )}
        </div>
      </header>

      {/* 필터 영역 */}
      <div className="flex flex-wrap items-center gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 제목 검색"
          className="px-3 py-2 border rounded w-52"
        />
        <span className="text-gray-600">정렬:</span>
        <div className="flex gap-2">
          {renderSortButton("평점", "avg_rating")}
        </div>
      </div>

      {/* 도서 테이블 */}
      <table className="w-full text-sm border border-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2 border">ID</th>
            <th className="text-left p-2 border">제목</th>
            <th className="text-left p-2 border">저자</th>
            <th className="text-left p-2 border">평점</th>
            <th className="text-left p-2 border">리뷰 수</th>
            <th className="text-left p-2 border">출판일</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.map((book) => (
            <tr
              key={book.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <td className="p-2 border">{book.id}</td>
              <td className="p-2 border">{book.title}</td>
              <td className="p-2 border">{book.author}</td>
              <td className="p-2 border">{book.avgRating}</td>
              <td className="p-2 border">{book.reviewCount}</td>
              <td className="p-2 border">{book.createdAt}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className="mt-6 flex justify-center space-x-2">
        <button
          onClick={() => setPage((p) => Math.max(p - 1, 1))}
          disabled={page === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          이전
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => setPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              page === i + 1 ? "bg-blue-500 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
          disabled={page === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}
