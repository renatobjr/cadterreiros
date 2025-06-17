import { registerPlugins } from '@/plugins'

import App from './App.vue'

import CadNav from './components/common/CadNav.vue'
import CadShare from './components/common/CadShare.vue'
import CadEmphasis from './components/common/CadEmphasis.vue'
import CadFooter from './components/common/CadFooter.vue'
import CadCommunity from './components/common/CadCommunity.vue'
import CadChip from './components/common/CadChip.vue'
import CadGLobalLoader from './components/common/CadGlobalLoader.vue'

import CadGoogleMaps from './components/CadGoogleMaps.vue'
import CadGridFAQ from './components/CadGridFAQ.vue'
import CadHero from './components/CadHero.vue'
import CadShowcase from './components/CadShowcase.vue'
import CadMapNumbers from './components/CadMapNumbers.vue'

import { createApp } from 'vue'

const app = createApp(App)

app.component('CadNav', CadNav)
app.component('CadShare', CadShare)
app.component('CadEmphasis', CadEmphasis)
app.component('CadFooter', CadFooter)
app.component('CadCommunity', CadCommunity)
app.component('CadChip', CadChip)
app.component('CadGLobalLoader', CadGLobalLoader)

app.component('CadGoogleMaps', CadGoogleMaps)
app.component('CadGridFaq', CadGridFAQ)
app.component('CadHero', CadHero)
app.component('CadShowcase', CadShowcase)
app.component('CadMapNumbers', CadMapNumbers)


registerPlugins(app)

app.mount('#app')
