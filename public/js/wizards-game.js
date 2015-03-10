// socket.io stuff
var socket = io.connect('http://localhost:3000');
socket.on('startGame', function( data ) { // the 'OK, game has been joined, now you need to init it' message from the server
  //Note that the data is the object we sent from the server, as is. So we can assume its id exists. 
  console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.uuid );
  startGame(data);
});
/* socket.on('move', function(data){
  requestAnimationFrame( render );
  renderer.render( scene, camera );
}); */

function startGame(setupData) {
  // setup scene
  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  var renderer = new THREE.WebGLRenderer();
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // build cube
  var geometry = new THREE.BoxGeometry( 1, 1, 1 );
  var material = new THREE.MeshBasicMaterial( { color: 0x5C4B27 } );
  var cube = new THREE.Mesh( geometry, material );
  scene.add( cube );

  camera.position.z = 5;

  // run game
  function render() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
  }
}
