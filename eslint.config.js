import antfu from '@antfu/eslint-config'

export default antfu(
  {
    ignores: [
      'public/antd.json',
      'public/bug_versions.json',
      'index.user.js',
    ],
  },
  {
    files: ['**/*.ts'],
    rules: {
      'ts/no-this-alias': ['off'],
      'node/prefer-global/process': ['off'],
    },
  },
)
