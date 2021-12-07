import {GraphQLObjectType, GraphQLNonNull, GraphQLString, GraphQLID} from 'graphql';
  
export const messageType = new GraphQLObjectType({
    name: "message",
    fields: () => ({
      id: { type: GraphQLID },
      name: { type: GraphQLString },
    }),
});
  