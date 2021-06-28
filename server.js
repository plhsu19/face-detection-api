import express from 'express'
import bcrypt from 'bcrypt-nodejs'
import cors from 'cors';
import knex from 'knex';
import {handleRegister} from './controllers/register.js';
import {handleSignin} from './controllers/signin.js';
import handleProfileGet from './controllers/profile.js'
import {handleImage, handleApiCall} from './controllers/image.js'


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
// const PORT = 3000; // for fixed port
const PORT = process.env.PORT // for dynamic port assignment by PaaS server (env variable)


// show the table users in DB before operations
// pgDatabase.select('*').from('users').then(console.log)

// use middleware to parse the json format body in request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// API endpoints:

//root route
// only for testing: response all users' profile (as a list of objects) for checking
// app.get('/', (req, res) => {
//     pgDatabase.select('*')
//         .from('users')
//         .then(users => {
//             res.json(users);
//         })
// })

app.get('/', (req, res) => {
    res.json('the server is working')
})


// signin route
app.post('/signin', (req, res) => { handleSignin(req, res, bcrypt, pgDatabase) })

// register route (clean form)
app.post('/register', handleRegister(bcrypt, pgDatabase))

// profile route
// use path.../:parameter to extract the varying parameter value in the path
app.get('/profile/:id', (req, res) => { handleProfileGet(req, res, pgDatabase) })

// imageurl
// the route that accesses the clarifai public api
app.post('/imageurl', (req, res) => { handleApiCall(req, res) })

// image route
// updates the entries in user's profile after detection succeed.
// responds the updated entries (to FE App)
app.put('/image', (req, res) => { handleImage(req, res, pgDatabase) })

// listen on the port set in the env varaible by the remote server, run the callback for testing
app.listen(PORT, () => {
    console.log(`the server is running on local: ${PORT}`);
});















