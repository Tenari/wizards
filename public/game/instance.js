var THREE = THREE || require('../../lib/three_plus')
  , ThreeChange = ThreeChange || require('../js/three-changer')
  , tc = ThreeChange;
var WizGame = WizGame || function(players, threeG, changes, isClient){ // constructor
  this.players = players || []; // list of socket-emittable clients
  this.g = threeG || {};
  this.changes = changes || [];
  this.isClient = isClient || false;
};
WizGame.prototype.addPlayer = function(playerClient){
  var geometry, material, mesh;
  this.players.push(playerClient);
  // add the new player to the scene
  geometry = new THREE.BoxGeometry( 50, 100, 50 );
  material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
  mesh = new THREE.Mesh( geometry, material );
  tc.add(this.g, mesh); // `g` is a scene
  for(var i =0; i < this.players.length; i++){
    this.players[i].emit('add object', mesh);
  }
}; 
WizGame.prototype.processInput = function(inputs, playerIndex){
  var i
    , move_total = 0
    , chng;

  for (i = 0; i< inputs.length; i++) {
    if (inputs[i].type == 'keyup' && inputs[i].keyCode == 39) 
      move_total += 10;
    else if (inputs[i].type == 'keyup' && inputs[i].keyCode == 37) 
      move_total -= 10;
  }

  if(move_total == 0) return;

  console.log('playerIndex: '+playerIndex+' move_total: '+move_total+' position.x: '+this.g.children[playerIndex].position.x);
  chng = tc.edit(this.g, ['children',playerIndex,'position', 'x'], move_total+this.g.children[playerIndex].position.x);
  // only store changes on server. Client don't care
  if (!this.isClient){
    this.changes.push(chng);
  }
};

try{
  module.exports = WizGame;
}catch(e){
  //on browser, dont need to export
}
