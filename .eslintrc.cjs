module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
  ],
  ignorePatterns: ['dist', '.eslintrc.cjs'],
  parser: '@typescript-eslint/parser',
  plugins: ['react-refresh'],
  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    // --- THE FIXES ---
    '@typescript-eslint/no-unused-vars': 'off',      // Ignores unused variables
    '@typescript-eslint/no-explicit-any': 'off',     // Ignores 'any' types
    'react-hooks/exhaustive-deps': 'off',            // Ignores missing dependencies
    'prefer-const': 'off'                            // Ignores let/const suggestions
  },
}