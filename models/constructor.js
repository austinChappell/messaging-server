const { Client } = require('pg');

const dbConfig = require('../config/db.config');
const dbHelpers = require('../helpers/db.helpers');

const { dbRes } = dbHelpers;

class MethodConstructor {
  async create (obj) {
    const columns = Object.keys(obj).join();
    const values = Object.values(obj);
    const symbols = values.map((v, i) => `$${i + 1}`);
    const sql = `
      INSERT INTO ${this.tableName}
        (${columns})
        VALUES (${symbols})
        RETURNING *
    `;
    const params = values;
    const results = await dbRes(sql, params);
    return results[0];
  }

  async findById (id) {
    const sql = `
      SELECT * FROM ${this.tableName}
        WHERE id = $1
    `;
    const params = [id];
    const results = await dbRes(sql, params);
    return results[0];
  }

  async findOne (obj) {
    const keys = Object.keys(obj);
    const values = Object.values(obj);
    const conditions = keys.map((k, i) => {
      return `${k} = $${i + 1}`;
    }).join('');
    const sql = `
      SELECT * FROM ${this.tableName}
        WHERE (${conditions})
    `;
    const params = values;
    const results = await dbRes(sql, params);
    return results[0];
  }

  async findAll () {
    const sql = `
      SELECT * FROM ${this.tableName}
    `;
    const params = [];
    return await dbRes(sql, params);
  }
}

module.exports = MethodConstructor;
