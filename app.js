require('dotenv').config();


const express = require('express');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');

const app = express();
const passport = require('passport');
const session = require('express-session');
const server = require('http').createServer(app);
const io = require('socket.io')(server);

const bodyParser = require('body-parser');

const { PORT } = process.env;

const schema = require('./schema/');

app.use(cors());

app.use(bodyParser.urlencoded({
  extended: true,
}));

app.use(bodyParser.json({
  limit: '50mb',
}));

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', process.env.CLIENT_URL);
  res.header('Access-Control-Allow-Headers', 'Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Max-Age', 1728000);

  next();
});

app.use(session({
  secret: process.env.SERVER_SECRET,
  resave: false,
  saveUninitialized: false,
  // cookie: {
  //   secure: false
  // },

  path: '/*', // NEEDED
}));

app.use(passport.initialize());
app.use(passport.session());
require('./passportconfig').configure(passport);

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));
app.use('/api/auth', require('./routes/auth'))

io.on('connection', (client) => {
  client.on('SEND_MESSAGE', (message) => {
    io.emit('RECEIVE_MESSAGE', message)
  })

  client.on('SEND_TYPING', data => {
    io.emit('RECEIVE_TYPING', data);
  })

  client.on('STOP_TYPING', data => {
    io.emit('RECEIVE_STOP_TYPING', data);
  })
});

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
