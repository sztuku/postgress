const { google } = require('googleapis');
const express = require('express')
const OAuth2Data = require('./google_key.json')
var queryString = require('querystring');
const { default: axios } = require("axios");

const app = express()

const CLIENT_ID = OAuth2Data.web.client_id;
const CLIENT_SECRET = OAuth2Data.web.client_secret;
const REDIRECT_URL = 'https://autentykacja.onrender.com/auth/google/callback'

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
        }


    }else
    {
        res.send('<a href="/google">zaloguj przez google</a><br/>' +
            '<a href="/github">zaloguj przez github</a>')

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
        res.redirect(`https://github.com/login/oauth/authorize?client_id=4f97a28ec1431c6b9fff`);
    } else {
        res.redirect('/');

        // res.send('Logged in')
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

const port = process.env.port || 3000
app.listen(port, () => console.log(`Server running at ${port}`));