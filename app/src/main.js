import { createApp } from 'vue';
import './style.css';
import './assets/styles/chat.css';
import 'leaflet/dist/leaflet.css';
import '@fortawesome/fontawesome-free/css/all.css';
import 'remixicon/fonts/remixicon.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

createApp(App).use(pinia).use(router).mount('#app');
