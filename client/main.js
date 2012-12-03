//////////////INITIAL SETUP//////////

Meteor.subscribe("directory");
Meteor.subscribe("boxes");

Meteor.startup(function() {
  $.embedly.defaults['key'] = '58779d01e25b4a1eb0f1cead7820466b';
});

///////////REACTIVE SESSION LISTENERS////////////


///////////SITE-WIDE HELPERS/////////////
Handlebars.registerHelper("currentBox", function() {
  return Boxes.findOne(Session.get("currentBox"));
});

///////////TEMPLATE LOGIC//////////////

Template.app.myBoxes = function() {
  return Boxes.find();
};

Template.addBox.events = {
  'click #showAddBox' : function() {
    $("#addBoxDiv").toggle("slow");
    if($("#showAddBox").html() == "+") {
      $("#addBoxInput").focus();
      $("#showAddBox").html("-");
    } else {
      $("#showAddBox").html("+");
    }
  },
  'click #submitNew' : function(e) {
    e.preventDefault();
    Meteor.call('addNewBox', $("#newNowBoxName").val(), function(error, result) {
      if(error) {
        $("#addNewBoxValidation").addClass("error");
        $(".help-block").html(error.reason);
        //console.log(error);
      }
      if(result) {
        //console.log(result);
        Router.navigate("nowbox/"+result, true);
      }
    });
  },
};

Template.boxItem.formattedModificationDate = function() {
  var d = new Date(this.lastModified);
  return d.toLocaleDateString();
}

Template.searchBox.events = {
  'click #searchBtn' : function(e) {
    e.preventDefault();
  },
};

Template.singleBox.allStuff = function() {
  var currentBox = Boxes.findOne(Session.get("currentBox"));
  return currentBox.stuff.reverse();
}

Template.singleBox.events = {
  'click #showAddBox' : function(e) {
    e.preventDefault();
    $("#addStuffDiv").toggle('slow');
    if($("#showAddBox").html() == "+") {
      $("#showAddBox").html("-");
    } else {
      $("#showAddBox").html("+");
    }
  },
  'click #submitNewThing' : function(e) {
    e.preventDefault();
    var activeType = $("#newStuffType").val();
    Meteor.call('addNewStuff', Session.get("currentBox"), activeType, $("#newStuff"+activeType).val(), function(error, result) {
      if(error)
        console.log(error);
      if(result)
        console.log(result);
    });
  },
  'change #newStuffType' : function() {
    $(".inputData").hide();
    var activeType = $("#newStuffType").val();
    $("#add"+activeType+"Form").show();
  }
};

Template.stuffItem.userName = function() {
  if (this.by == Meteor.userId())
    return "you";
  var theUser = Meteor.users.findOne(this.by);
  if(theUser) {
    if(theUser.profile && theUser.profile.name)
      return theUser.profile.name;
    if(theUser.emails[0].address)
      return theUser.emails[0].address;
  }
};

Template.stuffItem.itemHtml = function() {
  var html = this.content; //we need to do thorough validation when adding an item, so we are pretty loose here
  if (this.type == "Link") {
    html='<a href="'+this.content+'" target="_blank">'+this.content+'</a>';
  }
  if (this.type == "Photo") {
    html='<img src="'+this.content+'" class="stuffPhoto" />';
  }
  if(this.type == "Thought") {
    html='<blockquote><p>'+this.content+'</p></blockquote>';
  }
  if(this.type == "Video") {
    html = '<a class="videoLink" href="'+this.content+'" target="_blank">'+this.content+'</a>';
  }
  if(this.type == "Question") {
    console.log(this);
  }
  return html;
}

Template.stuffItem.rendered = function() {
  if(this.data.type == "Video") {
    //console.log('video -> processing with embedly');
    $(".videoLink").embedly({maxWidth:300,"method":"replace"});
  }
}

Template.stuffItem.when = function() {
  var date = new Date(this.when);
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
};

///////ROUTER//////////
var myRouter = Backbone.Router.extend({
  routes: {
    "nowbox/:boxId": "box",
    "": "main",
    "*stuff": "main"
  },
  main: function() {
    Session.set("currentBox", false);
  },
  box: function(boxId) {
    //console.log(boxId);
    Session.set("currentBox", boxId);
  },

});

Router = new myRouter;

Meteor.startup(function () {
  Backbone.history.start();
});
