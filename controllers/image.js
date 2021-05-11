import Clarifai from 'clarifai';

// initialize the client for image recognition API
const app = new Clarifai.App({
    apiKey: 'dec2654d72a643e29103a7a33dd7eb4b'
});


export const handleApiCall = (req, res) => {
    
    // request to the clarifi api
    app.models.predict(Clarifai.FACE_DETECT_MODEL, req.body.input)
    .then(apiResponse => {
        res.json(apiResponse)
    })
    .catch(err => res.status(400).json('unable to access API'))
}


export const handleImage = (req, res, pgDatabase) => {
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
