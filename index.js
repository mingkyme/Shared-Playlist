const express = require('express');
const stream = require('youtube-audio-stream');
const axios = require('axios').default;
const key = require('./key.json').apiKey;
var app = express();
var list = new Array();
app.use(express.json());
app.set("etag", false);
app.get('/audio',function(req,res){
    if(list.length > 0){
        var requestUrl = 'http://youtube.com/watch?v=' + list[0].vid;
        list.shift();
        try {
            stream(requestUrl).pipe(res);
        } catch (exception) {
            res.status(500).send(exception);
        }
    }else{
        res.sendStatus(404);
    }
});
app.get('/',function(req,res){
    res.sendFile(__dirname+'/public/index.html');
});
app.get('/player',function(req,res){
    res.sendFile(__dirname+'/public/player.html');
});
app.get('/api/song-list',function(req,res){
    res.send(list);
});


let checkYoutubeUrlRegExp = new RegExp(/(?:https?:\/\/)?(?:www\.)?youtu\.?be(?:\.com)?\/?.*(?:watch|embed)?(?:.*v=|v\/|\/)([\w-_]+)/);
let getVideoIdRegExp = new RegExp(/^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/);
app.post('/api/add-song',function(req,res){
    let url = req.body.url;
    if(checkYoutubeUrlRegExp.test(url)){
        let vid = getVideoIdRegExp.exec(req.body.url)[7];
        let titleAPI = "https://www.googleapis.com/youtube/v3/videos?id="+vid+"&key="+key+"%20&part=snippet";
        axios.get(titleAPI)
        .then(function(response){
            list.push({'vid':vid,'title':response.data.items[0].snippet.title});
            res.sendStatus(200);
        });
    }else{
        res.sendStatus(500);
    }
});
app.listen(5123);
