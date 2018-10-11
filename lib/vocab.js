let self;
let conf = false;


exports.init = function(el) {
	self = el;
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
		self.globals.conf.relayList[relID].name = message.content.newNick;
		self.globals.cFile.update('relayList', self.globals.conf.relayList);
		console.log('Relay Name Changed to: ' + message.content.newNick);
		console.log(self.globals.conf)
		allDone(false, 'Relay Name Changed to: ' + self.globals.conf.relayList[relID].name)
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
		if (nick === self.globals.conf.relayList[i].name) {
			isFail = false;
			self.globals.conf.relayList[i].state = message.content.state;
			self.globals.cFile.update('relayList', self.globals.conf.relayList);
			self.resources.relays.set(i, status, allDone);
		}
	}

	// Verify Relay
	if (isFail === true) {
		let rly = (message.content.relay - 0);
		if ((rly >= 0) && (rly < self.resources.relays.relayCount())) {
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

exports.relays= function(self, message, allDone) {
	let msg = {relays: []};
	
	for (let i=0; i<self.globals.conf.relayList.length; i++) {
		msg.relays[i] = self.globals.conf.relayList[i];
	}

	let json = JSON.stringify(msg);
	allDone(false, msg);

};