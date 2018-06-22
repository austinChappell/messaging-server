const ModelConstructor = require('./constructor');
const dbHelpers = require('../helpers/db.helpers');
const request = require('request');
const jwt = require('jsonwebtoken');

const { SERVER_SECRET } = process.env;

const { dbAction, dbRes } = dbHelpers;

const socialData = {
  facebook: {
    idKey: 'fb_id',
    responseIdKey: 'id',
    verifyBaseUrl: 'https://graph.facebook.com/me?access_token=',
  },
  google: {
    idKey: 'google_id',
    responseIdKey: 'user_id',
    verifyBaseUrl: 'https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=',
  },
};

class User extends ModelConstructor {
  constructor() {
    super();

    this.tableName = 'users';
  }

  createTable() {
    const sql = `
      CREATE TABLE IF NOT EXISTS ${this.tableName} (
        id SERIAL PRIMARY KEY,
        first_name varchar(50) NOT NULL,
        last_name varchar(50) NOT NULL,
        email varchar(100) NOT NULL,
        fb_id varchar(100),
        google_id varchar(100)
      )
    `;
    const params = [];
    dbAction(sql, params);
  }

  async findAll () {
    const sql = `
      SELECT * FROM ${this.tableName}
        ORDER BY first_name
    `;
    const params = [];
    return await dbRes(sql, params);
  }

  async socialAuth(userData, res) {
    const {
      firstName,
      lastName,
      email,
      socialMediaLabel,
      accessToken,
      socialAuthId,
    } = userData;
    
    const {
      idKey,
      responseIdKey,
      verifyBaseUrl,
    } = socialData[socialMediaLabel];
    
    const url = `${verifyBaseUrl}${accessToken}`;
    
    request(url, async(error, response, body) => {
      const data = JSON.parse(body);
      if (data[responseIdKey] === socialAuthId) {
        // THE USER ID IS VALID
        const foundUser = await this.findOne({ email });
        if (foundUser) {
          const token = jwt.sign({ id: foundUser.id }, SERVER_SECRET);
          foundUser.token = token;
          res.json(foundUser);
          // log them in
        } else {
          const userObj = {
            first_name: firstName,
            last_name: lastName,
            email,
          }
          userObj[idKey] = socialAuthId;
          const newUser = await this.create(userObj);
          const token = jwt.sign({ id: newUser.id }, SERVER_SECRET);
          newUser.token = token;
          res.json(newUser);
        }
      }
    });

  }
}

module.exports = User;
