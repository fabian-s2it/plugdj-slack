var express = require('express');
 
var app = express();
var port = process.env.PORT || 3000;


console.log('Conectando no mongodb.');

var mongoose = require('mongoose');
mongoose.connect(process.env.MONGOLAB_URI);
var db = mongoose.connection;

db.on('error', function (err) {
	console.log('connection error', err);
});
db.once('open', function () {
	console.log('Conectado no mongodb');
});

var Schema = mongoose.Schema;
	var musicSchema = new Schema({
		author : String,
		title : String,
		username : String,
		youtube : String
	});

var Music = mongoose.model('Music', musicSchema);

 
app.listen(port, function () {
  console.log('Slack bot listening on port ' + port);
});


var http = require("http");
setInterval(function() {
    http.get("http://plugdj-slack.herokuapp.com");
}, 300000); // every 5 minutes (300000)

var PlugAPI = require('plugapi');

var bot = new PlugAPI({
    email: process.env.PLUGDJ_LOGIN,
    password: process.env.PLUGDJ_PASS
});

bot.connect('-3089557506968759142'); // The part after https://plug.dj

bot.on('roomJoin', function(room) {
    console.log("Joined " + room);
});

bot.on('advance', function(data) {

	var request = require('request');

	console.log('DJ *'+ data.currentDJ.username +'* is now playing: *'+data.media.author + '* - *' + data.media.title + '*');

	var uri = 'https://hooks.slack.com/services/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';

	bot_text = 'DJ '+ data.currentDJ.username +' is now playing: <https://www.youtube.com/watch?v=' + data.media.cid + '|' +data.media.author + ' - ' + data.media.title + '>';
	bot_text_novid = 'DJ *'+ data.currentDJ.username +'* is now playing: *'+data.media.author + '* - *' + data.media.title + '*';

	var plugmusic = new Music({
		author: data.media.author,
		title: data.media.title,
		username: data.currentDJ.username,
		youtube: data.media.cid
	});

	plugmusic.save(function (err, data) {
	if (err) {
		console.log(err);
	} 
	else {
		console.log('Saved : ', data );
	} 
	});


	var botPayload = {
    	text : bot_text_novid,
    	username: 'PlugDJ Bot',
    	icon_emoji: ':notes:'
  	};

    request({
        uri: uri,
        method: 'POST',
        body: JSON.stringify(botPayload)
    }, function (error, response, body) {
    	if (error) {
            return 'error';
        }
	}
	);

});