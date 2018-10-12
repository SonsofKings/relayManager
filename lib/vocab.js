let self;
let conf = false;


exports.init = function(el) {
	self = el;
}

exports.beforeHelp = `
RelayControl
=============
This neuron brings power controls to the neuraverse
`;

exports.name = function(self, message, allDone) {

	//First Check rID is valid
	let relID = (message.content.rID - 0);
	if (relID < 0 || relID > 3) {
		allDone(true, 'Relay ID must be between 0 and 3')
	} 
	//Next write name to Key Value Pair in relayCollection.js
	else {
		self.globals.conf.relayList[relID].relayName = message.content.newNick;
		self.globals.cFile.update('relayList', self.globals.conf.relayList);
		console.log('Relay Name Changed to: ' + message.content.newNick);
		console.log(self.globals.conf)
		allDone(false, 'Relay Name Changed to: ' + self.globals.conf.relayList[relID].relayName)
	}
}

exports.turn = function(self, message, allDone) {
	
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

	// Verify Name
	let nick = (message.content.relay);
	let isFail = true;
	for (i=0;i<4;i++) {
		if (nick === self.globals.conf.relayList[i].relayName) {
			isFail = false;
			self.globals.conf.relayList[i].state = message.content.state;
			self.globals.cFile.update('relayList', self.globals.conf.relayList);
			self.resources.relays.set(i, status, allDone);
		}
	}

	// Verify Relay
	if (isFail === true) {
		let rly = (message.content.relay - 0);
		if ((rly >= 0) && (rly < self.globals.conf.relayList.length)) {
			self.debugLog('Relay looks correct');
		} else {
			self.debugLog('Invalid Relay')
			return allDone(true, 'Invalid Relay')
		}

		// Write State to Relay
		
		self.globals.conf.relayList[rly].state = message.content.state;
		self.globals.cFile.update('relayList', self.globals.conf.relayList);
		self.resources.relays.set(rly, status, allDone);
	}
}

exports.status = function() {
	self.resources.relays.status();
}

exports.kill = function() {
	self.resources.relays.kill();
}

exports.relays = function(self, message, allDone) {
	let msg = {relays: []};
	
	for (let i=0; i<self.globals.conf.relayList.length; i++) {
		msg.relays[i] = self.globals.conf.relayList[i];
	}

	let json = JSON.stringify(msg);
	allDone(false, json);

}

exports.setpin = function(self, message, allDone) {
	//Test Relay
	let relay = (message.content.relay - 0);
console.log(relay);
	if ((relay < 0) || (relay> 3)) {
		allDone(true, 'relay must be an integer between 0 and 3')
	}
	//Test Pin
	let pin = message.content.pin;
console.log(pin);
	//Set and Save
	self.globals.conf.relayList[relay].pin = pin;
	self.globals.cFile.update('relayList', self.globals.conf.relayList);
	allDone(false, 'Pin Updated, Restart Required');
};

