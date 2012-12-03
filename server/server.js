/////////PUBLISH///////////
Meteor.publish("directory", function () {
  return Meteor.users.find({}, {fields: {emails: 1, profile: 1}});
});

Meteor.publish("boxes", function() {
  return Boxes.find({owners: this.userId});
});

////////METHODS///////////

Meteor.methods({
  'addNewBox' : function(newBoxName) {
    if(!newBoxName) {
      throw new Meteor.Error(400, 'name can\'t be empty');
      return;
    }
    newBoxName = newBoxName.toString();
    if(newBoxName == "") {
      throw new Meteor.Error(400, 'name can\'t be empty');
      return;
    }
    if(Boxes.findOne({name: newBoxName})) {
      throw new Meteor.Error(400, 'name already taken');
      return;      
    }
    if(!this.userId) {
      throw new Meteor.Error(400, 'you are not logged in');
      return;
    }
    var d = new Date();
    var newBoxId = Boxes.insert({
      name: newBoxName,
      owners: [this.userId],
      lastModified: d.getTime(),
      stuff: [
        {
          type: "Event",
          by: this.userId,
          content: "created this NowBox",
          when: d.getTime(),
        },
      ],
    });
    return newBoxId;
  },
  'addNewStuff' : function(nowBoxId, type, newStuffVal) {
    if(!this.userId) {
      throw new Meteor.Error(400, 'you\'re not logged in');
      return;
    }
    if(!Boxes.findOne(nowBoxId)){
      throw new Meteor.Error(400, 'nowbox doesn\'t exist');
      return;
    }
    if(!type) {
      throw new Meteor.Error(400, 'type not set');
      return;
    }
    if(!newStuffVal) {
      throw new Meteor.Error(400, 'stuff not set');
      return;
    }      
    newStuffVal = newStuffVal.toString();
    if(newStuffVal == "") {
      throw new Meteor.Error(400, 'please put something in');
      return;
    }
    
    if(type == "Collaborator") {
      var newOwner = Meteor.users.findOne({emails: {address: newStuffVal, verified: false}});
      if(!newOwner)
        newOwner = Meteor.users.findOne({emails: {address: newStuffVal, verified: true}});
      if(!newOwner || !newOwner._id) {
        throw new Meteor.Error(404, 'no such user in the system');
        return;
      }
      Boxes.update(nowBoxId, {$addToSet: {owners: newOwner._id}});
      return '200';
    }
    
    //FIX! more validation here and changing links to http:// etc.
    var d = new Date();
    var newStuffId = Boxes.update(nowBoxId, {$push: {stuff: {
      type: type,
      by: this.userId,
      content: newStuffVal,
      when: d.getTime(),
    }}});
    Boxes.update(nowBoxId, {$set: {lastModified: d.getTime()}});
    return newStuffId;
  }
});
