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

// use middleware to parse the json format body in request
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors());

// API endpoints:
// route only for testing: response all users' profile (as a list of objects) for checking
app.get('/', (req, res) => {
    pgDatabase.select('*')
        .from('users')
        .then(users => {
            res.json(users);
        })
})

// signin route
app.post('/signin', (req, res) => {
    const { email, password } = req.body;

    // check if the signin info matches a user's login information in the database
    pgDatabase.select('email', 'hash')
        .from('login')
        .where('email', '=', email)
        .then(data => {
            // when provided email exists in database's login table
            if (data.length) {
                // compare the provided password with the hash in database
                const isValid = bcrypt.compareSync(password, data[0].hash);
                if (isValid) {
                    // always return the database promise within then()
                    return pgDatabase.select('*')
                        .from('users')
                        .where('email', '=', email)
                        .then(user => { res.json(user[0]) })
                        .catch(err => { res.status(400).json('unable to access user profile')})
                }
                // password not match
                else {
                    res.status(400).json('wrong credentials!')
                }
            }
            // when provided email doesn't exist in database's login table
            else {
                res.status(400).json('wrong credentials!');
            }
        })
        .catch(err => { res.status(400).json('system or database failed.') })
})

// register route
app.post('/register', (req, res) => {
    // deconstruct the body object in request
    const { name, email, password } = req.body;

    // hash/encrypt the password into the hash value (enrypted password)
    const hash = bcrypt.hashSync(password);

    // register a user in the DB (users, login) with infromation from request
    // respond with the newly registered user profile to FE App
    // use transaction to bond the both "insert" action
    pgDatabase.transaction(trx => {
        // insert the info into login table using trx (transaction)
        trx.insert({
            email: email,
            hash: hash
        })
            .into('login')
            .returning('email')
            // insert the user info into users table also using trx
            .then(loginEmail => {
                return trx.insert({ // Q: do I need to return trx.... here? what the purpose 
                    // A: always returns to let database know about the status
                    name: name,
                    email: loginEmail[0],
                    joined: new Date()
                })
                    .into('users')
                    .returning('*')
                    .then(user => {
                        res.json(user[0]);
                    })
            })
            .then(result => console.log(result))
            .then(trx.commit)
            .catch(trx.rollback) // rollback to the states that all queries were not exeuted

    })
        .catch(err => res.status(400).json("register failed"))
    // end transaction

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
        .catch(err => { res.status(400).json('unable to update entries') })
})

// listen on the local port 3000, run the callback for testing
app.listen(3000, () => {
    console.log('the server is running on local:3000');
});















