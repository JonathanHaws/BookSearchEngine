const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { authMiddleware, signToken } = require('../utils/auth');

const resolvers = {
  Query: {
    me: async (_, __, context) => {
      if (!context.user) throw new AuthenticationError('You need to log in');
      return User.findById(context.user._id).populate('savedBooks');
    },
  },

  Mutation: {
    login: async (_, { email, password }) => {
      const user = await User.findOne({ email });
      if (!user || !(await user.isCorrectPassword(password))) {
        throw new AuthenticationError('Wrong email or password');
      }
      return { token: signToken(user), user };
    },

    addUser: async (_, { username, email, password }) => {
      const user = await User.create({ username, email, password });
      return { token: signToken(user), user };
    },

    saveBook: async (_, { bookData }, context) => {
      if (!context.user) throw new AuthenticationError('Log in to save books');
      return await User.findByIdAndUpdate(context.user._id, { $push: { savedBooks: bookData } }, { new: true, runValidators: true });
    },

    removeBook: async (_, { bookId }, context) => {
      if (!context.user) throw new AuthenticationError('Log in to remove books from collection');
      return await User.findByIdAndUpdate(context.user._id, { $pull: { savedBooks: { bookId } } }, { new: true }).populate('savedBooks');
    },
  },
};

module.exports = resolvers;