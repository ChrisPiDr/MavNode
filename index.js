// Coded by VoidTyphoon.co.uk //

var app = require('express')(),
 	http = require('http').Server(app),
 	SerialPort = require('serialport'),
 	mavlink = require('mavlink'),
	io = require('socket.io')(http);

// User Config
var httpPortIn = 3001; // Set HTTP port here
var serialPortIn = "COM5"; // Set serial port here
var serialBaud = 57000; // Set serial BaudRate here

var init = 0;
// Setup Server
app.get('*', function(req, res){
	if(init == 2){
  		res.sendFile(__dirname + '/html' + req.originalUrl);
  	}else if (init == 1){
  		res.send('<meta http-equiv="refresh" content="5"> Serial Loaded... Waiting for MavLink <br>Resource Requested - '+req.originalUrl); // if not initiated, give error and reload every 5 seconds
  	}else if (init == 0){
  		res.send('<meta http-equiv="refresh" content="5"> Loading... <br>Resource Requested - '+req.originalUrl); // if not initiated, give error and reload every 5 seconds
  	}else{
  		res.send('<meta http-equiv="refresh" content="5"> <b style="color:red">Error-- Refreshing</b>  <br>Resource Requested - '+req.originalUrl);
  	}
});

io.on('connection', function(socket){
  console.log('user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
});

http.listen(httpPortIn, function(){
  console.log('listening on *:'+httpPortIn);
});


//Setup Serial
var port = new SerialPort(serialPortIn, {
	baudrate: serialBaud
});

port.on('open', function() {
	console.log("Serial Port is ready");
	init = 1; // set initiated status to serial ready
	var myMAV = new mavlink(1,1,"v1.0",["common", "pixhawk"]);
	myMAV.on("ready", function() { // Wait for mavlink to finnish parsing XML
		console.log("MavLink is ready");
		init = 2; // set initiated status to all loaded

		
		// See https://pixhawk.ethz.ch/mavlink/#HEARTBEAT for message types


		port.on('data', function (data) {
		    myMAV.parse(new Buffer(data));
		});


		myMAV.on("message", function(message) {
			//console.log(myMAV.getMessageName(message.id));
		});

		myMAV.on("ATTITUDE", function(message, fields) {
			fields = JSON.stringify(fields);
			io.emit('ATTITUDE', fields); // https://pixhawk.ethz.ch/mavlink/#ATTITUDE
		});

		myMAV.on("VFR_HUD", function(message, fields) {
			fields = JSON.stringify(fields);
			io.emit('VFR_HUD', fields); // https://pixhawk.ethz.ch/mavlink/#VFR_HUD
		});

		//SCALED_PRESSURE3

		myMAV.on("GPS_RAW_INT", function(message, fields) {
			fields = JSON.stringify(fields);
			io.emit('GPS_RAW_INT', fields); // https://pixhawk.ethz.ch/mavlink/#VFR_HUD
		});

		//SYS_STATUS
		myMAV.on('SYS_STATUS', function(message, fields) {
		    fields = JSON.stringify(fields);
		    io.emit('SYS_STATUS', fields);    
		});

		//HOME_POSITION
		myMAV.on('HOME_POSITION', function(message, fields) {
		    fields = JSON.stringify(fields);
		    console.log(fields);
		    io.emit('HOME_POSITION', fields);    
		});

	
		//GPS_STATUS

		//BATTERY_STATUS

		//RADIO_STATUS


		myMAV.createMessage("MESSAGE_INTERVAL",
				{
					"message_id": 410,
					"interval_us": 1000000
				},
				function(message) {
					port.write(message.buffer);
		});


	});


});