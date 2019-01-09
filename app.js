//Bring in required sources.
const express = require('express');
const request = require('request');
const path = require('path');
const querystring = require('querystring');
const cookieParser = require('cookie-parser');

//Authentication IDs
const client_id = process.env.SPOTIFY_CLIENT_ID; // Your client id
const client_secret = process.env.SPOTIFY_CLIENT_SECRET; // Your secret
const redirect_uri = 'http://localhost:3000/callback/'; // Your redirect uri

//Init app
const app = express();

//set views path, load pug as view engine
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

//Add routes
app.get('/', (req, res) => {
    res.render('login_prompt');  
});

//Add routes
app.get('/search/:accessToken', (req, res) => {
    const accessToken = req.params.accessToken;
    res.render('search', {accessToken: accessToken});
});

app.get('/login', function(req, res) {
  console.log(client_id, redirect_uri);
  res.redirect('https://accounts.spotify.com/authorize?' +
    querystring.stringify({
      response_type: 'code',
      client_id: client_id,
      scope: 'user-read-private user-read-email',
      redirect_uri
    }))
})

app.get('/callback', function(req, res) {
  let code = req.query.code || null
  let authOptions = {
    url: 'https://accounts.spotify.com/api/token',
    form: {
      code: code,
      redirect_uri,
      grant_type: 'authorization_code'
    },
    headers: {
      'Authorization': 'Basic ' + (new Buffer(
        client_id + ':' + client_secret
      ).toString('base64'))
    },
    json: true
  }
  request.post(authOptions, function(error, response, body) {
    var access_token = body.access_token

    res.redirect(`/search/${access_token}`)
  })
})


//Route to search for artists.
app.get('/results/access=:accessToken', (req, res) => {
    const query = req.query.search;
    const accessToken = `Bearer ${req.params.accessToken}`;

    //This url should return JSON containing the artist ID, and we can use that to search for more detailed data on the artist. 
    const artistRequestUrl = `https://api.spotify.com/v1/search?q=${query}&type=artist`
    
    const artistQuery = {
        url: artistRequestUrl,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": accessToken
        }
    };

    request(artistQuery, (error, response, body) => {
        if(!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            if(!data["Error"]) {
                res.render('results', {
                    artists: data.artists.items, 
                    error: '', 
                    title: query, 
                    accessToken: accessToken
                });
             } else {
                console.log(response);
                // res.render('results', {data:{}, error: data["Error"]});
            }
        };
    });
});

//Route to show artist details
app.get('/artist/:artistid/access=:accessToken', (req, res) => {
    const artistID = req.params.artistid;
    const accessToken = `${req.params.accessToken}`;

    const artistInfoQuery = {
        url: `https://api.spotify.com/v1/artists?ids=${artistID}`,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": accessToken
        }
    };

    request(artistInfoQuery, (error, response, body) => {
        if(!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            if(!data["Error"]) {
                const artistData = data.artists[0]
                const artistImg = artistData.images[0];
                if(!artistImg) {
                    artistImgURL = 'https://dazedimg-dazedgroup.netdna-ssl.com/786/azure/dazed-prod/1120/0/1120288.jpg'
                } else {
                    artistImgURL = artistImg.url;
                }
                res.render('artist_details', {
                    artist: artistData, 
                    error: '', 
                    img: artistImgURL, 
                    accessToken: accessToken
                });
            } else {
                console.log(data["Error"]);
                // res.render('results', {data:{}, error: data["Error"]});
            }
        };
    });
});

//Get albums for artist route
app.get('/albums/:artistid/access=:accessToken', (req, res) => {
    const artistID = req.params.artistid;
    const accessToken = req.params.accessToken;

    const albumsQuery = {
        url: `https://api.spotify.com/v1/artists/${artistID}/albums`,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": accessToken
        }
    };

    request(albumsQuery, (error, response, body) => {
        if(!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            if(!data["Error"]) {
                const albumData= data.items;
                res.render('album_list', {
                    albumData: albumData, 
                    error: ''
                });
            } else {
                console.log(data["Error"]);
                // res.render('results', {data:{}, error: data["Error"]});
            }
        };
    });
});

//Add user profile route
app.get('/myProfile/access=:accessToken', (req, res) => {
    const accessToken = `Bearer ${req.params.accessToken}`;
    console.log(accessToken)

    const userQuery = {
        url: `https://api.spotify.com/v1/me`,
        headers: {
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": accessToken
        }
    };

    request(userQuery, (error, response, body) => {
        if(!error && response.statusCode == 200) {
            const data = JSON.parse(body);
            console.log(data)
            res.send('Your Profile!')
            // if(!data["Error"]) {
            //     const albumData= data.items;
            //     res.render('album_list', {
            //         albumData: albumData, 
            //         error: ''
            //     });
            // } else {
            //     console.log(data["Error"]);
            //     // res.render('results', {data:{}, error: data["Error"]});
            // }
        };
    });

});

//Start server
app.listen(3000, () => {
    console.log('Server started on port 3000');
});