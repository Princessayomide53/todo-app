import { createApp } from 'vue';
import App from './App.vue';
import './assets/tailwind.css';
import { apolloClient } from './apollo';
import { DefaultApolloClient } from '@vue/apollo-composable';
import { provide, h } from 'vue';

const app = createApp({
  setup() {
    provide(DefaultApolloClient, apolloClient);
  },
  render: () => h(App),
});

app.mount('#app');
