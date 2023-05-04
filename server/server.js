const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const { typeDefs, resolvers } = require('./Schemas');
const db = require('./config/connection');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
const { authMiddleware } = require('./utils/auth');

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: ({ req }) => {
    return {
      user: req.user
    };
  }
});

app.use(express.static(path.join(__dirname, '../client/build')));
app.use(authMiddleware);
server.applyMiddleware({ app, context: ({ req }) => ({ req }) });

db.once('open', () => {
  app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}${server.graphqlPath}`);
  });
});
