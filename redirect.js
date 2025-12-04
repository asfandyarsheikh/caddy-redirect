const fastify = require('fastify')({ logger: true });
const db = require('./db');
const { match } = require('path-to-regexp');

fastify.get('/*', async (request, reply) => {
  const host = request.headers.host || '';
  const protocol = request.headers['x-forwarded-proto'] || 'http';
  const fullUrl = `${protocol}://${host}${request.url}`;
  const [pathWithQuery, queryString] = request.url.split('?');
  const normalizedPath = pathWithQuery.replace(/\/+/g, '/');
  
  const redirects = db.getAll();
  
  // Try exact match first (full URL)
  const exact = redirects.find(r => r.from_url === fullUrl);
  if (exact) {
    return reply.code(301).redirect(filterQueryParams(exact.to_url, queryString, exact.allowed_params));
  }
  
  // Try pattern matches
  for (const redirect of redirects) {
    const matcher = match(redirect.from_url, { decode: decodeURIComponent });
    let result = matcher(fullUrl) || matcher(normalizedPath);
    
    if (result) {
      let toUrl = redirect.to_url;
      Object.keys(result.params).forEach(key => {
        toUrl = toUrl.replace(`:${key}`, result.params[key]);
      });
      return reply.code(301).redirect(filterQueryParams(toUrl, queryString, redirect.allowed_params));
    }
  }
  
  reply.code(404).send({ error: 'Redirect not found' });
});

function filterQueryParams(toUrl, queryString, allowedParams) {
  if (!queryString) return toUrl;
  
  const allowedParamsArray = allowedParams ? JSON.parse(allowedParams) : null;
  
  // null = allow all
  if (allowedParamsArray === null) {
    return `${toUrl}?${queryString}`;
  }
  
  // [] = allow none
  if (allowedParamsArray.length === 0) {
    return toUrl;
  }
  
  // filter to allowed params only
  const params = new URLSearchParams(queryString);
  const filtered = new URLSearchParams();
  allowedParamsArray.forEach(key => {
    if (params.has(key)) {
      filtered.set(key, params.get(key));
    }
  });
  
  return filtered.toString() ? `${toUrl}?${filtered.toString()}` : toUrl;
}

const start = async () => {
  try {
    await fastify.listen({ port: 3001, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
