/** Mirrors admin-web resolveApiBaseUrl logic. */
function resolveApiBaseUrl(raw) {
  const trimmed = raw?.trim();
  if (!trimmed) return '/api/v1';
  let base = trimmed.replace(/\/+$/, '');
  if (!base.endsWith('/api/v1')) base = `${base}/api/v1`;
  return base;
}

const cases = [
  [undefined, '/api/v1'],
  ['', '/api/v1'],
  ['http://localhost:8080', 'http://localhost:8080/api/v1'],
  ['http://localhost:8080/api/v1', 'http://localhost:8080/api/v1'],
  ['http://localhost:8080/api/v1/', 'http://localhost:8080/api/v1'],
];

for (const [input, expected] of cases) {
  const got = resolveApiBaseUrl(input);
  if (got !== expected) {
    console.error(`FAIL input=${JSON.stringify(input)} expected=${expected} got=${got}`);
    process.exit(1);
  }
}
console.log('admin API base URL resolver OK');
