import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import CreateQuizForm from '../components/CreateQuizForm.vue';
import QuizRankView from '../views/QuizRankView.vue';
import QuizTakingView from '../views/QuizTakingView.vue';
import QuizList from '../components/QuizList.vue';

const routes = [
  {
    path: '/',
    name: 'home',
    component: HomeView
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView
  },
  {
    path: '/create-quiz',
    name: 'createQuiz',
    component: CreateQuizForm
  },
  {
    path: '/quiz/:quizId',
    name: 'quizTaking',
    component: QuizTakingView,
    props: true
  },
  {
    path: '/quiz-rank/:quizId',
    name: 'quizRank',
    component: QuizRankView,
    props: true
  },
  {
    path: '/quiz-list',
    name: 'quizList',
    component: QuizList
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env?.BASE_URL || '/'),
  routes
});

export default router;