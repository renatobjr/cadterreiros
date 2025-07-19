export const baseRoute = {
  index: 'index',
  aboutProject: 'aboutProject',
  gridFAQLanguages: 'gridFAQLanguages',
  gridFAQTraditionalCommunities: 'gridFAQTraditionalCommunities',
  gridFAQNations: 'gridFAQNations',
  community: 'community',
  search: 'search',
  communityRegister: 'communityRegister',
  aboutCCIAO: 'AboutCCIAO',
  login: "Login",
  fogetPassword: "forgetPassword",
  firstAccess: "firstAccess",
  otp: "otp",
  setPassword: 'setPassword'
}

const Index = () => import('@/pages/Index.vue')
const AboutProject = () => import('@/pages/AboutProject.vue')
const GridFAQTraditionalCommunities = () => import('@/pages/gridFAQ/GridFAQTraditionalCommunities.vue')
const GridFAQLanguages = () => import('@/pages/gridFAQ/GridFAQLanguages.vue')
const GridFAQNations = () => import('@/pages/gridFAQ/GridFAQNations.vue')
const Community = () => import('@/pages/Community.vue')
const Search = () => import('@/pages/Search.vue')
const CommunityRegister = () => import('@/pages/CommunityRegister.vue')
const AboutCCIAO = () => import('@/pages/gridFAQ/AboutCCIAO.vue')
const Login = () => import('@/pages/Login.vue')
const SetEmailForm = () => import('@/pages/SetEmailForm.vue')
const Otp = () => import('@/pages/OTP.vue')
const SetPassword = () => import('@/pages/SetPassword.vue')

export default [
  {
    path: '/',
    name: baseRoute.index,
    component: Index,
  },
  {
    path: '/sobre-o-projeto',
    name: baseRoute.aboutProject,
    component: AboutProject,
  },
  {
    path: '/o-que-sao-comunidades-tradicionais',
    name: baseRoute.gridFAQTraditionalCommunities,
    component: GridFAQTraditionalCommunities,
  },
  {
    path: '/quais-as-linguagens-do-candomble',
    name: baseRoute.gridFAQLanguages,
    component: GridFAQLanguages,
  },
  {
    path: '/quais-as-nacoes-do-candomble-no-brasil',
    name: baseRoute.gridFAQNations,
    component: GridFAQNations,
  },
  {
    path: '/:id/:slug',
    name: baseRoute.community,
    component: Community,
    props: true
  },
  {
    path: '/busca',
    name: baseRoute.search,
    component: Search,
  },
  {
    path: '/cadastro-voluntario',
    name: baseRoute.communityRegister,
    component: CommunityRegister,
  },
  {
    path: '/sobre-a-cciao',
    name: baseRoute.aboutCCIAO,
    component: AboutCCIAO,
  },
  {
    path: '/login',
    name: baseRoute.login,
    component: Login,
  },
  {
    path: '/esqueci-minha-senha',
    name: baseRoute.fogetPassword,
    component: SetEmailForm
  },
  {
    path: '/primeiro-acesso',
    name: baseRoute.firstAccess,
    component: SetEmailForm
  },
  {
    path: '/otp/:token/:email',
    name: baseRoute.otp,
    component: Otp,
    props: true
  },
  {
    path: '/set-password/:token',
    name: baseRoute.setPassword,
    component: SetPassword,
    props: true
  }
].map(route => ({
  ...route,
  meta: {
    layout: 'base',
    requiresAuth: false
  }
}))
