// A change tracker for a threeJS scene
var THREE;
try {
   THREE = require('../../lib/three_plus');
} catch (e) {

}

var ThreeChange = {};

// applies a single change to a scene, returning the new scene and the change
// ex: change = ThreeChange.edit(scene, ['children',0,'position','x'], 50);
ThreeChange.edit = function(scene, path, newVal) {
  var obj = scene
    , i   = 0;
  for(i =0; i < path.length -1; i++){
    obj = obj[path[i]];
  }
  obj[path[i]] = newVal;
  return {type: 'edit', val: newVal, path: path};
};
ThreeChange.add = function(scene, newObj) {
  scene.add(newObj);
  return {type: 'add', obj: newObj};
};

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

if (module) // export for node
  module.exports = ThreeChange;
