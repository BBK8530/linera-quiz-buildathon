import { createPinia } from 'pinia';

export const pinia = createPinia();

export * from './authStore';
export * from './quizStore';

export default pinia;