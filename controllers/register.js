export const handleRegister = (req, res, bcrypt, pgDatabase) => {
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

}