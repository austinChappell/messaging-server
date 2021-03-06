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

const createTables = async () => {
  await user.createTable();
  await message.createTable();
}

createTables();

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
    messages: {
      type: new GraphQLList(MessageType),
      args: {
        id: {
          type: GraphQLID,
        },
      },
      async resolve(parent, args) {
        return await message.pair(Number(args.id), parent.id);
      }
    },
    last_message: {
      type: MessageType,
      args: {
        id: {
          type: GraphQLID,
        },
      },
      async resolve(parent, args) {
        const messages = await message.pairLast(Number(args.id), parent.id);
        return messages[0];
      }
    }
  }),
});

const RootQuery = new GraphQLObjectType({
  name: 'RootQueryType',
  fields: {
    messages: {
      type: new GraphQLList(MessageType),
      async resolve(parent, args) {
        return await message.findAll();
      }
    },
    myUnreadMessages: {
      type: new GraphQLList(MessageType),
      args: {
        id: { type: GraphQLID },
      },
      async resolve(parent, args) {
        return await message.userUnreadMessages(args.id);
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
        return await user.findAll();
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
    readMessages: {
      type: MessageType,
      args: {
        sender_id: {
          type: new GraphQLNonNull(GraphQLID),
        },
        recipient_id: {
          type: new GraphQLNonNull(GraphQLID),
        },
      },
      async resolve(parent, args) {
        console.log('RESOLVER RUNNING')
        return await message.markUnread(args.recipient_id, args.sender_id);
      }
    }
  },
})

const Subscription = new GraphQLObjectType({
  name: 'subscription',
  fields: {
    messageAdded: {
      type: MessageType,
      resolve: source => source,
    }
  }
})

module.exports = new GraphQLSchema({
  query: RootQuery,
  mutation: Mutation,
  subscription: Subscription,
});
