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
            console.log(data)
            if(!data["Error"]) {
                res.render('results', {artists: data.artists.items, error: '', title: query});
                console.log(data.artists.items)
             } else {
                console.log(response);
                // res.render('results', {data:{}, error: data["Error"]});
            }
        };
    });
    
    // Future, for getting more about a specific artist. 
    // const aristsIDs = '0oSGxfWSnnOXhD2fKuz2Gy%2C3dBVyJ7JuOMt4GE9607Qin'
    // const options = {
    //     url: `https://api.spotify.com/v1/artists?ids=${aristsIDs}`,
    //     headers: {
    //         "Accept": "application/json",
    //         "Content-Type": "application/json",
    //         "Authorization": oAuthToken
    //     }
    // };

    // request(options, (error, response, body) => {
    //     console.log(response.statusCode)
    //     if(!error && response.statusCode == 200) {
    //         const data = JSON.parse(body);
    //         if(!data["Error"]) {
    //             // res.render('results', {data: data, error: ''});
    //             console.log(data)
    //          } else {
    //             console.log(data["Error"]);
    //             // res.render('results', {data:{}, error: data["Error"]});
    //         }
    //     };
    // });
});

//Start server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});