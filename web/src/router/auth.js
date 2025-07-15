export const authRoute = {
  dashboard: "dashboard",
};

const dashboard = () => import("@/pages/dashboard/Home.vue");

export default [
  {
    path: "/dashboard",
    name: authRoute.dashboard,
    component: dashboard,
  },
].map((route) => ({
  ...route,
  meta: {
    layout: "authenticated",
    requiresAuth: true,
  },
}));
