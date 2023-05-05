const { google } = require('googleapis');
const express = require('express')
const OAuth2Data = require('./google_key.json')
var queryString = require('querystring');
const { default: axios } = require("axios");

const app = express()

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = 'https://autentykacja.onrender.com/auth/google/callback'
const CLIENT_ID_FB='547465797537123'
const FB_SECRET='7ea001348d6e654bd21c62cc5d5678f7'
const oAuth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URL)
var authed = false;
var loggedBy=''
app.get('/', (req, res) => {
    if(authed)
    {
        if (loggedBy==='google')
        {
            var oauth2=google.oauth2({auth: oAuth2Client, version:'v2'})

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
                res.write('<a href="/googlelogout">wyloguj sie</a>')
                res.end('Logged in: '.concat(loggedUser,'   <img src="',result.data.picture,'"height="23" width="23">'))

            })
        }else if (loggedBy==='github')
        {
            res.write('<a href="/googlelogout">wyloguj sie</a>')
            res.end('logged by github')
        }else if (loggedBy==='facebook')
        {
            res.write('<a href="/googlelogout">wyloguj sie</a>')
            res.end('logged by facebook')
        }


    }else
    {
        res.send('<a href="/google">zaloguj przez google</a><br/>' +
            '<a href="/github">zaloguj przez github</a><br/>'+
            '<a href="/facebook">zaloguj przez facebook</a>')

    }
})
// var auth2 = gapi.auth2.getAuthInstance();
// auth2.signOut().then(function () {
// });
app.get('/googlelogout', (req, res) => {
    authed=false
    loggedBy=''

    res.redirect('/');


})
app.get('/google', (req, res) => {

    console.log(REDIRECT_URL)
    if (!authed) {
        // Generate an OAuth URL and redirect there
        const url = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile'
        });
        console.log(url)
        res.redirect(url);
    } else {
        res.redirect('/');

        // res.send('Logged in')
    }
})


app.get('/github', (req, res) => {

    console.log(REDIRECT_URL)
    if (!authed) {
        // Generate an OAuth URL and redirect there
        res.redirect(`https://github.com/login/oauth/authorize?client_id=4f97a28ec1431c6b9fff&prompt=consent`);
    } else {
        res.redirect('/');

        // res.send('Logged in')
    }
})
app.get('/facebook', (req, res) => {

    const stringifiedParams = queryString.stringify({
        client_id:CLIENT_ID_FB,
        redirect_uri: 'https://autentykacja.onrender.com/auth/facebook/callback/',
        scope: ['email', 'user_friends'].join(','), // comma seperated string
        response_type: 'code',
        auth_type: 'rerequest',
        display: 'popup',
    });

    const facebookLoginUrl = `https://www.facebook.com/v4.0/dialog/oauth?${stringifiedParams}`;
    res.redirect(facebookLoginUrl);
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
                loggedBy='google'

                res.redirect('/')
            }
        });
    }
});

app.get('/auth/github/callback', function (req, res) {

    axios.post("https://github.com/login/oauth/access_token", {
        client_id: "4f97a28ec1431c6b9fff",
        client_secret: "33b41e29a4542ce2df05282693290be2b578a40a",
        code: req.query.code
    }, {
        headers: {
            Accept: "application/json"
        }
    }).then((result) => {
        // console.log(result.data.access_token)
        // res.send("you are authorized " + result.data.access_token)
        authed=true
        loggedBy='github'
    }).catch((err) => {
        console.log(err);
    })

    res.redirect('/')

});


app.get('/auth/facebook/callback', async (req, res) =>{

    try {
        const authCode = req.query.code;

        // Build up the URL for the API request. `client_id`, `client_secret`,
        // `code`, **and** `redirect_uri` are all required. And `redirect_uri`
        // must match the `redirect_uri` in the dialog URL from Route 1.
        const accessTokenUrl = 'https://graph.facebook.com/v6.0/oauth/access_token?' +
            `client_id=${CLIENT_ID_FB}&` +
            `client_secret=${FB_SECRET}&` +
            `redirect_uri=${encodeURIComponent('https://autentykacja.onrender.com/auth/facebook/callback')}&` +
            `code=${encodeURIComponent(authCode)}`;

        // Make an API request to exchange `authCode` for an access token
        const accessToken = await axios.get(accessTokenUrl).then(res => res.data['access_token']);
        // Store the token in memory for now. Later we'll store it in the database.
        console.log('Access token is', accessToken);
        authed=true
        loggedBy='facebook'
        res.redirect(`/`);
    } catch (err) {
        console.log(err);
        return res.status(500).json({ message: err.response.data || err.message });
    }

});

const port = process.env.port || 3000
app.listen(port, () => console.log(`Server running at ${port}`));