import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { pinia } from './stores';
import './style.css';
import { useAuthStore } from './stores/authStore';
import { GraphQLProvider } from './apollo';
import vuetify from './plugins/vuetify';
import 'vuetify/styles';


const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vuetify);

// 初始化数据存储
const authStore = useAuthStore();
authStore.initAuth();

// 使用Apollo Provider包装应用
app.use(GraphQLProvider);

app.mount('#app');

// 移除本地存储初始化，现在使用GraphQL