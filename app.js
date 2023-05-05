const { google } = require('googleapis');
const express = require('express')
const OAuth2Data = require('./google_key.json')

const app = express()

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = 'https://autentykacja.onrender.com/auth/google/callback'

const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;

app.get('/', (req, res) => {
    if (!authed) {
        // Generate an OAuth URL and redirect there
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile'
        });
        console.log(url)
        res.redirect(url);
    } else {
        var oauth2=google.oauth2({auth: oAuth2Client, version:'v2'})
        console.log("siema")
        oauth2.userinfo.v2.me.get(function(err,result)
        {
            let loggedUser;
            if (err) {
                console.log("blad")
                console.log(err)
            } else {
                loggedUser = result.data.name
                console.log(loggedUser)
            }
            res.send('Logged in: '.concat(loggedUser,'<img src="',result.data.picture,'"height="23" width="23">'))
        })
//         res.send('Logged in')
    }
})

app.get('/auth/google/callback', function (req, res) {
    const code = req.query.code
    console.log("Adad")
    // var profile = oAuth2Client.currentUser.get().getBasicProfile();
    // res.send('Logged in: '.concat(profile.getName(),'<img src="',profile.getImageUrl(),'"height="23" width="23">'))

    if (code) {
        // Get an access token based on our OAuth code
        oAuth2Client.getToken(code, function (err, tokens) {
            if (err) {
                console.log('Error authenticating')
                console.log(err);
            } else {
                console.log('Successfully authenticated');
                oAuth2Client.setCredentials(tokens);
                authed = true;
                res.redirect('/')
            }
        });
    }
});

const port = process.env.port || 3000
app.listen(port, () => console.log(`Server running at ${port}`));
