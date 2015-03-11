// socket.io stuff
var socket = io.connect('http://localhost:3000');
socket.on('startGame', function( data ) { // the 'OK, game has been joined, now you need to init it' message from the server
  //Note that the data is the object we sent from the server, as is. So we can assume its id exists. 
  console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.uuid );
  
  startGame(data.path);
});

var request, renderer, scene, camera;
function startGame(path) {
  var getter = new THREE.XHRLoader();
  getter.load(path , function ( text ) {
    initGame( JSON.parse( text ) );
    play();
  });
}

function initGame(data){
  // setup scene
  var loader = new THREE.ObjectLoader();
  scene = loader.parse(data.scene); //new THREE.Scene();
  camera = loader.parse(data.camera);//new THREE.PerspectiveCamera( 75, window.innerWidth / window.innerHeight, 0.1, 1000 );

  renderer = new THREE.WebGLRenderer( { antialias: true } ); // has to be available to animate
  renderer.setPixelRatio( window.devicePixelRatio );
  renderer.setSize( window.innerWidth, window.innerHeight );
  document.body.appendChild( renderer.domElement );

  // run game
  /*function render() {
    requestAnimationFrame( render );
    renderer.render( scene, camera );
  }*/

}

function play() {
  request = requestAnimationFrame( animate );
}
var animate = function ( time ) {
  request = requestAnimationFrame( animate );
  renderer.render( scene, camera );
};
