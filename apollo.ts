import { ApolloClient } from "apollo-client";
import { InMemoryCache } from "apollo-cache-inmemory";
import { HttpLink } from "apollo-link-http";
import { onError } from "apollo-link-error";
import { ApolloLink, split } from "apollo-link";
import { WebSocketLink } from "apollo-link-ws";
import { getMainDefinition } from "apollo-utilities";

// const TEST_URL = "192.168.99.1:4000"; // android Emulator 사용시
const TEST_URL = "localhost:4000";

const httpLink = new HttpLink({
  uri: `http://${TEST_URL}`,
});

const wsLink = new WebSocketLink({
  uri: `ws://${TEST_URL}/`,
  options: {
    reconnect: true,
  },
});

const client = new ApolloClient({
  link: ApolloLink.from([
    onError(({ graphQLErrors, networkError }) => {
      if (graphQLErrors)
        graphQLErrors.map(({ message, locations, path }) =>
          console.log(
            `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
          )
        );
      if (networkError) console.log(`[Network error]: ${networkError}`);
    }),
    split(
      // split based on operation type
      // 쿼리타입이면 http링크, sub 면 ws링크
      ({ query }) => {
        const definition = getMainDefinition(query);
        return (
          definition.kind === "OperationDefinition" &&
          definition.operation === "subscription"
        );
      },
      wsLink,
      httpLink
    ),
  ]),
  cache: new InMemoryCache(),
});

export default client;
