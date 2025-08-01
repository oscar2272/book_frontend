const BASE_URL = "http://localhost:8000";

export function parseCookie(cookie: any) {
  return Object.fromEntries(
    cookie.split(";").map((c: any) => {
      const [k, v] = c.trim().split("=");
      return [k, v];
    })
  );
}
export async function ensureCSRFToken() {
  const res = await fetch(`${BASE_URL}/api/csrf/`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("CSRF 토큰을 가져오지 못했습니다.");
  return res.json();
}

export async function signin(username: string, password: string) {
  const res = await fetch("/api/login/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include", // 이게 쿠키 전송에 필수입니다
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => null);
    const error = new Error("로그인 실패");
    (error as any).response = { status: res.status, data: errorData };
    throw error;
  }

  return res.json();
}

export async function signout() {
  const token = await ensureCSRFToken(); // /api/csrf/에서 토큰 받아옴
  const res = await fetch(`/api/logout/`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      "X-CSRFToken": token.csrfToken, // 반드시 넣어야 함
    },
  });

  if (!res.ok) throw new Error("로그아웃 실패");
}

export async function getCurrentUser(request: Request) {
  const cookie = request.headers.get("cookie") || ""; // 실제 쿠키
  const res = await fetch(`${BASE_URL}/api/me/`, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      cookie: cookie,
    },
  });
  if (!res.ok) throw new Error("현재 사용자 정보를 가져오지 못했습니다.");
  return res.json();
}
