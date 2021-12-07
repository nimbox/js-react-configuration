import React from 'react';
import {ApolloClient, InMemoryCache, ApolloProvider, useQuery, useMutation, gql} from '@apollo/client';
import { ReadFromGraphQL } from './components/Component1';
import './App.css'
function App() {

    const client = new ApolloClient({
      uri: "http://localhost:8080/graphql",
      cache: new InMemoryCache(),
    });
  
    return (
      <>
        <ApolloProvider client={client}>
          <div className="bg-gray-900">
            <div className='grid justify-items-center text-white'>Hello World!</div>
          </div>
          <ReadFromGraphQL />
        </ApolloProvider>
      </>
    )
}

export default App;
