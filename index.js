var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var yas = require('youtube-audio-stream');
var fs = require('fs');
let key = require('./key.json').apiKey;
var axios = require('axios').default;
server.listen(5123, function() {
    console.log('Shared-Playlist Server on 5123');
});


var playlist = new Array();

let playIndex = 0;
let playTime = 0;
let users = new Array();
io.on('connect',function(socket){
    users.push(socket);
    socket.on('init',function(){
        socket.emit('init',playIndex,playTime);
    });
    socket.on('current-track',function(index,time){
        playIndex = index;
        playTime = time;
    });
    socket.on('disconnect',function(){
        users.splice(users.findIndex(x => x == socket),1);
    });
});
setInterval(function(){
    if(users[0]){
        users[0].emit('request');
    }
},300);

app.use(express.json());
app.get('/',function(req,res){
    res.sendFile(__dirname+'/public/index.html');
});
app.get('/player',function(req,res){
    res.sendFile(__dirname+'/public/player.html');
});

app.get('/music',function(req,res){
    let index = req.query.index;
    if(playlist.length > index){
        var requestUrl = 'http://youtube.com/watch?v=' + playlist[index].vid;
        yas(requestUrl).pipe(res);
    }else{
        res.sendStatus(404);
    }
});

let checkYoutubeUrlRegExp = new RegExp(/(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-_]+)/);
let getVideoIdRegExp = new RegExp(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
app.post('/api/song',function(req,res){
    let url = req.body.url;
    if(checkYoutubeUrlRegExp.test(url)){
        let vid = getVideoIdRegExp.exec(req.body.url)[7];
        let titleAPI = "https://www.googleapis.com/youtube/v3/videos?id="+vid+"&key="+key+"%20&part=snippet";
        axios.get(titleAPI)
        .then(function(response){
            playlist.push({'vid':vid,'title':response.data.items[0].snippet.title});
            res.sendStatus(200);
        });
    }else{
        res.sendStatus(500);
    }
});