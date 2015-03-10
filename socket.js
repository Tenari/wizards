var UUID = require('node-uuid');
module.exports = function(sio){
  sio.sockets.on('connection', function (client) {
    client.userid = UUID();
    client.emit('startGame', { uuid: client.userid } );
/*    var interval = setInterval(function(){
      client.emit('move', {eval: 'cube.position.x += 0.02'})
    }, 100); */
    console.log('- socket.io:: player ' + client.userid + ' connected');
    client.on('disconnect', function () {
      console.log('- socket.io:: client disconnected ' + client.userid );
//      clearInterval(interval);
    });
  });
}
