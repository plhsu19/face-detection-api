export const handleSignin = (req, res, bcrypt, pgDatabase) => {
    const { email, password } = req.body;
    
    if ( !email || !password) {
        return res.status(400).json("empty credentials")
    }

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
                        .catch(err => { res.status(400).json('unable to access user profile') })
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
}