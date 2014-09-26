$(document).ready(function(){
  $.getJSON("static/sampledata.json", function(data) {
    console.log(data);
    window.model = {
      "scans":ko.observableArray(),
      "filename":"",
      "filetype":"png",
      showScan:function(data) {
        console.log(data);
      },
      newScan: function() {
        console.log("newScan");
        $.ajax(
          '/api/scanimage?filename=' +
            window.model.filename +
            window.model.filetype, 
          {success: function(data,status) {
              window.model.showAlert("Scan queued");
            }
          }
        );
      },
      preview: function() {
        console.log("preview");
        $.ajax(
          '/api/preview',
          {success: function(data,status) {
              window.model.showAlert("Preview queued");
            }
          }
        );
      },
      updateFlatbed: function(filename) {
        $(".app-imagepreview").empty();
        $("<img/>",{src:"/scans/"+filename}).appendTo(".app-imagepreview");
      },
      showAlert: function(text) {
        var alertCount = $("alerts").children().length;
        $("#alerts").append('<div id="alert'+alertCount+'" class="alert alert-info fade in" role="alert">'+text+'</div>');
        //$("#alert"+alertCount).alert();
        setTimeout(function() {
          $("#alert"+alertCount).alert('close');
        }, 5000);
      }
    };
    $.each(data.scans, function(i,d) {window.model.scans.push(d);});
    console.log(window.model);
    ko.applyBindings(window.model);
    var socket = io.connect(); // Emit ready event.
    socket.emit('ready'); // Listen for the talk event.
    socket.on('updated',
      function(data) {
        var scans = data.scans;
        console.log(scans);
        $.each(scans, function(i,d) {
          console.log(d);
          window.model.scans.push(d);
        });
      });
    socket.on('scanComplete',
      function(data) {
        console.log('scan completed');
        var image = data.filename;
        window.model.updateFlatbed(image);
      }
    );
     socket.on('previewComplete',
      function(data) {
        console.log('preview completed');
        var image = data.filename;
        window.model.updateFlatbed(image);
      }
    );
  });
});
