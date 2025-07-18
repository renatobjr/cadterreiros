export const authRoute = {
  dashboard: "dashboard",
  communityPrivated: "communityPrivated",
};

const dashboard = () => import("@/pages/dashboard/Home.vue");
const communityPrivate = () => import("@/pages/dashboard/Community.vue");

export default [
  {
    path: "/dashboard",
    name: authRoute.dashboard,
    component: dashboard,
  },
  {
    path: "/dashboard/:id/:slug",
    name: authRoute.communityPrivated,
    component: communityPrivate,
    props: true,
  }
].map((route) => ({
  ...route,
  meta: {
    layout: "authenticated",
    requiresAuth: true,
  },
}));
