import { Toaster } from "@/components/ui/sonner";
import {
  Outlet,
  RouterProvider,
  createRootRoute,
  createRoute,
  createRouter,
} from "@tanstack/react-router";
import { Footer } from "./components/Footer";
import { Nav } from "./components/Nav";
import { AdminPage } from "./pages/AdminPage";
import { HomePage } from "./pages/HomePage";
import { PostDetailPage } from "./pages/PostDetailPage";
import { PostEditorPage } from "./pages/PostEditorPage";

// ── Root layout ───────────────────────────────────────────────────────────────
const rootRoute = createRootRoute({
  component: () => (
    <div className="min-h-screen flex flex-col bg-background">
      <Nav />
      <div className="flex-1">
        <Outlet />
      </div>
      <Footer />
      <Toaster richColors position="bottom-right" />
    </div>
  ),
});

// ── Routes ────────────────────────────────────────────────────────────────────
const homeRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/",
  component: HomePage,
});

const postDetailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/post/$id",
  component: PostDetailPage,
});

const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin",
  component: AdminPage,
});

const newPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/post/new",
  component: () => <PostEditorPage mode="new" />,
});

const editPostRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: "/admin/post/$id/edit",
  component: () => <PostEditorPage mode="edit" />,
});

// ── Router ────────────────────────────────────────────────────────────────────
const routeTree = rootRoute.addChildren([
  homeRoute,
  postDetailRoute,
  adminRoute,
  newPostRoute,
  editPostRoute,
]);

const router = createRouter({ routeTree });

declare module "@tanstack/react-router" {
  interface Register {
    router: typeof router;
  }
}

export default function App() {
  return <RouterProvider router={router} />;
}
