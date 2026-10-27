import { createBrowserRouter, Navigate, RouterProvider, useParams } from "react-router-dom";
import type { ReactNode } from "react";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Community from "./pages/Community";
import Mapping from "./pages/Mapping";
import AboutProject from "./pages/AboutProject";
import CommunityRegister from "./pages/CommunityRegister";
import { LoginForm } from "./features/auth/components/LoginForm";

function Page({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

function NotFound() {
  return <h1>404</h1>;
}

function LegacyTerreiro() {
  const params = useParams();
  return <Navigate to={`/terreiro/${params.slug}`} replace />;
}

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
  { path: "/buscar", element: <Search /> },
  { path: "/terreiro/:slug", element: <Community /> },
  { path: "/mapeamento", element: <Mapping /> },
  { path: "/sobre-o-projeto", element: <AboutProject /> },
  { path: "/sobre-a-cciao", element: <AboutProject /> },
  { path: "/cadastro-voluntario", element: <CommunityRegister /> },
  { path: "/entrar", element: <LoginForm /> },
  { path: "/esqueci-minha-senha", element: <Page><p>esqueci</p></Page> },
  { path: "/primeiro-acesso", element: <Page><p>primeiro</p></Page> },
  { path: "/otp/:token/:email", element: <Page><p>otp</p></Page> },
  { path: "/set-password/:token", element: <Page><p>set</p></Page> },
  { path: "/design-system", element: <Page><p>design</p></Page> },
  { path: "/busca", element: <Navigate to="/buscar" replace /> },
  { path: "/login", element: <Navigate to="/entrar" replace /> },
  { path: "/:id/:slug", element: <LegacyTerreiro /> },
  { path: "*", element: <NotFound /> },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
