const { google } = require('googleapis');
const express = require('express')
var queryString = require('querystring');
const { default: axios } = require("axios");

const app = express()
app.set('view engine', 'ejs')
const path = require("path")
const bodyParser = require('body-parser'); // Middleware

app.use(bodyParser.urlencoded({ extended: false }));

const publicDir = path.join(__dirname, './public')

app.use(express.static(publicDir))



// Do not expose your Neon credentials to the browser
// .env

// app.js
const postgres = require('postgres');
require('dotenv').config();
let alert = require('alert');

const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID } = process.env;
const URL = `postgres://${PGUSER}:${PGPASSWORD}@${PGHOST}/${PGDATABASE}?options=project%3D${ENDPOINT_ID}`;

const sql = postgres(URL, { ssl: 'require' });




var authed = false;
var name=''


 async function getUsers (request, response){
     console.log('Pobieram dane ...');
     var dbRes = await sql`SELECT * FROM Users`
     // response.write(dbRes)
     console.log(dbRes)
     alert("connected to dataBase")
     return dbRes
 }
async function updateUsers (name) {
    var dbRes = await sql`SELECT * FROM Users where name=${name}`
    console.log(dbRes[0].counter+1)
    alert("connected to dataBase")
    if (dbRes.length > 0) {
        await sql`Update Users set counter=${dbRes[0].counter+1} where name=${name} `
    } else {
        await sql`INSERT INTO Users(name,counter) values(${name},1)`
    }
}

app.get('/', async (req, res) => {
    if (authed) {
        // res.writeHead(200, {'Content-Type': 'text/html'});
        //
        // // await getUsers(req, res)
        //
        var data=await getUsers(req, res);

        // res.end('<a href="/logout">WYLOGUJ<a/>');
        dataArray=[]
        for(var i =0;i<data.length;i++)
        {
            dataArray.push({name:data[i].name,counter:data[i].counter,id:data[i].id})
        }

        res.render('../views/info',{username:name,data:dataArray})



    } else {
        res.render('../views/login')

    }
})
// var auth2 = gapi.auth2.getAuthInstance();
// auth2.signOut().then(function () {
// });

app.post('/login',  async (req, res) => {

    authed=true
    await updateUsers(req.body.name)
    name=req.body.name
    res.redirect("/")

})
app.get('/logout',  (req, res) => {

    authed=false
    name=''
    res.redirect("/")

})
const port = process.env.port || 3000
app.listen(port, () => console.log(`Server running at ${port}`));