import React from 'react';
import {ApolloClient, InMemoryCache, ApolloProvider, useQuery, useMutation, gql} from '@apollo/client';



export const ReadFromGraphQL: React.FC = () => {
    const QUERY = gql`
        query {
            getMessage 
            
          }
        `;

    const {data, loading, error} = useQuery(QUERY);

    if (loading) {
        return <p>Loading...</p>
    }

    if (error) return <p>Error!</p>;

    return (

        <div>

            <pre>{JSON.stringify(data, null, 4)}</pre>

        </div>

    );



};

