module.exports = {
    extends: ['@commitlint/config-conventional'],
    rules: {
      'type-enum': [
        2,
        'always',
        ['docs', 'feat', 'fix', 'chore', 'refactor', 'style']
      ],
      'scope-case': [2, 'always', 'lower-case'],
      'subject-case': [2, 'never', ['start-case', 'pascal-case', 'upper-case']],
    }
  }