const ModelConstructor = require('./constructor');
const dbHelpers = require('../helpers/db.helpers');

const { dbAction, dbRes } = dbHelpers;

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
  
  async pair(sender, recipient) {
    const sql = `
    SELECT * FROM ${this.tableName}
      WHERE (recipient_id = $1 AND sender_id = $2)
      OR (sender_id = $1 AND recipient_id = $2)
      ORDER BY timestamp
    `;
    const params = [sender, recipient];
    return await dbRes(sql, params);
  }

  async pairLast(sender, recipient) {
    const sql = `
    SELECT * FROM ${this.tableName}
      WHERE (recipient_id = $1 AND sender_id = $2)
      OR (sender_id = $1 AND recipient_id = $2)
      ORDER BY timestamp DESC
      LIMIT 1
    `;
    const params = [sender, recipient];
    return await dbRes(sql, params);
  }

  async userUnreadMessages(id) {
    const sql = `
      SELECT * FROM ${this.tableName}
        WHERE recipient_id = $1 AND read = $2
    `;
    const params = [id, false];
    return await dbRes(sql, params);
  }

  async markUnread(recipientId, senderId) {
    console.log('MARKING AS READ')
    const sql = `
      UPDATE ${this.tableName}
        SET read = $1
        WHERE recipient_id = $2 AND sender_id = $3
        RETURNING *
    `;
    const params = [true, recipientId, senderId];
    return await dbRes(sql, params);
  }

}

module.exports = Message;
