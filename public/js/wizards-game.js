// global variable declarations
var request
  , renderer
  , scene
  , camera
  , eventRecord = []
  , socket = io.connect('http://localhost:3000')
  , gameroom = ''
  , uid
  , futureBuffer = [] // a list of server-given states that we use for interpolation
  , pastState = {changes: [], time: Date.now(), coming: [], lag: 40} // a container for a list of changes that occured in the past
  , globalLerpTime = 100
  ;
// socket.io stuff
socket.on('startGame', function( data ) { // the 'OK, game has been joined, now you need to init it' message from the server
  //Note that the data is the object we sent from the server, as is. So we can assume its id exists. 
  console.log( 'Connected successfully to the socket.io server. My server side ID is ' + data.uuid );
  uid = data.uuid;
  // do the three js initialization based on what the server told us to do
  startGame(data.path);
});
// when the server gives new state info, we add it to the history buffer
socket.on('state change', function(data) {
//  console.log(data);
  futureBuffer.push({diffList: data, time: Date.now()});
});
socket.on('add object', addObject);

// adds an object to the `scene`
function addObject(data) {
  if (scene) {
    var loader = new THREE.ObjectLoader();
    scene.add(loader.parse(data));
  } else {
    setTimeout(function(){addObject(data)}, 100);
  }
}

// loads a scene file from a given path over xhr
function startGame(path) {
  var getter = new THREE.XHRLoader();
  getter.load(path , function ( text ) {
    initGame( JSON.parse( text ) );
    play();
  });
}

// parses a JSON object into THREE scene, camera and renderer
// also sets up the event listeners for the client to send input to the server
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
  // clean up the futureBuffer to ensure that everything there actually is in the future
  cleanFutureBuffer();
  // update game state with interpolation
  ThreeChange.applyListLerp(scene, futureBuffer, pastState, globalLerpTime);
  // update/conglomerate the past state
  advancePastState();
  // render the image
  renderer.render( scene, camera );
};

function cleanFutureBuffer(){
  var changes, time, now = Date.now();
  for(var i=0; i<futureBuffer.length; i++){
    changes = futureBuffer[i].diffList;
    time = futureBuffer[i].time
    if (time < now-globalLerpTime) {
      pastState.coming.push.apply(pastState.coming, changes); // put the changes at the end of the pastState.coming array (changes soon-to-be in the past)
      futureBuffer.splice(i, 1); // deletes the obj from the future buffer
    }
  }
}

function advancePastState() {
  if (Date.now()-globalLerpTime-pastState.lag > pastState.time) { // we need to actually advance the past
    pastState.changes = [];
    pastState.changes.push.apply(pastState.changes, pastState.coming);
    pastState.coming = [];
    pastState.time = Date.now() - globalLerpTime;
  }
}
