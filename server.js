import express from 'express'

const app = express();

// temporal database object for testing
const tempDatabase = {
    users: [
        {
            id: '125',
            name: 'Henrik',
            email: 'henrik@gmail.com',
            password: 'phantom',
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
app.use(express.urlencoded({extended:false}));

// API endpoints:

// response all users' profile (as a list of objects) for checking
app.get('/', (req, res) => {
    res.send(tempDatabase.users)
} )

// signin route
app.post('/signin', (req, res) => {
    // check if the signin info matches a user profile in the database
    if (req.body.email === tempDatabase.users[0].email &&
        req.body.password === tempDatabase.users[0].password ) {
            res.json("success");
    } 
    // respond fail code if no match is found
    else res.status(400).json("fail");
})

// register route
app.post('/register', (req, res) => {
    // deconstruct the body object in request
    const {name, email, password} = req.body;
    
    // create a new user profile according to the information provided in the database
    tempDatabase.users.push({
        id: '127',
        name: name,
        email: email,
        password: password,
        entries: 0,
        joined: new Date() 
    })
    // respond the newly registered user profile
    res.json(tempDatabase.users[tempDatabase.users.length - 1])
})


// profile route
// use .../:parameter to extract the varying parameter value in the path
app.get('/profile/:userId', (req, res) => {
    const id = req.params.userId; // the varaible userId in params is a string
    let found = false;
    tempDatabase.users.forEach(user => {
        if (id === user.id) {
            found = true;
            res.json(user);
        }
    })
    if (!found) res.status(400).json("user not found");
})

// image route
app.put('/image', (req, res) => {
    console.log(req.body);
    const {id} = req.body;
    let found = false;

    tempDatabase.users.forEach(user => {
        if (id === user.id) {
            found = true;
            user.entries += 1;
            res.json(user.entries);
        }
    })
    if (!found) res.status(400).json("user not found");
})


// listen on the local port 3000, run the callback for testing
app.listen(3000, () => {
    console.log('the server is running on local:3000');
});















