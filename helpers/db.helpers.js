const { Client } = require('pg');
const dbConfig = require('../config/db.config');

module.exports = {
  dbAction: async (sql, params) => {
    try {
      const client = new Client(dbConfig);
      await client.connect();
      const results = await client.query(sql, params);
      client.end();
      return results;
    } catch(err) {
      throw err;
    }
  },

  dbRes: async (sql, params) => {
    try {
      const client = new Client(dbConfig);
      await client.connect();
      const results = await client.query(sql, params);
      client.end();
      return results.rows;
    } catch(err) {
      throw err;
    }
  }
}
