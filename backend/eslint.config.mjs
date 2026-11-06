// @ts-check
import eslint from '@eslint/js';
import eslintPluginPrettierRecommended from 'eslint-plugin-prettier/recommended';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['eslint.config.mjs', 'src/generated/**'],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  eslintPluginPrettierRecommended,
  {
    // Files written in the code style of the winter-eccom backend (spaces inside parentheses, "x : Type", ...).
    // Prettier would rewrite them, so it is off here and the same paths are listed in .prettierignore
    files: [
      'src/auth/**/*.ts',
      'src/users/**/*.ts',
      'src/common/decorators/public.decorator.ts',
      'src/common/decorators/auth.decorator.ts',
      'src/common/dto/**/*.ts',
      'src/common/hashing/**/*.ts',
      'src/common/regex/**/*.ts',
      'src/common/types/jwt.types.ts',
    ],
    rules: {
      'prettier/prettier': 'off',
    },
  },
  {
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      ecmaVersion: 5,
      sourceType: 'module',
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn'
    },
  },
);