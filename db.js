const Database = require('better-sqlite3');
const db = new Database(process.env.DB_PATH || 'redirects.db');

db.exec(`
  CREATE TABLE IF NOT EXISTS redirects (
    from_url TEXT PRIMARY KEY,
    to_url TEXT NOT NULL,
    allowed_params TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const getAll = () => db.prepare('SELECT * FROM redirects').all();
const getByFromUrl = (fromUrl) => db.prepare('SELECT * FROM redirects WHERE from_url = ?').get(fromUrl);
const create = (fromUrl, toUrl, allowedParams) => {
  const params = allowedParams ? JSON.stringify(allowedParams) : null;
  return db.prepare('INSERT INTO redirects (from_url, to_url, allowed_params) VALUES (?, ?, ?)').run(fromUrl, toUrl, params);
};
const update = (fromUrl, toUrl, allowedParams) => {
  const params = allowedParams ? JSON.stringify(allowedParams) : null;
  return db.prepare('UPDATE redirects SET to_url = ?, allowed_params = ? WHERE from_url = ?').run(toUrl, params, fromUrl);
};
const deleteByFromUrl = (fromUrl) => db.prepare('DELETE FROM redirects WHERE from_url = ?').run(fromUrl);

module.exports = { getAll, getByFromUrl, create, update, deleteByFromUrl };
