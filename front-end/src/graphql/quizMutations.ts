import { gql } from '@apollo/client';

// 创建新的测验集合
export const CREATE_QUIZ = gql`
  mutation CreateQuiz($field0: CreateQuizParams!) {
    createQuiz(field0: $field0)
  }
`;

// 提交测验答案
export const SUBMIT_ANSWERS = gql`
  mutation SubmitAnswers($field0: SubmitAnswersParams!) {
    submitAnswers(field0: $field0)
  }
`;

// 设置用户昵称
export const SET_NICKNAME = gql`
  mutation SetNickname($field0: SetNicknameParams!) {
    setNickname(field0: $field0)
  }
`;
