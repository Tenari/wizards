// global variable declarations
var request
  , renderer
  , scene
  , camera
  , eventRecord = []
  , socket = io.connect('http://localhost:3000')
  , gameroom = ''
  , uid
  ;
// socket.io stuff
socket.on('startGame', function( data ) { // the 'OK, game has been joined, now you need to init it' message from the server
  //Note that the data is the object we sent from the server, as is. So we can assume its id exists. 
  console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.uuid );
  uid = data.uuid;
  // join the game room
//  socket.join(''+data.game);
//  gameroom = ''+data.game;
  // do the three js initialization based on what the server told us to do
  startGame(data.path);
});
socket.on('state change', function(data) {
  console.log(data);
  for( var i = 0; i < data.length; i++) {
    DeepDiff.applyChange(scene, true, data[i]);
  }
});

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

  // add event listeners
  var eventList = ['keyup', 'keydown', 'mousedown', 'mouseup', 'mousemove'];
  for (var i = 0; i < eventList.length; i++) {
    document.addEventListener(eventList[i], function(event){
      eventRecord.push({
        owner: uid,
        type: event.type,
        timeStamp: event.timeStamp,
        keyCode: event.keyCode,
        button: event.button,
        altKey: event.altKey,
        charCode: event.charCode,
        ctrlKey: event.ctrlKey,
        metaKey: event.metaKey,
        movementX: event.movementX,
        movementY: event.movementY,
        shiftKey: event.shiftKey,
        which: event.which,
        x: event.x,
        y: event.y
      })
    });
  }
}

function play() {
  request = requestAnimationFrame( animate );
}
var animate = function ( time ) {
  request = requestAnimationFrame( animate );
  // send events to the server
  if (eventRecord.length > 0) {
    socket.emit('events', eventRecord);
    eventRecord = []; // kill the events we just emitted
  }
  // render the image
  renderer.render( scene, camera );
};

