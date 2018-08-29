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
		self.debugLog('State must be either "on" or "off".', 5)
		return allDone(true, 'State must be either "on" or "off".')
	}
	
	// Write State to Relay
	self.resources.relays.set(rly, status);
}