import { Form, redirect, useFetcher } from "react-router";
import type { Route } from "./+types/author-create-page";
import { createAuthor } from "../author_api";
import { z } from "zod";
import { useEffect } from "react";

const formSchema = z.object({
  name: z.string().min(1, "이름을 입력해주세요."),
});
export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const { success, data, error } = formSchema.safeParse(
    Object.fromEntries(formData)
  );
  if (!success) {
    return { formErrors: error.flatten().fieldErrors };
  }
  const { name } = data;

  try {
    await createAuthor(name);
    return { success: true, message: "저자가 등록되었습니다." };
  } catch (error) {
    return { error: "저자 등록에 실패했습니다. 다시 시도해주세요." };
  }
};

export default function AuthorCreatePage() {
  const fetcher = useFetcher();
  useEffect(() => {
    if (fetcher.data?.success) {
      alert(fetcher.data.message);
      redirect("/");
    }
  }, [fetcher.data]);
  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-xl mx-auto bg-white shadow-md rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-blue-700">👤 저자 등록</h2>

        <fetcher.Form method="post" className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">이름</label>
            <input
              type="text"
              name="name"
              id="name"
              required
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => history.back()}
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
