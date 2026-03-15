import { GraphQLList, GraphQLID, GraphQLNonNull, GraphQLString} from 'graphql';
// import {Message} from '../Entities/index';
import {messageType} from '../Types/index';
  
const message: string[] = ['Hello from the GraphQL backend!'];

export const GET_MESSAGE = {
    type: new GraphQLList(GraphQLString),
    resolve() {
      return message;
    },
};