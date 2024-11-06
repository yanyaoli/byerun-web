module.exports = {
  root: true,
  env: {
    node: true,
  },
  extends: [
    'plugin:vue/vue3-essential',
    'eslint:recommended',
    '@vue/typescript/recommended',
  ],
  parserOptions: {
    ecmaVersion: 2020,
  },
  rules: {
    'vue/comment-directive': 'off', // 关闭 vue/comment-directive 规则
    'vue/multi-word-component-names': 'off', // 关闭多单词组件名规则
    '@typescript-eslint/no-explicit-any': 'off', // 关闭 TypeScript 中的 no-explicit-any 规则
  },
};