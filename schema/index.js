const graphql = require('graphql');

const User = require('../models/User');

const user = new User();

const {
  GraphQLID,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLSchema,
  GraphQLString,
} = graphql;

user.createTable();

const UserType = new GraphQLObjectType({
  name: 'user',
  fields: () => ({
    id: { type: GraphQLID },
    first_name: { type: GraphQLString },
    last_name: { type: GraphQLString },
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    user: {
      type: UserType,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      async resolve(parent, args) {
        console.log('args', args);
        return await user.findById(args.id)
      }
    },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parent, args) {
        const users = await user.findAll();
        console.log('USERS', users);
        return users;
      }
    }
  },
})

module.exports = new GraphQLSchema({
  query: RootQuery,
});
