import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

import { createVuetify } from 'vuetify'

const CadterreirosTheme = {
  dark: false,
  colors: {
    background: 'f5f5f5',
    //basics
    red: 'E11E17',
    firebrick: '#BD1722',
    sealbronw: '#4A280B',
    persimmon: '#E85C0D',
    copper: '#B07D47',
    gold: '#FFAA00',
    // nations
    angola: '#3B7A57',
    ekiti_efon: '#7D3C98',
    jeje: '#3498DB',
    ketu: '#E85C0D',
    nagô: '#FFAA00',
    quimbanda: '#BD1722',
    tambor_de_mina: '#1ABC9C',
    umbanda: '#2ECC71',
    outros: '#B07D47',
    // Community
    african: '#7B3F00',
    tradicional: '#1E88E5',
  },
}

export default createVuetify({
  theme: {
    defaultTheme: 'CadterreirosTheme',
    themes: {
      CadterreirosTheme,
    },
  },
})
