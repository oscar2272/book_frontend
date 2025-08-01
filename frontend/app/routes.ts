import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("features/book/pages/book-page.tsx"),
  route("/books/:id", "features/book/pages/book-detail-page.tsx"),
  route("/books/:id/edit", "features/book/pages/book-edit-page.tsx"),
  route("/books/new", "features/book/pages/book-create-page.tsx"),
  route("/books/author/new", "features/book/pages/author-create-page.tsx"),
  route("/login", "features/auth/pages/signin-page.tsx"),
] satisfies RouteConfig;
