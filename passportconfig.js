const LocalStrategy = require('passport-local').Strategy;
// const FacebookStrategy = require('passport-facebook').Strategy;
const { Client } = require('pg');
const dataStore = require('./config/db.config.js');

const { dbConfig } = dataStore;

const User = require('./models/User');
const user = new User();

function configure(passport) {
  const strategyFunc = function (email, password, done) {
    console.log('STRATEGY FUNC RUNNING');
    user.checkUser(email.toLowerCase(), password, (err, user) => {
      if (err) {
        console.log('Local Strategy - Error trying to authenticate.');
        done(err);
      } else if (user) {
        console.log('Local Strategy - Success');
        done(null, user);
      } else {
        console.log('Local Strategy - Could not find user');
        done(null, false);
      };
    });
  };
  passport.use(new LocalStrategy({
    usernameField: 'email',
  }, strategyFunc));
  passport.serializeUser((user, done) => {
    console.log('serializeUser', user);
    done(null, user);
  });
  passport.deserializeUser((user, done) => {
    console.log('deserializeUser', user);
    const userId = user.id;
    const client = new Client();

    client.connect().then(() => {
      const sql = 'SELECT * FROM users WHERE id = $1';
      const params = [userId];

      return client.query(sql, params);
    }).then((results) => {
      const user = results.rows[0];
      done(null, user);
    }).catch((err) => {
      throw err;
    }).then(() => {
      client.end();
    });
  });
}

module.exports = { configure };