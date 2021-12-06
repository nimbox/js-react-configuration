import React from 'react';
import {ApolloClient, InMemoryCache, ApolloProvider, useQuery, useMutation, gql} from '@apollo/client';
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
      </ApolloProvider>
    </>
    )
}

export default App;
