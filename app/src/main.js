import { createApp } from 'vue';
import './styles/global.css';
import './style.css';
import 'leaflet/dist/leaflet.css';
import './assets/remixicon/remixicon.css';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate';
import { runStorageMigration } from '@/utils/storageMigration';
import { showMessage } from '@/composables/useMessage';

runStorageMigration();

const pinia = createPinia();
pinia.use(piniaPluginPersistedstate);

const app = createApp(App);
app.config.globalProperties.$showMessage = showMessage;
app.config.globalProperties.showMessage = showMessage;
app.use(pinia).use(router).mount('#app');
