let self;
	// redis,
	// support;

exports.init = function(el) {
	self = el;
	// redis = self.resources.redis;
	// support = self.resources.support;
	

}

exports.beforeHelp = `
Relay Manager
=============
This neuron controls relays physically connected to 
the Pi. 
`;

exports.turn = function(self, message, allDone) {
	// Verify Relay
	let rly = (message.content.relay - 0);
	if ((rly >= 0) && (rly < self.resources.resex.relays.length)) {
		self.debugLog('Relay looks correct');
	} else {
		self.debugLog('Relay must be between 0 and 3.')
		return allDone(true, 'Relay must be between 0 and 3.')
	}

	// Verify State
	let state;
	if (message.content.status === 'on') {
		state = 1;
	} else if (message.content.status === 'off') {
		state = 0;
	} else {
		self.debugLog('State must be either "on" or "off".', 5)
		return allDone(true, 'State must be either "on" or "off".')
	}
	// Write State to Relay
	// self.resources.relays[rly].handle.writeSync(state);
	return allDone(true, `Turning ${message.content.status} Relay[${rly}]`);
}