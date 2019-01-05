//Bring in required sources.
const express = require('express');
const request = require('request');
const path = require('path');
const oAuthToken = require('./auth/spotifyTokens.js')


//Init app
const app = express();

//set views path, load pug as view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Add routes
app.get('/', (req, res) => {
    res.render('search');
});

//Route to search for artists.
app.get('/results', (req, res) => {
    const query = req.query.search;

    //This url should return JSON containing the artist ID, and we can use that to search for more detailed data on the artist. 
    const artistRequestUrl = `https://api.spotify.com/v1/search?q=${query}&type=artist`
    
    const artistQuery = {
        url: artistRequestUrl,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": oAuthToken
        }
    };

    request(artistQuery, (error, response, body) => {
        console.log(response.statusCode)
        if(!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            if(!data["Error"]) {
                res.render('results', {artists: data.artists.items, error: '', title: query});
             } else {
                console.log(response);
                // res.render('results', {data:{}, error: data["Error"]});
            }
        };
    });
});

//Route to show artist details
app.get('/artist/:artistid', (req, res) => {
    const artistID = req.params.artistid;

    const artistInfoQuery = {
        url: `https://api.spotify.com/v1/artists?ids=${artistID}`,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": oAuthToken
        }
    };

    request(artistInfoQuery, (error, response, body) => {
        if(!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            // console.log(data)
            if(!data["Error"]) {
                const artistData = data.artists[0]
                console.log(artistData)
                res.render('artist_details', {artist: artistData, error: ''});
            } else {
                console.log(data["Error"]);
                // res.render('results', {data:{}, error: data["Error"]});
            }
        };
    });
});

//Authentication token request route.
// app.post('', () => {

// })

//Start server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});