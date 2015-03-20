// A change tracker for a threeJS scene
var ThreeChange = {};
(function(){
  var THREE;
  try {
     THREE = require('../../lib/three_plus');
  } catch (e) {

  }
  // applies a single change to a scene, returning the new scene and the change
  // ex: change = ThreeChange.edit(scene, ['children',0,'position','x'], 50);
  ThreeChange.edit = function(scene, path, newVal) {
    var obj    = scene
      , oldVal = null
      , i      = 0;
    for(i =0; i < path.length -1; i++){
      obj = obj[path[i]];
    }
    oldVal = obj[path[i]];
    obj[path[i]] = newVal;
    return {type: 'edit', val: newVal, path: path};
  };
  ThreeChange.add = function(scene, newObj) {
    scene.add(newObj);
    return {type: 'add', obj: newObj};
  };
  // reads value out of a scene using a path array
  ThreeChange.getVal = function(scene, path) {
    var obj    = scene
      , i      = 0;
    for(i =0; i < path.length; i++){
      obj = obj[path[i]];
    }
    return obj;
  }

  // applies a list of changes to a three scene
  ThreeChange.applyList = function(scene, diff){
    for(var i = 0; i < diff.length; i++){
      if (diff[i].type == 'edit') {
        ThreeChange.edit(scene, diff[i].path, diff[i].val);
      } else if (diff[i].type == 'add') {
        var loader = new THREE.ObjectLoader();
        scene.add(loader.parse(diff[i].obj));
      } else { //delete
      }
    }
  };

  // returns {relevant changelist item} if changelist contains a change affecting the same entity as change
  // false otherwise
  function valChanged(changelist, change){
    if (change.type == 'add')
      return false;
    for (var i=0; i<changelist.length; i++) {
      if(changelist[i].type == change.type) {
        if(changelist[i].path && change.path && changelist[i].path.length == change.path.length) {
          var arrGood = true;
          for(var j=0; j<changelist[i].path.length; j++) {
            if(changelist[i].path[j] != change.path[j]){
              arrGood = false;
              break;
            }
          }
          if(arrGood)
            return changelist[i];
        }
      }
    }
    return false;
  }
  // applies changes to a THREE scene using the contents of a future buffer, a past obj, and a lerp time to calculate current display
  /* past = {
       changes: [list, of, ThreeChange, objects],
       time: stamp at which these changes occured
     } */
  ThreeChange.applyListLerp = function(scene, buffer, past, lerp){
    var diff     = null
      , now      = 0
      , then     = past.time
      , diffTime = 0
      , val      = 0
      , oldVal   = 0
      , endVal   = 0
      ;
    for(var j = 0; j < buffer.length; j++){ // each item in the buffer is a {diffList: [array, of, changes], time: stamp}
      diff = buffer[j].diffList;
      diffTime = buffer[j].time;
      for(var i = 0; i < diff.length; i++){ // each item in diff is a change to apply
        if (diff[i].type == 'edit') {
          now = Date.now() - lerp;
          oldVal = valChanged(past.changes, diff[i]) ? valChanged(past.changes, diff[i]).val : ThreeChange.getVal(scene, diff[i].path); // the old value
          endVal = diff[i].val; // what the value should be when now == diffTime
          val = oldVal + (((endVal-oldVal) / (diffTime-then)) * (now - then)); // the lerped value at now
          ThreeChange.edit(scene, diff[i].path, val);
        } else if (diff[i].type == 'add') { // happens right away. No lerping
          var loader = new THREE.ObjectLoader();
          scene.add(loader.parse(diff[i].obj));
        } else { //delete
        }
      }
    }
  };

})();

if (module) // export for node
  module.exports = ThreeChange;
