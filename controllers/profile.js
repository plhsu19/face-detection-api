const handleProfileGet = (req, res, pgDatabase) => {
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
}

export default handleProfileGet;