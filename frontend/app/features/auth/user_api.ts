const BASE_URL = "http://localhost:8000";

// 브라우저에서 쿠키에서 CSRF 토큰을 가져오는 함수
function getCookie(name: string): string | null {
  const value = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="))
    ?.split("=")[1];
  return value ? decodeURIComponent(value) : null;
}

// CSRF 토큰 요청: 쿠키에 csrftoken 세팅됨
export async function ensureCSRFToken() {
  const res = await fetch(`${BASE_URL}/api/csrf/`, {
    method: "GET",
    credentials: "include",
  });
  if (!res.ok) throw new Error("CSRF 토큰을 가져오지 못했습니다.");
}

export async function fetchWithCSRF(url: string, options: RequestInit = {}) {
  if (!url) throw new Error("fetchWithCSRF: URL이 없습니다.");

  let token = getCookie("csrftoken");
  if (!token) {
    await ensureCSRFToken();
    token = getCookie("csrftoken");
  }

  // headers 병합 (기본값 설정)
  const headers = new Headers(options.headers);
  if (!(options.body instanceof FormData)) {
    // JSON인 경우만 Content-Type 지정
    if (!headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
  }
  if (!headers.has("X-CSRFToken")) {
    headers.set("X-CSRFToken", token ?? "");
  }

  return fetch(url, {
    ...options,
    credentials: "include",
    headers,
  });
}

// 로그인
export async function signin(username: string, password: string) {
  const res = await fetchWithCSRF(`${BASE_URL}/api/login/`, {
    method: "POST",
    body: JSON.stringify({ username, password }),
  });

  if (!res.ok) throw new Error("로그인 실패");
  return res.json();
}

// 로그아웃 API 예시
export async function signout() {
  const res = await fetchWithCSRF(`${BASE_URL}/api/logout/`, {
    method: "POST",
  });

  if (!res.ok) throw new Error("로그아웃 실패");
}
