import express from 'express'
import bcrypt from 'bcrypt-nodejs'
import cors from 'cors';
import knex from 'knex';

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

// temporal database object for testing
const tempDatabase = {
    users: [
        {
            id: '125',
            name: 'Henrik',
            email: 'henrik@gmail.com',
            password: '123',
            entries: 0,
            joined: new Date() // create a date object with the time/date when executed
        },
        {
            id: '126',
            name: 'Mario',
            email: 'mario@gmail.com',
            password: 'sugar',
            entries: 0,
            joined: new Date()
        }
    ]
}

// use middleware to parse the json format body in request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// API endpoints:
// response all users' profile (as a list of objects) for checking
app.get('/', (req, res) => {
    res.send(tempDatabase.users)
})

// signin route
app.post('/signin', (req, res) => {

    // Load hash from your password DB, and compare the hash with the provieded uninstall password
    // bcrypt.compare("redwine", '$2a$10$4mwt/YP3IMIMRLmMZEn25eJ5xemDfZqSQEGeN/x4JIuOL/PJdSY0K', function (err, res) {
    //     // res = true
    //     console.log('the first guess:', res )
    // });
    // bcrypt.compare("whitewine", '$2a$10$4mwt/YP3IMIMRLmMZEn25eJ5xemDfZqSQEGeN/x4JIuOL/PJdSY0K', function (err, res) {
    //     // res = false
    //     console.log('the second guess:', res )

    // });

    // check if the signin info matches a user profile in the database
    if (req.body.email === tempDatabase.users[0].email &&
        req.body.password === tempDatabase.users[0].password) {
        res.json(tempDatabase.users[0]);
    }
    // respond fail code if no match is found
    else res.status(400).json("signin failed!");
})

// register route
app.post('/register', (req, res) => {
    // deconstruct the body object in request
    const { name, email, password } = req.body;

    // hash/encrypt the password into the hash value (enrypted password)
    bcrypt.hash(password, null, null, function (err, hash) {
        console.log(hash);
        // store the hashed password into the user's profile in database
    });

    // register a user in the DB with infromation from request
    // respond the newly registered user profile to FE
    pgDatabase('users')
        .returning('*')
        .insert({
            name: name,
            email: email,
            joined: new Date()
        }).then(user => {
            res.json(user[0])
        }).catch(err => { res.status(400).json('Register Failed') })
    // }).catch(err => { res.status(400).json(err)})

})


// profile route
// use path.../:parameter to extract the varying parameter value in the path
app.get('/profile/:id', (req, res) => {
    const { id } = req.params; // the varaible id in params is a string for "user's id"
    // const id = req.params.id;

    // select the rows in table whose field id equals id
    pgDatabase.select('*').from('users').where({ id: id })
        .then(
            user => {
                if (user.length) res.json(user[0]);
                else res.json('No user found')
            })
        .catch(err => { res.status(400).json('error getting user profile') })
})

// image route
// update/increase the entries in user's profile after detection succeed.
// response with the updated entries (to FE)
app.put('/image', (req, res) => {
    const { id } = req.body;

    pgDatabase('users').where('id', '=', id)
    .increment('entries', 1)
    .returning('entries')
    .then(
        entries => {
        if (entries.length) res.json(entries[0]);
        else res.json('user not found')
    })
    .catch(err => {res.status(400).json('unable to update entries')})
})

// listen on the local port 3000, run the callback for testing
app.listen(3000, () => {
    console.log('the server is running on local:3000');
});















