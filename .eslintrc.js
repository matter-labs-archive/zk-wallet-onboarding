module.exports = {
  root: true,
  parserOptions: {
    sourceType: 'module',
    tsconfigRootDir: __dirname,
    project: ['./tsconfig.json'],
    parser: '@typescript-eslint/parser',
    ecmaVersion: 12,
    extraFileExtensions: ['.svelte']
  },
  env: {
    node: true,
    browser: true
  },
  extends: [
    'plugin:prettier/recommended',
    'plugin:@typescript-eslint/recommended',
    'prettier',
    'plugin:prettier/recommended'
  ],
  rules: {
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-empty-function': 'off',
    'no-undef': 'off'
  },
  ignorePatterns: ['.yarn', 'icon-*.ts']
}