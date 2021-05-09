const handleImage = (req, res, pgDatabase) => {
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
}

export default handleImage;