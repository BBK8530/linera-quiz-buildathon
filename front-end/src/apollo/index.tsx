import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';
import { createApolloProvider } from '@vue/apollo-option';

// 配置环境变量类型
declare global {
  interface ImportMetaEnv {
    VITE_NODE_URL?: string;
    VITE_APP_ID?: string;
    VITE_CHAIN_ID?: string;
    BASE_URL?: string;
  }
  
  interface ImportMeta {
    env: ImportMetaEnv;
  }
}

// 设置GraphQL链接
const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_NODE_URL || 'https://linera.quest/api/chains/687db7197e068a473f2dfff5241f1de21c47c0c3a3a89a5c72c733425d8f73e9/applications/07daa738710e5c6c4e017dfb393289b29a462622f4f0f57a9f2c17dd98ea13f8'}`,
});

// 创建Apollo客户端
export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

// 创建Vue Apollo Provider
export const apolloProvider = createApolloProvider({
  defaultClient: apolloClient,
});

// 导出Provider作为默认导出和命名导出
export default apolloProvider;
export { apolloProvider as GraphQLProvider };
