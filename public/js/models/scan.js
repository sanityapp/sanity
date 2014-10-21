var Scan = function (item) {
  var self = this;

  self.filename = item.filename;
  self.multiSelected = ko.observable(false);

  self.toggleMultiSelected = function(on) {
    if(typeof(on) !== "boolean")  {
      console.log("currently:" + self.multiSelected());
      self.multiSelected(!self.multiSelected());
    }
    else
    {
      console.log("toggleing to " + on);
      self.multiSelected(on);
    }
  };
};