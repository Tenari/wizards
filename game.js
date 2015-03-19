var THREE = require('./lib/three_plus')
  , diff = require('deep-diff')
  , gameList = [{players:[1,2]}] //dumy game to make length-1 work
  , tc = require('./public/js/three-changer')
;

function initGame(data){
  // setup scene
  var loader = new THREE.ObjectLoader();
  return loader.parse(data.scene); //new THREE.Scene();
};
function createNewGame(data){
  gameList[gameList.length-1] = {
    players: [data.client],
    g: {},
    changes: []
  };
  var instance = gameList[gameList.length-1];
  // initialize THREE game.
  instance.g = initGame( require('./public'+data.path) );
  // use a setInterval as the main game loop
  setInterval(function(){
    // if there were differences, emit the diffs
    if (instance.changes.length > 0) { 
      console.log(instance.changes);
      for(var i =0; i < instance.players.length; i++){
        instance.players[i].emit('state change', instance.changes);
      }
    }
    instance.changes = []; //clear the changelist
  }, 111);
};
function addPlayerToGame(data) {
  var instance = gameList[gameList.length-1]
    , geometry, material, mesh
    ;
  instance.players.push(data.client);
  // add the new player to the scene
  geometry = new THREE.BoxGeometry( 50, 100, 50 );
  material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  mesh = new THREE.Mesh( geometry, material );
  tc.add(instance.g, mesh); // `g` is a scene
  for(var i =0; i < instance.players.length; i++){
    instance.players[i].emit('add object', mesh);
  }
};

module.exports = function(data){
  // determine if we need to make a new game
  if (gameList[gameList.length-1] == undefined || gameList[gameList.length-1].players.length == 2) { // we need to create a new game
    createNewGame(data);
  } else { // we need to add a dude to a game
    addPlayerToGame(data);
  }

  // function to update game state based on input
  function applyInput(inputList, gid, playerPos) {
    var g = gameList[gid].g
      , move_total = 0
      ;
    for (var i =0; i< inputList.length; i++) {
      if (inputList[i].type == 'keyup' && inputList[i].keyCode == 39) 
        move_total += 10;
      else if (inputList[i].type == 'keyup' && inputList[i].keyCode == 37) 
        move_total -= 10;
    }
    if(move_total == 0) return;
    console.log('gid: '+gid);
    console.log('playerPos: '+playerPos);
    console.log('gameList.length: '+gameList.length);
    console.log(g.children.length);
    var chng = tc.edit(g, ['children',playerPos,'position', 'x'], move_total+g.children[playerPos].position.x);
    gameList[gid].changes.push(chng);
    if (playerPos == 1) {
      console.log(g.children[playerPos].position);
    }
  }

  return {
    gid: gameList.length-1,
    pid: gameList[gameList.length-1].players.length - 1,
    applyInput: applyInput,
  };
};

