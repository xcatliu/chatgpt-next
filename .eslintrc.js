module.exports = {
  extends: ['next/core-web-vitals', 'prettier'],
  rules: {
    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index'],
        pathGroups: [
          {
            pattern: '@/**',
            group: 'parent',
          },
        ],
        'newlines-between': 'always',
        alphabetize: {
          order: 'asc',
          caseInsensitive: true,
        },
        // 调试了好久 pathGroups 都不生效，最后终于在这个 github issue 里找到解决办法了
        // https://github.com/import-js/eslint-plugin-import/issues/1682#issuecomment-608969468
        pathGroupsExcludedImportTypes: [],
      },
    ],
    // sort-imports 只用开启 memberSort，因为其他的功能都由 import/order 规则实现
    'sort-imports': [
      'warn',
      {
        ignoreCase: true,
        ignoreDeclarationSort: true,
        ignoreMemberSort: false,
      },
    ],
    'react/self-closing-comp': 'error',
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      parser: '@typescript-eslint/parser',
      plugins: ['@typescript-eslint'],
      parserOptions: {
        project: true,
        tsconfigRootDir: __dirname,
      },
      rules: {
        '@typescript-eslint/consistent-type-imports': 'warn',
      },
    },
  ],
};
