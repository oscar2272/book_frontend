import { useEffect, useState } from "react";
import { Form, useFetcher, useNavigate } from "react-router";
import { z } from "zod";
import { getAuthors } from "../author_api";
import type { Route } from "./+types/book-create-page";
import { createBook } from "../book_api";

const formSchema = z.object({
  title: z.string().min(1, "제목을 입력해주세요."),
  author: z.string().min(1, "저자를 선택해주세요."),
});

export async function loader({ request }: { request: Request }) {
  const authors = await getAuthors();
  if (!authors || authors.length === 0) {
    return new Response("저자가 없습니다. 먼저 저자를 등록해주세요.", {
      status: 400,
    });
  }
  console.log("저자 목록 로드:", authors);
  return { authors };
}

export async function action({ request }: { request: Request }) {
  console.log("도서 등록 요청 수신");
  const formData = await request.formData();
  const formValues = Object.fromEntries(formData);
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );

  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }

  try {
    await createBook(data.title, data.author);
    return { success: true, message: "도서가 등록되었습니다." };
  } catch (error) {
    return { error: "도서 등록에 실패했습니다. 다시 시도해주세요." };
  }
}

export default function BookCreatePage({ loaderData }: Route.ComponentProps) {
  const authors = loaderData.authors || [];
  const navigate = useNavigate();
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.data?.success) {
      alert(fetcher.data.message);
      navigate("/");
    } else if (fetcher.data?.error) {
      alert(fetcher.data.error);
    }
  }, [fetcher.data, navigate]);

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">📘 도서 등록</h2>

        <fetcher.Form method="post" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">제목</label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">저자</label>
            <select
              value={author}
              name="author"
              onChange={(e) => setAuthor(e.target.value)}
              className="w-full border rounded px-3 py-2"
              required
            >
              {authors.map((a: any) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-4 py-2 text-gray-600 hover:underline"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
            >
              등록
            </button>
          </div>
        </fetcher.Form>
      </div>
    </div>
  );
}
