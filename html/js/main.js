var attitude = $.flightIndicator('#attitude', 'attitude');
var heading = $.flightIndicator('#heading', 'heading');
var altimeter = $.flightIndicator('#altimeter', 'altimeter');
var map;
var centerToggle = 1;
var dronemarker;
var loaded = 0;


window.onload = function () { 
    loaded = 1; 
    initMap();
    setTimeout(function(){$("#pre-loader").fadeOut("slow")}, 500);
}

function initMap() {
    if(loaded == 1){
        map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: 0, lng: 0},
          mapTypeId: 'satellite',
          scrollwheel: false,
          streetViewControl: false,
          mapTypeControl: false,
          zoomControlOptions: {
              position: google.maps.ControlPosition.TOP_RIGHT
          },
          zoom: 19
        });
    
        dronemarker = new google.maps.Marker({
            position: {lat: 0, lng: 0},
            map: map,
            icon: {
                url: "img/drone.svg",
                scaledSize: new google.maps.Size(64, 64)
            }
        });

        homemarker = new google.maps.Marker({
            position: {lat: 0, lng: 0},
            map: map,
            icon: {
                url: "img/home.svg",
                scaledSize: new google.maps.Size(64, 64)
            }
        });
    }
}


socket.on('ATTITUDE', function(msg){
    var msg = JSON.parse(msg);
    attitude.setRoll(Number(msg.roll) * 100);
    attitude.setPitch(Number(msg.pitch) * 100);
});

socket.on('VFR_HUD', function(msg){
    var msg = JSON.parse(msg);
    heading.setHeading(msg.heading);
    altimeter.setAltitude(msg.alt);
});


socket.on('GPS_RAW_INT', function(msg){
    var msg = JSON.parse(msg);
    var lati = Number(msg.lat) / 10000000;
    var longi = Number(msg.lon) / 10000000;
    if(loaded == 1){
        if(centerToggle == 1){
            map.panTo({lat: lati, lng: longi});
        }
         dronemarker.setPosition({lat: lati, lng: longi});
         $("#lat").text("Latitude: "+lati);
         $("#long").text("Longitude: "+longi);
    }
    
});

socket.on('SYS_STATUS', function(msg){
    var msg = JSON.parse(msg);
    $("#battpercent").text(msg.current_battery + "%");
    $("#battpercentbar").attr('value',msg.current_battery);
    $("#cpupercent").text(Math.round(Number(msg.load)/10) + "%");
    $("#cpupercentbar").attr('value',msg.load);

});

// homemarker.setPosition({lat: lati, lng: longi});

$('#GPSToggle').change(function() {
    if ($('#GPSToggle').is(":checked"))
    {
      centerToggle = 1;
    }else{
      centerToggle = 0;
    }
});
