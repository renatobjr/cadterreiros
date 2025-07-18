export const userRoute = {
  profile: "profile",
};

const profile = () => import('@/pages/dashboard/Profile.vue')

export default [
  {
    path: "/dashboard/profile",
    name: userRoute.profile,
    component: profile,
  },
].map((route) => ({
  ...route,
  meta: {
    layout: "authenticated",
    requiresAuth: true,
  },
}))
