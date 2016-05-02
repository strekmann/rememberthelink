import express from 'express';
import graphQLHTTP from 'express-graphql';

import { Schema } from './schema';

let router = express();

router.use('/', (req, res, next) => {
    graphQLHTTP(request => {
        return({
            schema: Schema,
            pretty: true,
            graphiql: true,
        })
    })(req, res, next);
});

export default router;
