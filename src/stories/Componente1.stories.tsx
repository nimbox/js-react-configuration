import React from 'react';
import { ComponentStory, ComponentMeta } from '@storybook/react';

import {ReadFromGraphQL} from '../components/Component1';
import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
    uri: "http://localhost:8080/graphql",
    cache: new InMemoryCache(),
});

export default {
  title: 'ReadFromGraphQL',
  component: ReadFromGraphQL,
} as ComponentMeta<typeof ReadFromGraphQL>;

export const Template: ComponentStory<typeof ReadFromGraphQL> = () =>(
    <ApolloProvider client={client}>
        <ReadFromGraphQL />;
    </ApolloProvider>
)