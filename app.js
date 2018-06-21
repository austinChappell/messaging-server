require('dotenv').config();

const express = require('express');
const graphqlHTTP = require('express-graphql');
const cors = require('cors');

const app = express();
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

app.listen(PORT, () => {
  console.log(`Server running on PORT ${PORT}`);
});
