const ModelConstructor = require('./constructor');
const dbHelpers = require('../helpers/db.helpers');
const request = require('request');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const checkPassword = function (password, passwordHash) {
  return bcrypt.compareSync(password, passwordHash);
};

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
        password_hash varchar(250) NOT NULL
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

  async checkUser (email, password, done) {
    console.log('CHECK USER FUNCTION RUNNING', email, password);

    const sql = `
      SELECT * FROM ${this.tableName}
        WHERE email = $1
    `;

    const params = [email];
    const foundUserArr = await dbRes(sql, params);
    const foundUser = foundUserArr[0]
    console.log('found user', foundUser);

    if (foundUser && checkPassword(password, foundUser.password_hash)) {
      console.log('Should be a successful login');
      done(null, foundUser);
    } else {
      console.log('The user probably entered the incorrect password');
      done(null, false);
    }


    // const foundUser = await user.findOne({ email });
    // const client = new Client(dbConfig);
  
    // client.connect().then(() => {
    //   const sql = 'SELECT * FROM users WHERE email = $1';
    //   const params = [email];
  
    //   return client.query(sql, params);
    // }).then((results) => {
    //   console.log('username results', results.rows);
    //   const user = results.rows[0];
  
    //   if (user && checkPassword(password, user.password_hash)) {
    //     console.log('Should be a successful login');
    //     done(null, user);
    //   } else {
    //     console.log('The user probably entered the incorrect password');
    //     done(null, false);
    //   }
    // }).catch((err) => {
    //   throw err;
    // }).then(() => {
    //   client.end();
    // })
  };
}

module.exports = User;
