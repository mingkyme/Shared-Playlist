const express = require('express');
const stream = require('youtube-audio-stream');
var app = express();
var list = new Array();
app.use(express.json());
app.use(express.static('public'));
app.set("etag", false);
app.get('/audio',function(req,res){
    if(list.length>0){
        var requestUrl = list[0];
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
app.get('/api/song-list',function(req,res){
    res.send(list);
});
app.post('/api/add-song',function(req,res){
    list.push(req.body.url);
    res.sendStatus(200);
});
app.listen(5123);