import express from 'express'

const app = express();

// listen on the local port 3000, run the callback for testing
app.listen(3000, () => {
    console.log('the server is running on local:3000');
});

app.get('/', (req, res) => {
    res.send('the server is working.')
} )

/* end-point lists for API
path --> method res = responses
/ --> GET res = the server is working
/signin --> POST res = success/fail (use POST to send the signin information in the load data but not in the path)
/register --> POST res = user (respond with the new user that just registered)
/profile/:userId -> GET res = user (Let the homepage access user's profile information for preparing customized homepage; with an optional parameter
userId for each)
/image --? PUT res = user (to update user's image detection count in the user's profile)
*/