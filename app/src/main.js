import { createApp } from 'vue';
import './style.css';
import './assets/styles/chat.css';
import '@fortawesome/fontawesome-free/css/all.css';
import 'remixicon/fonts/remixicon.css';
import App from './App.vue';
import router from './router';

createApp(App).use(router).mount('#app');
