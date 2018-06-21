const graphql = require('graphql');

const Message = require('../models/Message');
const User = require('../models/User');

const message = new Message();
const user = new User();

const {
  GraphQLBoolean,
  GraphQLID,
  GraphQLObjectType,
  GraphQLNonNull,
  GraphQLList,
  GraphQLSchema,
  GraphQLString,
} = graphql;

message.createTable();
user.createTable();

const MessageType = new GraphQLObjectType({
  name: 'message',
  fields: () => ({
    id: { type: GraphQLID },
    content: { type: GraphQLString },
    sender_id: { type: GraphQLID },
    recipient_id: { type: GraphQLID },
    read: { type: GraphQLBoolean },
    timestamp: { type: GraphQLString },
  })
})

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
    messages: {
      type: new GraphQLList(MessageType),
      async resolve(parent, args) {
        const messages = await message.findAll();
        return messages;
      }
    },
    myMessages: {
      type: new GraphQLList(MessageType),
      args: {
        id: { type: GraphQLID },
      },
      async resolve(parent, args) {
        const messages = await message.findAllBy({
          recipient_id: args.id,
          sender_id: args.id,
        });
        return messages;
      }
    },
    user: {
      type: UserType,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      async resolve(parent, args) {
        return await user.findById(args.id)
      }
    },
    users: {
      type: new GraphQLList(UserType),
      async resolve(parent, args) {
        const users = await user.findAll();
        return users;
      }
    }
  },
});

const Mutation = new GraphQLObjectType({
  name: 'MutationType',
  fields: {
    addMessage: {
      type: MessageType,
      args: {
        content: {
          type: new GraphQLNonNull(GraphQLString),
        },
        sender_id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        recipient_id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        read: {
          type: GraphQLBoolean,
        },
        timestamp: {
          type: GraphQLString,
        },
      },
      async resolve(parent, args) {
        return await message.create(args);
      }
    },
  },
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
});
