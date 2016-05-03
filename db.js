import express from 'express';
import mongoose from 'mongoose';
import graphql from './graphql';

let router = express();
router.set('trust proxy', 'loopback');
router.set('x-powered-by', false);

router.use('/graphql', graphql);

mongoose.connect('mongodb://localhost/rememberthelink');

let server = router.listen(3001, 'localhost', function(){
    console.log('GraphQL server running on port 3001');
});

export default server;
