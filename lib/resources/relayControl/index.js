let relays = [];
const Gpio = require('onoff').Gpio;

relayControl = function(config, container, allDone) {
	let self = this;
	self.interface = 'generic';

	self.init = function(allDone) {
		if (typeof self.resex == 'undefined') self.resex = {};

		if (!self.resex.relays)
			self.debugLog('relayControl.resex.relays must be defined', 9);

		if (!(self.resex.relays instanceof Array))
			self.debugLog('relayControl.resex.relays must be an Array', 9);

		for (let i=0; i<self.resex.relays.length; i++) {
			relays[i] = {
				pin: false,
				handle: false,
				nick: false
			}
			if (self.resex.relays[i].pin)
				relays[i].pin = (self.resex.relays[i].pin - 0) ? self.resex.relays[i].pin : false
			else
				relays[i].pin = false;

			if (relays[i].pin)
				relays[i].handle = new Gpio(relays[i].pin, 'out');
		}
		allDone();
	}

	self.relayCount = function() { return relays.length; }

	self.set = function(rly, status, allDone) {
		//Verify Status
		if (status === 1 || status === 0) {
			console.log('status looks good')
		} else {
			self.debugLog('Status must be 1 or 0', 5);
			console.log('Status must be 1 or 0');
			return allDone(true, 'Invalid status recieved')
		}

		//Verify Relay
		if ((rly >= 0) && (rly < relays.length)) {
			console.log('rly looks good')	
		} else {
			self.debugLog('Invalid relay ID')
			return allDone(true, 'Invalid rly recieved');
		}

		//Set the State of the Relay
		relays[rly].handle.writeSync(status);
		allDone(false, 'ok');
	}

	self.statusReturn = [];

	self.status = function() {
		let max = self.relayCount();
		for (let i=0; i < max; i++) {
			if (relays[i]) {
				self.debugLog(`Relay(${i}) is on pin ${relays[i].pin} and has a status of (unknown)`, 1)
				self.statusReturn.push(`Relay(${i}) is on pin ${relays[i].pin} and has a status of (unknown)`)
			} else {
				self.debugLog(`Relay(${i}) is not connected to a pin`, 1);
			}
		}
	}

	self.kill = function() {
		let max = self.relayCount();
		for (let i=0; i < max; i++) {
			relays[i].handle.writeSync(0);
		}
	}

}

module.exports = relayControl;