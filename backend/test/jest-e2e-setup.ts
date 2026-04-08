// Set required environment variables for e2e tests.
// These override missing values only — real values from process.env take precedence.
process.env.OPENROUTER_API_KEY ??= 'test-placeholder';
process.env.OPENROUTER_MODEL ??= 'test/model';
