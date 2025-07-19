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

import CadSetOwnerDialog from './components/dialogs/CadSetOwnerDialog.vue'
import CadSetCensusStepDialog from './components/dialogs/CadSetCensusStepDialog.vue'
import CadRequestCorrectionsDialog from './components/dialogs/CadRequestCorrectionsDialog.vue'
import CadApproveDialog from './components/dialogs/CadApproveDialog.vue'
import CadRejectDialog from './components/dialogs/CadRejectDialog.vue'
import CadSetUserStatusDialog from './components/dialogs/CadSetUserStatusDialog.vue'
import CadChangeUserRoleDialog from './components/dialogs/CadChangeUserRoleDialog.vue'
import CadAddUserDialog from './components/dialogs/CadAddUserDialog.vue'

import CadDataTableCommunitiesApproved from './components/dataTables/CadDataTableCommunitiesApproved.vue'
import CadDataTableCommunitiesRejected from './components/dataTables/CadDataTableCommunitiesRejected.vue'
import CadDataTableCommunitiesPending from './components/dataTables/CadDataTableCommunitiesPending.vue'
import CadTableCommunity from './components/dataTables/CadTableCommunity.vue'


import { createApp } from 'vue'
import { createVuetify } from 'vuetify'

import { pt } from 'vuetify/locale'

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

app.component('CadSetOwnerDialog', CadSetOwnerDialog)
app.component('CadSetCensusStepDialog', CadSetCensusStepDialog)
app.component('CadRequestCorrectionsDialog', CadRequestCorrectionsDialog)
app.component('CadApproveDialog', CadApproveDialog)
app.component('CadRejectDialog', CadRejectDialog)
app.component('CadSetUserStatusDialog', CadSetUserStatusDialog)
app.component('CadChangeUserRoleDialog', CadChangeUserRoleDialog)
app.component('CadAddUserDialog', CadAddUserDialog)

app.component('CadDataTableCommunitiesApproved', CadDataTableCommunitiesApproved)
app.component('CadDataTableCommunitiesRejected', CadDataTableCommunitiesRejected)
app.component('CadDataTableCommunitiesPending', CadDataTableCommunitiesPending)
app.component('CadTableCommunity', CadTableCommunity)


const vuetify = createVuetify({
  locale: {
    locale: 'pt',
    fallback: 'en',
    messages: {
      pt,
    },
  },
})


app.use(vuetify)

registerPlugins(app)

app.mount('#app')
