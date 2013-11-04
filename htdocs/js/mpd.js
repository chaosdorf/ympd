var socket;

if (typeof MozWebSocket != "undefined") {
	socket = new MozWebSocket(get_appropriate_ws_url(), "ympd-client");
} else {
	socket = new WebSocket(get_appropriate_ws_url(), "ympd-client");
}

try {
	socket.onopen = function() {
		console.log("Connected");
		init();
	} 

	socket.onmessage =function got_packet(msg) {
		console.log(msg.data);
		var obj = JSON.parse(msg.data);
		switch (obj.type) {
		  case "playlist":
		  	for (var song in obj.data) {
		  		var minutes = Math.floor(obj.data[song].duration / 60);
		  		var seconds = obj.data[song].duration - minutes * 60;

		  		$('#salamisandwich tr:last').after(
		  			"<tr id=\"playlist_" + obj.data[song].id + "\"><td>" + obj.data[song].id + "</td>" +
		  			"<td>"+ obj.data[song].uri +"</td>" +
		  			"<td>"+ obj.data[song].title.replace(/%07/g, '"') +"</td>" + 
		  			"<td>"+ minutes + ":" + (seconds < 10 ? '0' : '') + seconds +"</td></tr>");
		  	}
		    break;
		  case "state":
		  	$('#volumeslider').slider('setValue', obj.data.volume)
		  	var progress = Math.floor(100*obj.data.elapsedTime/obj.data.totalTime) + "%";
		  	$('#progressbar').width(progress);
		  	$('#playlist_'+obj.data.currentsongid).addClass('active');
		  	updatePlayIcon(obj.data.state);
		  	updateVolumeIcon(obj.data.volume);

		  	break;
		  default:
		    alert("Sie bleiben leider dumm");
		    break;
		}
	}
	socket.onclose = function(){
		console.log("Disconnected");

	}
} catch(exception) {
	alert('<p>Error' + exception);  
}

$('#volumeslider').slider().on('slide', function(event) {
    socket.send("MPD_API_SET_VOLUME,"+event.value);
});

function get_appropriate_ws_url()
{
	var pcol;
	var u = document.URL;

	/*
	 * We open the websocket encrypted if this page came on an
	 * https:// url itself, otherwise unencrypted
	 */

	if (u.substring(0, 5) == "https") {
		pcol = "wss://";
		u = u.substr(8);
	} else {
		pcol = "ws://";
		if (u.substring(0, 4) == "http")
			u = u.substr(7);
	}

	u = u.split('/');

	return pcol + u[0];
}

var updateVolumeIcon = function(volume)
{
	$("#volume-icon").removeClass("glyphicon-volume-off");
	$("#volume-icon").removeClass("glyphicon-volume-up");
	$("#volume-icon").removeClass("glyphicon-volume-down");

	if(volume == 0) {
		$("#volume-icon").addClass("glyphicon-volume-off");
	} else if (volume < 50) {
		$("#volume-icon").addClass("glyphicon-volume-down");
	} else {
		$("#volume-icon").addClass("glyphicon-volume-up");
	}
}

var updatePlayIcon = function(state)
{
	$("#play-icon").removeClass("glyphicon-play");
	$("#play-icon").removeClass("glyphicon-pause");
	$("#play-icon").removeClass("glyphicon-stop");

	if(state == 1) {
		$("#play-icon").addClass("glyphicon-stop");
	} else if(state == 2) {
		$("#play-icon").addClass("glyphicon-pause");
	} else {
		$("#play-icon").addClass("glyphicon-play");
	}
}


function init() {
	socket.send("MPD_API_GET_PLAYLIST");
	socket.send("MPD_API_GET_STATE");
}

function test() {
	socket.send("MPD_API_GET_PLAYLIST");
}
