import prettier from 'eslint-config-prettier';
import { importX } from 'eslint-plugin-import-x';
import globals from 'globals';

export default [
  // 通用 ignores
  {
    ignores: ['dist/**', 'node_modules/**', 'data/**'],
  },

  // 源码：浏览器/扩展环境
  {
    files: ['src/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.browser,
        ...globals.webextensions, // Chrome extension API
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      // 允许使用 console, 生产环境打包时将适当删除 console
      'no-console': 'off',
      'no-undef': 'error',
    },
  },

  // 仅此文件在源码层使用 process（供 Rollup 替换）；其余 src 误写 process.* 会 no-undef
  {
    files: ['src/lib/build-env.js'],
    languageOptions: {
      globals: {
        process: 'readonly',
      },
    },
  },

  // 构建/脚本: node 环境
  {
    files: ['*.js', 'scripts/**/*.js', 'rollup/**/*.js', 'test/**/*.js'],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      'no-undef': 'error',
    },
  },

  importX.flatConfigs.recommended,

  // 通用
  {
    rules: {
      // 相对路径必须带后缀；包名（dotenv、sharp）不要求
      'import-x/extensions': [
        'error',
        'ignorePackages',
        { js: 'always', html: 'always' },
      ],
      'import-x/order': [
        'error',
        {
          groups: ['builtin', 'external', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  // 关闭与 prettier 冲突的规则
  prettier,
];
