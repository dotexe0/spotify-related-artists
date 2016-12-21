var unirest = require('unirest');
var express = require('express');
var events = require('events');

//   client_id: 'fc5abe67dc6c4af2bf2f917a50f8b361',
//   client_secret: 'd618fdef87c54bbf843d03523ca6415a'


var getFromApi = function(endpoint, args) {
  var emitter = new events.EventEmitter();
  unirest.get('https://api.spotify.com/v1/' + endpoint)
         .qs(args)
         .end(function(response) {
            if(response.ok) {
              emitter.emit('end', response.body);
            } else {
              emitter.emit('error', response.code);
            }
         });
         return emitter;
};

var app = express();
app.use(express.static('public'));

app.get('/search/:name', function(req, res) {
  var searchReq = getFromApi('search', {
    q: req.params.name,
    limit: 1,
    type: 'artist'
  });

  searchReq.on('end', function(item) {
    var artist = item.artists.items[0];
    console.log('artist :', artist);

    var artist_id = item.artists.items[0].id;
    unirest.get('https://api.spotify.com/v1/artists/'+ artist_id + '/related-artists')
           .end(function(item) {
             if (item.ok) {
               console.log('related artists :', item.body.artists);
              //  res.json(artist);
               res.json(item.body.artists);
             } else {
               emitter.emit('error', item.code)
             }
         });
        //  res.json(artist);
      });

  searchReq.on('error', function(code) {
    res.sendStatus(code);
  });
});

app.listen(process.env.PORT || 8080);
console.log("Listening on port 8080...");
