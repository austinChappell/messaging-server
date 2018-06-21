const router = require('express').Router();
const jwt = require('jsonwebtoken');

const { SERVER_SECRET } = process.env;

const User = require('../models/User');
const user = new User();

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

router.post('/verify_token', async (req, res) => {
  const { token } = req.body;
  const decoded = jwt.verify(token, SERVER_SECRET);
  const foundUser = await user.findById(decoded.id);
  console.log('USER', foundUser);
  const refreshToken = jwt.sign({ id: foundUser.id }, SERVER_SECRET);
  foundUser.token = refreshToken;
  console.log('FOUND USER', foundUser);
  res.json(foundUser);
})

module.exports = router;