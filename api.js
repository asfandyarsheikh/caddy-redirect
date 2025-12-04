const fastify = require('fastify')({ logger: true });
const db = require('./db');

// GET /redirects - list all
fastify.get('/redirects', async (request, reply) => {
  const redirects = db.getAll();
  return redirects.map(r => ({
    ...r,
    allowed_params: r.allowed_params ? JSON.parse(r.allowed_params) : null
  }));
});

// POST /redirects - create
fastify.post('/redirects', async (request, reply) => {
  const { from_url, to_url, allowed_params } = request.body;
  try {
    db.create(from_url, to_url, allowed_params);
    return { from_url, to_url, allowed_params };
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
});

// PUT /redirects/:from_url - update
fastify.put('/redirects/*', async (request, reply) => {
  const from_url = '/' + request.params['*'];
  const { to_url, allowed_params } = request.body;
  try {
    db.update(from_url, to_url, allowed_params);
    return { from_url, to_url, allowed_params };
  } catch (err) {
    reply.code(400).send({ error: err.message });
  }
});

// DELETE /redirects/:from_url - delete
fastify.delete('/redirects/*', async (request, reply) => {
  const from_url = '/' + request.params['*'];
  db.deleteByFromUrl(from_url);
  return { deleted: true };
});

const start = async () => {
  try {
    await fastify.listen({ port: 3000, host: '0.0.0.0' });
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
