import App from "./App.vue";
import ElementPlus from "element-plus";
import "element-plus/dist/index.css";
import * as ElementPlusIconsVue from "@element-plus/icons-vue";
import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./routers";
import './styles/base.css';

const app = createApp(App);

for (const [key, component] of Object.entries(ElementPlusIconsVue)) {
  app.component(key, component);
}

document.title = "Byerun";

app.use(ElementPlus);
app.use(router);

app.use(createPinia());
app.mount("#app");
