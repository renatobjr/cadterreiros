import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
  useParams,
  type RouteObject,
} from "react-router-dom";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home";
import Search from "./pages/Search";
import Community from "./pages/Community";
import Mapping from "./pages/Mapping";
import AboutProject from "./pages/AboutProject";
import AboutCCIAO from "./pages/AboutCCIAO";
import Articles from "./pages/Articles";
import Article from "./pages/Article";
import CommunityRegister from "./pages/CommunityRegister";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import FirstAccess from "./pages/FirstAccess";
import OTP from "./pages/OTP";
import SetPassword from "./pages/SetPassword";
import DesignSystem from "./pages/DesignSystem";
import NotFound from "./pages/NotFound";
import RequireAdmin from "./features/admin/components/RequireAdmin";
import AdminShell from "./features/admin/components/AdminShell";
import AdminDataProvider from "./features/admin/AdminDataProvider";
import AdminOverview from "./pages/admin/AdminOverview";
import AdminRecords from "./pages/admin/AdminRecords";
import AdminCommunity from "./pages/admin/AdminCommunity";
import AdminCommunityEdit from "./pages/admin/AdminCommunityEdit";
import AdminUsers from "./pages/admin/AdminUsers";

/** Redirect do endereço antigo `/:id/:slug` para a rota pública por slug. */
function LegacyTerreiro() {
  const { slug } = useParams<{ id: string; slug: string }>();
  return <Navigate to={slug ? `/terreiro/${slug}` : "/buscar"} replace />;
}

/**
 * Tabela de rotas do site. Exportada para permitir testes com
 * `createMemoryRouter` sem depender da History API do navegador.
 */
// eslint-disable-next-line react-refresh/only-export-components
export const routes: RouteObject[] = [
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Home /> },
      { path: "/buscar", element: <Search /> },
      { path: "/terreiro/:slug", element: <Community /> },
      { path: "/mapeamento", element: <Mapping /> },
      { path: "/artigos", element: <Articles /> },
      { path: "/artigos/:slug", element: <Article /> },
      { path: "/sobre-o-projeto", element: <AboutProject /> },
      { path: "/sobre-a-cciao", element: <AboutCCIAO /> },
      { path: "/cadastro-voluntario", element: <CommunityRegister /> },
      { path: "/entrar", element: <Login /> },
      { path: "/esqueci-minha-senha", element: <ForgotPassword /> },
      { path: "/primeiro-acesso", element: <FirstAccess /> },
      { path: "/otp/:token/:email", element: <OTP /> },
      { path: "/set-password/:token", element: <SetPassword /> },
      { path: "/design-system", element: <DesignSystem /> },

      // Painel da curadoria: sessão obrigatória (checagem de UX; a API é a
      // fonte de verdade da autorização).
      {
        element: <RequireAdmin />,
        children: [
          {
            element: (
              <AdminDataProvider>
                <AdminShell />
              </AdminDataProvider>
            ),
            children: [
              { path: "/admin", element: <AdminOverview /> },
              { path: "/admin/cadastros", element: <AdminRecords /> },
              { path: "/admin/cadastros/:id", element: <AdminCommunity /> },
              {
                path: "/admin/cadastros/:id/editar",
                element: <AdminCommunityEdit />,
              },
              { path: "/admin/usuarios", element: <AdminUsers /> },
            ],
          },
        ],
      },

      // Aliases legados: mantêm links antigos vivos após a troca de URL.
      { path: "/busca", element: <Navigate to="/buscar" replace /> },
      { path: "/login", element: <Navigate to="/entrar" replace /> },
      {
        path: "/o-que-sao-comunidades-tradicionais",
        element: <Navigate to="/artigos/comunidades-tradicionais" replace />,
      },
      {
        path: "/quais-as-linguagens-do-candomble",
        element: <Navigate to="/artigos/linguas-do-candomble" replace />,
      },
      {
        path: "/quais-as-nacoes-do-candomble-no-brasil",
        element: <Navigate to="/artigos/nacoes-do-candomble" replace />,
      },
      { path: "/:id/:slug", element: <LegacyTerreiro /> },

      { path: "*", element: <NotFound /> },
    ],
  },
];

const router = createBrowserRouter(routes);

export function AppRouter() {
  return <RouterProvider router={router} />;
}

export default AppRouter;
