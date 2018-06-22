require('dotenv').config();


const express = require('express');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');

const app = express();
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

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true,
}));
app.use('/api/auth', require('./routes/auth'))

io.on('connection', (client) => {
  client.on('SEND_MESSAGE', (message) => {
    io.emit('RECEIVE_MESSAGE', message)
  })
});

server.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
