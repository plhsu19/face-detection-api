import express from 'express'
import bcrypt from 'bcrypt-nodejs'
import cors from 'cors';
import knex from 'knex';
import {handleRegister} from './controllers/register.js';
import {handleSignin} from './controllers/signin.js';
import handleProfileGet from './controllers/profile.js'
import handleImage from './controllers/image.js'


// create the client to connect and communicate with the Postgres database
const pgDatabase = knex({
    client: 'pg',
    connection: {
        host: '127.0.0.1',
        user: 'peilunhsu',
        password: '',
        database: 'object-detect'
    }
});

const app = express();

// show the table users in DB before operations
// pgDatabase.select('*').from('users').then(console.log)

// use middleware to parse the json format body in request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// API endpoints:

//root route
// only for testing: response all users' profile (as a list of objects) for checking
app.get('/', (req, res) => {
    pgDatabase.select('*')
        .from('users')
        .then(users => {
            res.json(users);
        })
})

// signin route
app.post('/signin', (req, res) => { handleSignin(req, res, bcrypt, pgDatabase) })

// register route
app.post('/register', (req, res) => { handleRegister(req, res, bcrypt, pgDatabase) })

// profile route
// use path.../:parameter to extract the varying parameter value in the path
app.get('/profile/:id', (req, res) => { handleProfileGet(req, res, pgDatabase) })

// image route
// update/increase the entries in user's profile after detection succeed.
// response with the updated entries (to FE)
app.put('/image', (req, res) => { handleImage(req, res, pgDatabase) })

// listen on the local port 3000, run the callback for testing
app.listen(3000, () => {
    console.log('the server is running on local:3000');
});















