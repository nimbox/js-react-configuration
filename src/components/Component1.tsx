import { gql, useQuery } from '@apollo/client';
import React from 'react';



export const ReadFromGraphQL: React.FC = () => {
    const QUERY = gql`
        query {
            getMessage 
            
          }
        `;

    const { data, loading, error } = useQuery(QUERY);

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

