var THREE = require('./lib/three_plus')
  , diff = require('deep-diff')
;

function initGame(data){
  // setup scene
  var loader = new THREE.ObjectLoader();
  return loader.parse(data.scene); //new THREE.Scene();
}

module.exports = function(data){
  // initialize THREE game.
  var g = {}
    , og = {}
    ;
  g = initGame( require('./public'+data.path) );
  og = initGame( require('./public'+data.path) );
  // use a setInterval as the main game loop
  setInterval(function(){
    // calculate difference between current game (g) and last state (og) 
    var diffList = [];
    diff.observableDiff(og, g, function(d) {
      if (d && typeof d.lhs !== 'function') {
        diffList.push(d); // save the difference and
        diff.applyChange(og, g, d); // apply it to the og
      }
    });
    // if there were differences, emit the diffs
    if (diffList.length > 0) { 
      console.log(diffList)
      data.client.emit('state change', diffList);
    }
  }, 111);

  // function to update game state based on input
  function applyInput(inputList) {
    var move_total = 0;
    for (var i =0; i< inputList.length; i++) {
      if (inputList[i].type == 'keyup' && inputList[i].keyCode == 39) 
        move_total += 10;
      else if (inputList[i].type == 'keyup' && inputList[i].keyCode == 37) 
        move_total -= 10;
    }
    if(move_total == 0) return;
    console.log(move_total)
    g.children[0].position.x += move_total;
    console.log(g.children[0].position)
    console.log(og.children[0].position)
  }

  return {
    game: g,
    applyInput: applyInput,
  };
};
