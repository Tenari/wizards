var UUID = require('node-uuid');
module.exports = function(sio){
  sio.sockets.on('connection', function (client) {
    var game = UUID();
    client.userid = UUID();
    client.emit('startGame', { uuid: client.userid, path: '/data/app.json', game: game } );
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
    })
  });
}
