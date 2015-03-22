var THREE = require('./lib/three_plus')
  , gameList = [{players:[1,2]}] //dumy game to make length-1 work
  , tc = require('./public/js/three-changer')
  , WizGame = require('./public/game/instance')
;

function initGame(data){
  // setup scene
  var loader = new THREE.ObjectLoader();
  return loader.parse(data.scene); //new THREE.Scene();
};
function createNewGame(data){
  var instance = new WizGame([data.client]);
  gameList[gameList.length-1] = instance;
  // initialize THREE game.
  instance.g = initGame( require('./public'+data.path) );
  // use a setInterval as the main game loop
  setInterval(function(){
    // if there were differences, emit the diffs
    if (instance.changes.length > 0) { 
      //console.log('obj '+instance.changes[0].path[1]+' xpos = '+instance.changes[0].val);
      for(var i =0; i < instance.players.length; i++){
        instance.players[i].emit('state change', instance.changes);
      }
    }
    instance.changes = []; //clear the changelist
  }, 111);
};

module.exports = function(data){
  // determine if we need to make a new game
  if (gameList[gameList.length-1] == undefined || gameList[gameList.length-1].players.length == 2) { // we need to create a new game
    createNewGame(data);
  } else { // we need to add a dude to a game
    gameList[gameList.length-1].addPlayer(data.client);
  }

  // function to update game state based on input
  function applyInput(inputList, gid, playerPos) {
    gameList[gid].processInput(inputList, playerPos);
  }

  return {
    gid: gameList.length-1,
    pid: gameList[gameList.length-1].players.length - 1,
    applyInput: applyInput,
  };
};

