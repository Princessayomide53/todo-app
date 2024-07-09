// src/apollo.js
import { ApolloClient, InMemoryCache } from '@apollo/client/core';
import { createHttpLink } from '@apollo/client/link/http';
import { provideApolloClient } from '@vue/apollo-composable';

// HTTP connection to the API
const httpLink = createHttpLink({
  uri: 'http://localhost:4000/', // Your Apollo Server URL
});

// Cache implementation
const cache = new InMemoryCache();

// Create the Apollo Client
const apolloClient = new ApolloClient({
  link: httpLink,
  cache,
});

// Provide Apollo Client to the Vue app
provideApolloClient(apolloClient);

export { apolloClient };
