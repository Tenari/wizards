var UUID = require('node-uuid')
  , fs = require('fs')
  , three = require('./game')
;
module.exports = function(sio){
  sio.sockets.on('connection', function (client) {
    client.userid = UUID();
    var gameData = {
      uuid: client.userid,
      path: '/data/app.json'
    }
    , clientGameData = JSON.parse(JSON.stringify(gameData))
    , gameInstance
    ;
    gameData.client = client;
    gameInstance = three(gameData)
    client.emit('startGame',  clientGameData);
    console.log('- socket.io:: player ' + client.userid + ' connected');
    client.on('disconnect', function () {
      console.log('- socket.io:: client disconnected ' + client.userid );
    });
    client.on('events', function(eventList){
      gameInstance.applyInput(eventList, gameInstance.gid, gameInstance.pid); 
    })
  });
}
