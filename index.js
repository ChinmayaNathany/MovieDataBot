const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const API_KEY = require('./apiKey');

const server = express();
server.use(bodyParser.urlencoded({
    extended: true
}));

server.use(bodyParser.json());

server.post('/get-movie-details', (req, res) => {

    const movieToSearch = req.body.queryResult.parameters.movie ? req.body.queryResult.parameters.movie : 'The Godfather';
    const reqUrl = encodeURI(`http://www.omdbapi.com/?t=${movieToSearch}&apikey=${API_KEY}`);
    http.get(reqUrl, (responseFromAPI) => {
        let completeResponse = '';
        responseFromAPI.on('data', (chunk) => {
            completeResponse += chunk;
        });
        responseFromAPI.on('end', () => {
            const movie = JSON.parse(completeResponse);
            let dataToSend = movieToSearch === 'The Godfather' ? `I don't have the required info on that. Here's some info on 'The Godfather' instead.\n` : '';
            dataToSend += `${movie.Title} is a ${movie.Actors} starer ${movie.Genre} movie, released in ${movie.Year}. It was directed by ${movie.Director}`;

            res.status(200);

            return res.json({
                fulfillmentText: dataToSend,
                fulfillmentMessages:[
                    {
                        "card": {
                            "title": movie.title,
                            "subtitle": movie.Country,
                            "imageUri": movie.Poster,
                            "buttons": [
                                {
                                "text": "Click Here for Movie information",
                                "postback": encodeURI(`http://www.google.com/search?q=${movieToSearch}`),
                                }
                            ]

                        }
                    }

                ],
payload: {
    "google": {
        "expectUserResponse": true,
        "richResponse": {
            "items": [
                {
                    "simpleResponse": {
                        "textToSpeech": dataToSend
                    }
                }
            ]
        }
    },
    "facebook": {
        "text": dataToSend
    },
    "slack": {
        "text": dataToSend
    }
},
source: 'get-movie-details'
            });
        });
    }, (error) => {
        res.status(200);
        return res.json({
            fulfillmentText: 'Something went wrong!',
            source: 'get-movie-details'
        });
    });
});

server.listen((process.env.PORT || 8800), () => {
    console.log('Server is up and running in port${process.env.PORT || 8800}');
});