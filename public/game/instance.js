var THREE = THREE || require('../../lib/three_plus')
  , ThreeChange = ThreeChange || require('../js/three-changer')
  , tc = ThreeChange;
var WizGame = WizGame || function(players, threeG, changes, isClient){ // constructor
  this.players = players || []; // list of socket-emittable clients
  this.g = threeG || {};
  this.changes = changes || [];
  this.isClient = isClient || false;
  this.lastTick = Date.now();
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
      move_total += 100;
    else if (inputs[i].type == 'keyup' && inputs[i].keyCode == 37) 
      move_total -= 100;
  }

  if(move_total == 0) return;

  console.log('playerIndex: '+playerIndex+' move_total: '+move_total+' position.x: '+this.g.children[playerIndex].position.x);
  chng = tc.edit(this.g, ['children',playerIndex,'userData','velocity', 'x'], move_total+this.g.children[playerIndex].userData.velocity.x);
  // only store changes on server. Client don't care
  if (!this.isClient){
    this.changes.push(chng);
    console.log('x: '+this.g.children[playerIndex].userData.velocity.x);
  }
};
WizGame.prototype.tickForward = function(){
  var i, obj, temp
    , x, y, z
    , velocity
    , now   = Date.now()
    , delta = (now - this.lastTick) / 1000;
  // apply velocity reduction to each velocity-enabled object
  for(i = 0; i < this.g.children.length; i++){
    obj = this.g.children[i];
    if(obj.userData.velocity != undefined){ // if the object is velocity enabled
      if(Array.isArray(obj.userData.velocity)) { // if it was an array, transform it to a Vector3
        temp = obj.userData.velocity;
        obj.userData.velocity = new THREE.Vector3(temp[0],temp[1],temp[2]);
      } else {                                   // assume it is a Vector3
        velocity = obj.userData.velocity;
        x = obj.position.x;
        y = obj.position.y;
        z = obj.position.z;
        // apply the friction-style slow downs
        velocity.x -= velocity.x * 10.0 * delta;
        velocity.z -= velocity.z * 10.0 * delta;

        // apply gravity
        velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

        obj.translateX( velocity.x * delta );
        obj.translateY( velocity.y * delta );
        obj.translateZ( velocity.z * delta );

        if ( obj.position.y < 10 ) {
          velocity.y = 0;
          obj.position.y = 10;
        }

        if (!this.isClient) { // add the above-made changes to this.changes
          if (x != obj.position.x) {
            this.changes.push(tc.edit(this.g, ['children',i,'position', 'x'], obj.position.x));
            console.log(velocity);
            console.log(obj.position);
          }
          if (y != obj.position.y) {
            this.changes.push(tc.edit(this.g, ['children',i,'position', 'y'], obj.position.y));
          }
          if (z != obj.position.z) {
            this.changes.push(tc.edit(this.g, ['children',i,'position', 'z'], obj.position.z));
          }
        }
      }
    }
  }
  this.lastTick = now;
}

try{
  module.exports = WizGame;
}catch(e){
  //on browser, dont need to export
}
