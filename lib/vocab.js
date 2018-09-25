let self;
let conf = false;


exports.init = function(el, la) {
	self = el;
	conf = la;
}

exports.beforeHelp = `
Relay Manager
=============
This neuron controls relays physically connected to 
the Pi. 
`;

exports.name = function(self, message, allDone) {

	//First Check rID is valid
	let relID = (message.content.rID - 0);
	if (relID < 0 || relID > 3) {
		allDone(true, 'Relay ID must be between 0 and 3')
	} 
	//Next write name to Key Value Pair in relayCollection.js
	else {
		conf.relayList[relID].name = message.content.newNick;
		conf.save();
		console.log('Relay Name Changed to: ' + message.content.newNick);
		allDone(false, 'Relay Name Changed to: ' + conf.relayList[relID].name)
	}
}

exports.turn = function(self, message, allDone) {
	// Verify Name
	let nick = (message.content.relay);
	let 

	// Verify Relay
	
	let rly = (message.content.relay - 0);
	if ((rly >= 0) && (rly < self.resources.relays.relayCount())) {
		self.debugLog('Relay looks correct');
	} else {
		self.debugLog('Invalid Relay')
		return allDone(true, 'Invalid Relay')
	}

	
	// Verify State
	
	let status;
	if (message.content.state === 'on') {
		status = 1;
		console.log('state parameter approved, promote status');
	} else if (message.content.state === 'off') {
		status = 0;
		console.log('state parameter approved, promote status');
	} else {
		return allDone(true, 'State must be either "on" or "off".')
	}
	
	
	// Write State to Relay
	
	self.resources.relays.set(rly, status, allDone);
}

exports.status = function() {
	self.resources.relays.status();
}

exports.kill = function() {
	self.resources.relays.kill();
}