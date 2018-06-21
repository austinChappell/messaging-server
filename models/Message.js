const ModelConstructor = require('./constructor');
const dbHelpers = require('../helpers/db.helpers');

const { dbAction } = dbHelpers;

class Message extends ModelConstructor {
  constructor() {
    super();

    this.tableName = 'messages';
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id SERIAL PRIMARY KEY,
        content varchar(500) NOT NULL,
        sender_id INT NOT NULL REFERENCES users (id),
        recipient_id INT NOT NULL REFERENCES users (id),
        read BOOL NOT NULL DEFAULT false,
        timestamp timestamp default current_timestamp
      )
    `;
    const params = [];
    dbAction(sql, params);
  }

}

module.exports = Message;
