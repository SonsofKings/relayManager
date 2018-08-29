relayControl = function(config, container) {
	let self = this;
	self.interface = 'generic';

	self.init = function(allDone) {
		if (typeof self.resex == 'undefined') self.resex = {};

		if (!self.resex.relays)
			self.debugLog('relayControl.resex.relays must be defined', 9);

		if (!(self.resex.relays instanceof Array))
			self.debugLog('relayControl.resex.relays must be an Array', 9);

		self.relayCount = self.resex.relays.length;
		self.relays = [];
		for (let i=0; i<self.relayCount; i++) {
			self.relays[i] = {
				pin: false,
				handle: false
			}
			if (self.resex.relays[i].pin)
				self.relays[i].pin = (self.resex.relays[i].pin - 0) ? self.resex.relays[i].pin : false
			else
				self.relays[i].pin = false;

			if (self.relays[i].pin)
				self.relays[i].handle = new gpio(self.relays[i].pin, 'out');
		}
		allDone();
	}

	self.turn = function(relay, state) {
		if (state === 'on') {
			state = 1;
		} else if (state === 'off') {
			state = 0;
		} else {
			self.debugLog('State must be either "on" or "off".', 5)
		}

		if ((relay >= 0) && (relay < self.relays.length)) {
			self.relays[relay].handle.writeSync(state);
		} else {
			self.debugLog('Invalid relay ID')
		}
	}

	self.status = function() {
		for (let i=0; i<self.relayCount; i++) {
			if (self.relays[i]) {
				self.debugLog(`Relay(${i}) is on pin ${self.relays[i].pin} and has a status of (unknown)`, 1)
			} else {
				self.debugLog(`Relay(${i}) is not connected to a pin`, 1);
			}
		}
	}

}

module.exports = relayControl;