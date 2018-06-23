const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const passport = require('passport');

const { SERVER_SECRET } = process.env;

const User = require('../models/User');
const user = new User();

const db = {
  updateOrCreate(user, cb) {
    // db dummy, we just cb the user
    cb(null, user);
  },
};

function serialize(req, res, next) {
  console.log('SERIALIZE RUNNING')
  db.updateOrCreate(req.user, (err, user) => {
    if (err) {
      return next(err);
    }
    // we store the updated information in req.user again
    req.user = user;
    next();
  });
}

function generateToken(req, res, next) {
  const sig = {
    id: req.user.id,
  };
  const secret = process.env.SERVER_SECRET;
  const expiration = {
    expiresIn: '30 days',
  };
  req.token = jwt.sign(sig, secret, expiration);
  next();
}

function respond(req, res) {
  console.log('ABOUT TO RESPOND')
  const data = req.user;
  data.token = req.token;
  console.log('DATA', data)
  res.status(200).json(data);
}

// router.post('/login', (req, res) => {
//   console.log('login route', req.body)
// })

router.post('/login', passport.authenticate('local', {
  session: false,
}), serialize, generateToken, respond);

router.post('/signup', async (req, res) => {
  console.log('HIT SIGN UP ROUTE', req.body);
  const {
    firstName,
    lastName,
    password,
    email,
  } = req.body;

  const salt = bcrypt.genSaltSync(10);
  const passwordHash = password ? bcrypt.hashSync(password, salt) : null;
  const newUser = await user.create({
    first_name: firstName,
    last_name: lastName,
    password_hash: passwordHash,
    email: email.toLowerCase(),
  });
  if (newUser) {
    res.json(newUser)
  } else {
    res.json({ error: 'There was a problem signing up' })
  }
}, passport.authenticate('local', {
  session: false,
}));

router.post('/logout', (req, res) => {
  console.log('logging out');
  req.logout();
  // res.redirect('/');
});

router.post('/fb_login', async (req, res) => {
  const {
    name,
    id: socialAuthId,
    accessToken,
    email,
  } = req.body;
  const nameSplit = name.split(' ');
  const firstName = nameSplit[0];
  const lastName = nameSplit[1];

  const userData = {
    socialAuthId,
    firstName,
    lastName,
    email,
    accessToken,
    socialMediaLabel: 'facebook',
  }

  user.socialAuth(userData, res);
})

router.post('/google_login', (req, res) => {
  const {
    accessToken,
    profileObj,
  } = req.body;

  const {
    googleId: socialAuthId,
    givenName: firstName,
    familyName: lastName,
    email,
  } = profileObj;

  const userData = {
    socialAuthId,
    firstName,
    lastName,
    email,
    accessToken,
    socialMediaLabel: 'google',
  }

  user.socialAuth(userData, res);
})

router.post('/verify_token', (req, res) => {
  const { token } = req.body;
  jwt.verify(token, SERVER_SECRET, async (error, decoded) => {
    if (error) {
      res.json({ error })
    } else {
      const foundUser = await user.findById(decoded.id);
      if (foundUser) {
        const refreshToken = jwt.sign({ id: foundUser.id }, SERVER_SECRET);
        foundUser.token = refreshToken;
        res.json(foundUser);
      } else {
        res.json({ error: 'token invalid' })
      }
    }
  });
})

module.exports = router;