import { defineStore } from 'pinia';
import { ref } from 'vue';
import { v4 as uuidv4 } from 'uuid';

interface Question {
  id: string;
  text: string;
  points: number;
  options: string[];
  type: 'single' | 'multiple';
  correctAnswers: number[];
}

interface Quiz {
  id: string;
  title: string;
  description: string;
  creatorId: string;
  questions: Question[];
  createdAt: Date;
}

interface QuizSubmission {
  id: string;
  quizId: string;
  userId: string;
  userName: string;
  score: number;
  timeTaken: number; // in seconds
  submittedAt: Date;
}

export const useQuizStore = defineStore('quiz', () => {
  const quizzes = ref<Quiz[]>([]);
  const submissions = ref<QuizSubmission[]>([]);

  // 初始化数据 - 从localStorage加载
  const initQuizzes = () => {
    const savedQuizzes = localStorage.getItem('quizzes');
    const savedSubmissions = localStorage.getItem('submissions');

    if (savedQuizzes) {
      quizzes.value = JSON.parse(savedQuizzes);
      // 转换字符串日期为Date对象
      quizzes.value.forEach(quiz => {
        quiz.createdAt = new Date(quiz.createdAt);
      });
    }

    if (savedSubmissions) {
      submissions.value = JSON.parse(savedSubmissions);
      // 转换字符串日期为Date对象
      submissions.value.forEach(submission => {
        submission.submittedAt = new Date(submission.submittedAt);
      });
    }
  };

  // 创建新问卷
  const createQuiz = (title: string, description: string, creatorId: string): Quiz => {
    const newQuiz: Quiz = {
      id: uuidv4(),
      title,
      description,
      creatorId,
      questions: [],
      createdAt: new Date()
    };

    quizzes.value.push(newQuiz);
    localStorage.setItem('quizzes', JSON.stringify(quizzes.value));
    return newQuiz;
  };

  // 添加问题到问卷
  const addQuestion = (quizId: string, question: Omit<Question, 'id'>): boolean => {
    const quizIndex = quizzes.value.findIndex(q => q.id === quizId);
    if (quizIndex === -1) return false;
  
    const newQuestion: Question = {
      ...question,
      id: uuidv4()
    };
  
    const quiz = quizzes.value[quizIndex];
    if (quiz) {
      quiz.questions.push(newQuestion);
    }
    localStorage.setItem('quizzes', JSON.stringify(quizzes.value));
    return true;
  };
  
  // 提交问卷答案并计算分数
  const submitQuiz = (
    quizId: string,
    userId: string,
    userName: string,
    answers: { questionId: string; selectedAnswers: number[]; timeTaken: number }[]
  ): QuizSubmission => {
    const quiz = quizzes.value.find(q => q.id === quizId);
    if (!quiz) throw new Error('Quiz not found');
  
    let totalScore = 0;
    let totalTime = 0;
  
    // 计算得分（正确答题时间越短，权重越高）
    answers.forEach(answer => {
      const question = quiz.questions.find(q => q.id === answer.questionId);
      if (question) {
        totalTime += answer.timeTaken;
        let isCorrect = false;
  
        if (question.type === 'single') {
          // 单选题：检查是否选择了正确答案
          isCorrect = answer.selectedAnswers.length === 1 && question.correctAnswers.includes(answer.selectedAnswers[0]);
        } else {
          // 多选题：检查是否选择了所有正确答案且没有选择错误答案
          isCorrect = question.correctAnswers.every(ca => answer.selectedAnswers.includes(ca)) &&
                     answer.selectedAnswers.every(sa => question.correctAnswers.includes(sa));
        }
  
        if (isCorrect) {
          // 时间权重公式：基础分数 × (1 - 时间比例)，时间比例 = 用时/30秒（假设30秒为基准）
          const timeRatio = Math.min(answer.timeTaken / 30, 1);
          const weightedScore = Math.round(question.points * (1 - timeRatio));
          totalScore += weightedScore;
        }
      }
    });
  
    const submission: QuizSubmission = {
      id: uuidv4(),
      quizId,
      userId,
      userName,
      score: totalScore,
      timeTaken: totalTime,
      submittedAt: new Date()
    };
  
    submissions.value.push(submission);
    localStorage.setItem('submissions', JSON.stringify(submissions.value));
    return submission;
  };

  // 获取问卷排名（按分数降序，同分则按用时升序）
  const getQuizRankings = (quizId: string) => {
    return submissions.value
      .filter(sub => sub.quizId === quizId)
      .sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timeTaken - b.timeTaken;
      })
      .map((sub, index) => ({
        ...sub,
        rank: index + 1
      }));
  };

  // 获取单个问卷
  const getQuizById = (quizId: string) => {
    return quizzes.value.find(q => q.id === quizId);
  };

  // 获取用户创建的问卷（支持分页、搜索和排序）
  const getUserQuizzesWithFilters = (userId: string, page = 1, pageSize = 6, searchTerm = '', sortBy = 'createdAt') => {
    let filteredQuizzes = quizzes.value.filter(q => q.creatorId === userId);

    // 搜索功能
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredQuizzes = filteredQuizzes.filter(quiz => 
        quiz.title.toLowerCase().includes(term) || 
        quiz.description.toLowerCase().includes(term)
      );
    }

    // 排序功能
    filteredQuizzes.sort((a, b) => {
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'title') {
        return a.title.localeCompare(b.title);
      } else if (sortBy === 'questions') {
        return b.questions.length - a.questions.length;
      }
      return 0;
    });

    // 分页功能
    const startIndex = (page - 1) * pageSize;
    const paginatedQuizzes = filteredQuizzes.slice(startIndex, startIndex + pageSize);

    return {
      quizzes: paginatedQuizzes,
      total: filteredQuizzes.length,
      totalPages: Math.ceil(filteredQuizzes.length / pageSize)
    };
  };

  // 生成测试问卷数据
  const generateTestQuizzes = async () => {
    // 动态导入authStore以避免循环依赖
    const { useAuthStore } = await import('./authStore');
    const authStore = useAuthStore();
    const creatorId = authStore.currentUser?.id || 'default-user-123';
    const titles = [
      '数学基础知识测验', '世界历史事件问答', '自然科学常识测试',
      '文学经典作品了解', '奥林匹克运动知识', '中国地理概况',
      '古典音乐欣赏基础', '西方艺术史入门', '计算机基础概念', '英语常用词汇测试'
    ];

    const descriptions = [
      '涵盖代数、几何等基础数学知识',
      '从古代到现代的重要历史事件',
      '物理、化学、生物等基础科学知识',
      '国内外经典文学作品及作者',
      '奥运会项目及历史记录',
      '中国各省区地理特征',
      '古典音乐时期及作曲家作品',
      '文艺复兴到现代艺术流派',
      '计算机原理及基本操作',
      '英语四级核心词汇测试'
    ];

    // 清空现有数据
    quizzes.value = [];
    submissions.value = [];

    for (let i = 0; i < 10; i++) {
      const quiz = createQuiz(titles[i], descriptions[i], creatorId);

      // 为每份问卷添加2-4个问题
      for (let j = 0; j < Math.floor(Math.random() * 3) + 2; j++) {
        addQuestion(quiz.id, {
          text: `问题 ${j + 1}: 这是一份关于${titles[i]}的测试问题`,
          points: 10,
          type: 'single',
          options: ['选项A', '选项B', '选项C', '选项D'],
          correctAnswers: [Math.floor(Math.random() * 4)]
        });
      }

      // 为每份问卷添加5-15条随机提交记录
      const submissionCount = Math.floor(Math.random() * 11) + 5;
      for (let k = 0; k < submissionCount; k++) {
        const score = Math.floor(Math.random() * 51) + 50; // 50-100分
        const timeTaken = Math.floor(Math.random() * 241) + 60; // 60-300秒
        const date = new Date();
        date.setMinutes(date.getMinutes() - Math.floor(Math.random() * 1440 * 7)); // 过去7天内

        submissions.value.push({
          id: uuidv4(),
          quizId: quiz.id,
          userId: `user-${Math.floor(Math.random() * 1000)}`,
          userName: `用户${k + 1}`,
          score,
          timeTaken,
          submittedAt: date
        });
      }
    }

    localStorage.setItem('quizzes', JSON.stringify(quizzes.value));
    localStorage.setItem('submissions', JSON.stringify(submissions.value));
  };

  return {
    quizzes,
    submissions,
    initQuizzes,
    createQuiz,
    addQuestion,
    submitQuiz,
    getQuizRankings,
    getQuizById,
    getUserQuizzesWithFilters,
    generateTestQuizzes
  };
});