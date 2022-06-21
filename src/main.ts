import { createApp } from 'vue';
import Antd from 'ant-design-vue';
import App from '@/view/brench/Main.vue';
import 'ant-design-vue/dist/antd.css';

import "@/language/type/lib";

createApp(App)
    .use(Antd)
    .mount('#app')
