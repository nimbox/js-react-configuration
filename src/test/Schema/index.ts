import { GraphQLObjectType, GraphQLSchema } from "graphql";
import {GET_MESSAGE} from '../Queries'
// import mutations from '../Mutations'

const RootQuery = new GraphQLObjectType({
    name: 'RootQuery',
    fields:{getMessage: GET_MESSAGE}
})

// const Mutation = new GraphQLObjectType({
//     name: 'Mutation',
//     fields: {mutations}
// })

export const schema = new GraphQLSchema({
    query: RootQuery,
    // mutation: Mutation
})