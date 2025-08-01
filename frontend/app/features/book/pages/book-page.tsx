import { useNavigate, useSearchParams } from "react-router";
import { getCurrentUser, signout } from "~/features/auth/user_api";
import type { Route } from "./+types/book-page";
import { getBooks } from "../book_api";
import { useState } from "react";

const ITEMS_PER_PAGE = 10;

export async function loader({ request }: Route.LoaderArgs) {
  const url = new URL(request.url);
  const searchParams = url.search;

  const booksResponse = await getBooks(searchParams);
  const books = booksResponse.results;
  const totalCount = booksResponse.count;

  const user = await getCurrentUser(request);
  const userId = user?.id || null;
  const isAdmin = user?.is_admin;

  return { books, totalCount, isAdmin, userId };
}

export default function HomePage({ loaderData }: Route.ComponentProps) {
  const { books, totalCount, isAdmin, userId } = loaderData;
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchText, setSearchText] = useState(
    searchParams.get("search") || ""
  );
  const navigate = useNavigate();

  const currentPage = Number(searchParams.get("page") ?? "1");
  const ordering = searchParams.get("ordering") || "-created_at";
  const totalPages = Math.ceil(totalCount / ITEMS_PER_PAGE);

  const goToPage = (page: number) => {
    const params = new URLSearchParams(searchParams);
    params.set("page", page.toString());
    setSearchParams(params);
  };

  const handleSearch = () => {
    const params = new URLSearchParams(searchParams);
    params.set("search", searchText);
    params.set("page", "1"); // 검색 시 페이지 초기화
    setSearchParams(params);
  };

  const handleSort = (field: string) => {
    const current = searchParams.get("ordering");
    const nextOrdering = current === field ? `-${field}` : field;
    const params = new URLSearchParams(searchParams);
    params.set("ordering", nextOrdering);
    params.set("page", "1");
    setSearchParams(params);
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
      {/* 헤더 */}
      <header className="flex items-center justify-between mb-8 border-b pb-4">
        <h1 className="text-xl font-bold text-blue-700">📚 Book App</h1>

        <div className="flex gap-2">
          {userId ? (
            <>
              {isAdmin && (
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate("/books/new")}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    도서 등록
                  </button>
                  <button
                    onClick={() => navigate("/books/author/new")}
                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                  >
                    저자 등록
                  </button>
                </div>
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
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          className="px-3 py-2 border rounded w-52"
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSearch();
          }}
        />
        <button
          onClick={handleSearch}
          className="px-3 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          검색
        </button>

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
          {books.map((book: any) => (
            <tr
              key={book.id}
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => navigate(`/books/${book.id}`)}
            >
              <td className="p-2 border">{book.id}</td>
              <td className="p-2 border">{book.title}</td>
              <td className="p-2 border">{book.author_name}</td>
              <td className="p-2 border">{book.average_rating}</td>
              <td className="p-2 border">{book.review_count}</td>
              <td className="p-2 border">
                {new Date(book.published_at).toLocaleDateString("ko-KR")}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className="mt-6 flex justify-center space-x-2">
        <button
          onClick={() => goToPage(Math.max(currentPage - 1, 1))}
          disabled={currentPage === 1}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          이전
        </button>
        {Array.from({ length: totalPages }, (_, i) => (
          <button
            key={i}
            onClick={() => goToPage(i + 1)}
            className={`px-3 py-1 border rounded ${
              currentPage === i + 1 ? "bg-blue-500 text-white" : ""
            }`}
          >
            {i + 1}
          </button>
        ))}
        <button
          onClick={() => goToPage(Math.min(currentPage + 1, totalPages))}
          disabled={currentPage === totalPages}
          className="px-3 py-1 border rounded disabled:opacity-50"
        >
          다음
        </button>
      </div>
    </div>
  );
}
