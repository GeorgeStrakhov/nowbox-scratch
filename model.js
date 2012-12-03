Boxes = new Meteor.Collection("boxes");

/////////ALLOW////////////
Boxes.allow({
  insert: function (userId, box) {
    return false; 
  },
  update: function (userId, boxes, fields, modifier) {
    return false;
  },
  remove: function (userId, boxes) {
    return false;
  }
});
