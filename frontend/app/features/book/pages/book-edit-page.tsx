// features/book/pages/book-edit-page.tsx
import { useParams, Link, useNavigate } from "react-router";
import { useState } from "react";

const mockBook = {
  id: 1,
  title: "예시 책 제목",
  author: "홍길동",
  publishedAt: "2023-12-01",
};

export default function BookEditPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  if (parseInt(id ?? "") !== mockBook.id) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-500">
        <p>도서를 찾을 수 없습니다. (404)</p>
      </div>
    );
  }

  const [title, setTitle] = useState(mockBook.title);
  const [author, setAuthor] = useState(mockBook.author);
  const [publishedAt, setPublishedAt] = useState(mockBook.publishedAt);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 실제 API로 수정 요청을 보낼 자리입니다.
    console.log("수정된 데이터:", { title, author, publishedAt });

    alert("도서 정보가 수정되었습니다.");
    navigate(`/books/${mockBook.id}`); // 수정 후 상세 페이지로 이동
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">도서 정보 수정</h2>
          <Link
            to={`/books/${mockBook.id}`}
            className="text-sm text-blue-500 hover:underline"
          >
            ← 돌아가기
          </Link>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              저자
            </label>
            <input
              type="text"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              출판일
            </label>
            <input
              type="date"
              value={publishedAt}
              onChange={(e) => setPublishedAt(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <Link
              to={`/books/${mockBook.id}`}
              className="px-4 py-2 rounded text-gray-600 hover:underline"
            >
              취소
            </Link>
            <button
              type="submit"
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              저장
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
