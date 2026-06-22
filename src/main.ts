import { createApp } from 'vue'
import { Quasar, Notify, Dialog } from 'quasar'
import { createPinia } from 'pinia'

// Icon set + Quasar core styles (precompiled, default theme)
import '@quasar/extras/material-icons/material-icons.css'
import 'quasar/dist/quasar.css'

// Vue Flow styles (mandatory + default theme + controls)
import '@vue-flow/core/dist/style.css'
import '@vue-flow/core/dist/theme-default.css'
import '@vue-flow/controls/dist/style.css'

// App styles
import './css/app.css'

import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(Quasar, { plugins: { Notify, Dialog } })
app.mount('#app')
