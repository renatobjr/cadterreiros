export const authRoute = {
  dashboard: "dashboard",
  communityPrivated: "communityPrivated",
  users: "users",
};

const Dashboard = () => import("@/pages/dashboard/Home.vue");
const Community_Private = () => import("@/pages/dashboard/Community.vue");
const Users = () => import("@/pages/dashboard/Users.vue");

export default [
  {
    path: "/dashboard",
    name: authRoute.dashboard,
    component: Dashboard,
  },
  {
    path: "/dashboard/:id/:slug",
    name: authRoute.communityPrivated,
    component: Community_Private,
    props: true,
  },
  {
    path: "/dashboard/users",
    name: authRoute.users,
    component: Users,
  },
].map((route) => ({
  ...route,
  meta: {
    layout: "authenticated",
    requiresAuth: true,
  },
}));
