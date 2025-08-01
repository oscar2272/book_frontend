import { useState } from "react";
import { getCurrentUser, signin } from "../user_api";
import { useNavigate } from "react-router";
import type { Route } from "./+types/signin-page";
export async function loader({ request, params }: Route.LoaderArgs) {
  const user = await getCurrentUser(request);
  const userId = user?.id || null;
  if (userId) {
    // 이미 로그인된 사용자라면 홈으로 리다이렉트
    return new Response(null, {
      status: 302,
      headers: { Location: "/" },
    });
  }
}
export default function LoginPage() {
  const navigate = useNavigate();
  const [formErrors, setFormErrors] = useState<{
    username?: string[];
    password?: string[];
  }>({});
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setFormErrors({});

    const formData = new FormData(e.currentTarget);
    const username = formData.get("username")?.toString() ?? "";
    const password = formData.get("password")?.toString() ?? "";

    // 클라이언트-side 유효성 검사
    if (!username || !password) {
      setFormErrors({
        username: !username ? ["사용자 이름을 입력하세요"] : undefined,
        password: !password ? ["비밀번호를 입력하세요"] : undefined,
      });
      return;
    }

    try {
      await signin(username, password);
      navigate("/");
    } catch (err: any) {
      if (err?.response && err.response.status === 400 && err.response.data) {
        // 백엔드에서 필드별 에러가 오면 세팅
        setFormErrors(err.response.data);
      } else {
        setError("로그인에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-[400px] p-6 bg-white shadow-md rounded-lg">
        <h2 className="text-2xl font-bold mb-4">로그인</h2>
        <p className="text-gray-600 mb-6">
          이메일 또는 Github 계정으로 로그인하세요
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              사용자 이름
            </label>
            <input
              type="text"
              name="username"
              required
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
            />
            {formErrors.username?.map((msg, i) => (
              <p key={i} className="text-red-500 text-sm mt-1">
                {msg}
              </p>
            ))}
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              type="password"
              name="password"
              required
              className="w-full border-gray-300 rounded-md shadow-sm focus:ring focus:ring-blue-200"
            />
            {formErrors.password?.map((msg, i) => (
              <p key={i} className="text-red-500 text-sm mt-1">
                {msg}
              </p>
            ))}
          </div>
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700"
          >
            로그인
          </button>
        </form>

        <a
          href="/"
          className="block text-center bg-blue-600 text-white py-2 rounded-md hover:bg-black mt-3"
        >
          홈으로 이동
        </a>

        {/* 로그인 실패 메시지 */}
        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
      </div>
    </div>
  );
}
