let self;


exports.init = function(el) {
	self = el;
}

exports.beforeHelp = `
RelayControl
=============
This neuron brings power controls to the neuraverse
`;

exports.name = function(self, message, allDone) {

	// Check rID is valid
	let relID = (message.content.rID - 0);
	if (relID < 0 || relID > 3) {
		allDone(true, 'Relay ID must be between 0 and 3');
	}

	// Next write name to Key Value Pair in relayCollection.js
	else {
		self.globals.conf.relayList[relID].relayName = message.content.newNick;
		self.globals.cFile.update('relayList', self.globals.conf.relayList);
		console.log('Relay Name Changed to: ' + message.content.newNick);
		console.log(self.globals.conf);
		allDone(false, 'Relay Name Changed to: ' + self.globals.conf.relayList[relID].relayName);
	};
};

exports.turn = function(self, message, allDone) {
	
	// Verify State
	let mState = message.content.state;
	let status;
	if (mState === 'on') {
		status = 1;
	} else if (mState === 'off') {
		status = 0;
	} else {
		return allDone(true, 'State must be either "on" or "off".');
	};

	// Verify Name
	let nick = message.content.relay;
	let isFail = true;
	for (i=0;i<4;i++) {
		if (nick === self.globals.conf.relayList[i].relayName) {
			isFail = false;

			// Update Relay State on Config
			self.globals.conf.relayList[i].state = mState;
			self.globals.cFile.update('relayList', self.globals.conf.relayList);

			//Write State To Relay
			self.resources.relays.set(i, status, allDone);
		}
	}

	// Verify Relay ID
	if (isFail === true) {
		let rly = (nick - 0);
		if ((rly >= 0) && (rly < self.globals.conf.relayList.length)) {
			self.debugLog('Relay looks correct');
		} else {
			self.debugLog('Invalid Relay')
			return allDone(true, 'Invalid Relay')
		};

		// Update Relay State on Config
		self.globals.conf.relayList[rly].state = message.content.state;
		self.globals.cFile.update('relayList', self.globals.conf.relayList);

		// Write State to Relay
		self.resources.relays.set(rly, status, allDone);
	}
};

exports.kill = function() {
	self.resources.relays.kill();
}

exports.relays = function(self, message, allDone) {
	// Create Base Template
	let msg = {relays: []};
	
	// Populate Template
	for (let i=0; i<self.globals.conf.relayList.length; i++) {
		msg.relays[i] = self.globals.conf.relayList[i];
	}

	// Organize and Return
	let json = JSON.stringify(msg);
	allDone(false, json);

}

exports.setpin = function(self, message, allDone) {
	// Test Relay
	let relay = (message.content.relay - 0);
console.log(relay);
	if ((relay < 0) || (relay> 3)) {
		allDone(true, 'relay must be an integer between 0 and 3')
	}
	//T est Pin
	let pin = message.content.pin;
console.log(pin);
	// Set and Save
	self.globals.conf.relayList[relay].pin = pin;
	self.globals.cFile.update('relayList', self.globals.conf.relayList);
	allDone(false, 'Pin Updated, Restart Required');
};

