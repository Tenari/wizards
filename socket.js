var UUID = require('node-uuid')
  , gameInstance = {
      move_diff: 0
    }
;
module.exports = function(sio){
  sio.sockets.on('connection', function (client) {
    var game = UUID();
    client.userid = UUID();
    client.emit('startGame', { uuid: client.userid, path: '/data/app.json', game: game } );
    setInterval(function(){
      if (gameInstance.move_diff == 0) return;
      client.emit('state change', {diff: gameInstance.move_diff}, function(){
        gameInstance.move_diff = 0;
      });
    }, 111);
    console.log('- socket.io:: player ' + client.userid + ' connected');
    client.on('disconnect', function () {
      console.log('- socket.io:: client disconnected ' + client.userid );
    });
    client.on('events', function(data){
      /*var typelist = [];
      for (var i =0; i< data.list.length; i++) {
        typelist.push(data.list[i].type)
      }
      console.log(typelist);*/
      // parse out move commands
      var move_total = 0;
      for (var i =0; i< data.list.length; i++) {
        if (data.list[i].type == 'keyup' && data.list[i].keyCode == 39) 
          move_total += 10;
        else if (data.list[i].type == 'keyup' && data.list[i].keyCode == 37) 
          move_total -= 10;
      }
      if (move_total != 0)
        gameInstance.move_diff += move_total;
    })
  });
}
