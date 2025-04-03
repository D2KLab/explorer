import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { fixupConfigRules } from '@eslint/compat';
import { FlatCompat } from '@eslint/eslintrc';
import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';

const moduleName = fileURLToPath(import.meta.url);
const moduleDir = path.dirname(moduleName);
const compat = new FlatCompat({
  baseDirectory: moduleDir,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  globalIgnores(['docs', '.next']),
  {
    extends: fixupConfigRules(
      compat.extends(
        'eslint:recommended',
        'next',
        'prettier',
        'plugin:import/recommended',
        'plugin:prettier/recommended',
      ),
    ),

    languageOptions: {
      globals: {},
    },

    settings: {
      'import/resolver': {
        'babel-module': {
          root: ['.'],

          alias: {
            '@components': './src/components',
            '@helpers': './src/helpers',
            '@pages': './src/pages',
            '@styles': './src/styles',
            '~': '.',
          },
        },
      },
    },

    rules: {
      'react/no-danger': 0,
      'react-hooks/exhaustive-deps': 0,
      'react/react-in-jsx-scope': 0,
      'react/prop-types': 0,
      'react/jsx-filename-extension': 0,
      'react/destructuring-assignment': 0,
      'react/jsx-props-no-spreading': 0,
      'jsx-a11y/anchor-is-valid': 0,
      'no-nested-ternary': 0,
      'no-await-in-loop': 0,
      'array-callback-return': 0,
      'consistent-return': 0,
      'no-param-reassign': 0,
      'lines-between-class-members': 0,
      'global-require': 0,

      'import/order': [
        'error',
        {
          'newlines-between': 'always',

          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
        },
      ],

      'import/no-named-as-default-member': 0,

      'jsx-a11y/label-has-associated-control': [
        2,
        {
          assert: 'nesting',
          controlComponents: ['Input', 'Switch'],
        },
      ],

      'no-underscore-dangle': [
        'error',
        {
          allow: ['_id'],
        },
      ],

      camelcase: 0,

      'no-constant-condition': [
        'error',
        {
          checkLoops: false,
        },
      ],
    },
  },
]);
