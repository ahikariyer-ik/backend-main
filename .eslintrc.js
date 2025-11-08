module.exports = {
  extends: [
    'next/core-web-vitals',
    'plugin:@typescript-eslint/recommended',
    'plugin:import/recommended',
    'prettier'
  ],
  rules: {
    'jsx-a11y/alt-text': 'off',
    'react/display-name': 'off',
    'react/no-children-prop': 'off',
    '@next/next/no-img-element': 'off',
    '@next/next/no-page-custom-font': 'off',
    '@typescript-eslint/consistent-type-imports': 'warn',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    '@typescript-eslint/no-non-null-assertion': 'off',

    // ⬇️ Kaldırıldı veya yumuşatıldı
    'padding-line-between-statements': 'off',
    'newline-before-return': 'off',
    'lines-around-comment': 'off',
    'import/newline-after-import': 'off',

    'import/order': [
      'warn',
      {
        groups: ['builtin', 'external', ['internal', 'parent', 'sibling', 'index']],
        pathGroupsExcludedImportTypes: ['react'],
        'newlines-between': 'never'
      }
    ],

    '@typescript-eslint/ban-types': [
      'warn',
      {
        extendDefaults: true,
        types: {
          Function: false,
          Object: false,
          Boolean: false,
          Number: false,
          String: false,
          Symbol: false,
          any: false,
          '{}': false
        }
      }
    ]
  },
  settings: {
    react: {
      version: 'detect'
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx']
    },
    'import/resolver': {
      node: {},
      typescript: {
        project: './tsconfig.json'
      }
    }
  },
  overrides: [
    {
      files: ['*.ts', '*.tsx'],
      rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
};
