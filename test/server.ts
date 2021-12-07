import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import router from './routes/app.routes';
import {schema} from './Schema/index'
import cors from 'cors';
// const resolvers = require('./resolvers')

const main = async ()=>{
    const app = express();
    app.use(express.json())
    app.use(cors())
    app.use(router)

    app.use('/graphql', graphqlHTTP({
        schema,
        graphiql: true,
    }));
    const port: number = 8080;
    
    app.listen(port,()=>{
        console.log(`Server on port ${port}`)
    })
}

main().catch((err)=>{
    console.log(err)
})