const myName = 'relayManager',
	debug = (process.argv[3] == 'debug'),
	gpio = require('onoff').Gpio,
	// support = require('./lib/support'),
	vcb = require('./lib/vocab'),
	NYI = 'Not Yet Implemented',
	// errMsgs = {},
	confTemplate = {
		uplinkHost: '127.0.0.1',
		uplinkPort: 8000,
		ivKey: 'passw0rd',
		// targetAddr: '127.0.0.1',
		// targetPort: 8080,
		relayList: [
			{name: 'relay-1'},
			{name: 'relay-2'},
			{name: 'relay-3'},
			{name: 'relay-4'}
		]
	};
let 
	conf,
	cFile,
	rest;
exports.neuron = {
	system: {
		debugAll: debug,
		outputDebugAt: (debug) ? 0 : 5,
		version: '1.0',
		beforeBoot: function(config, dispatcher, globals, allDone) {
			cFile = dispatcher.utilities.configFile;
			conf = cFile.get(confTemplate);

			config.interneuron.ivKey = conf.ivKey;
			config.interneuron.connectTo.host = conf.uplinkHost;
			config.interneuron.connectTo.port = conf.uplinkPort;

			globals.relayCount = conf.relayList.length;
			globals.openS = openS;
			globals.support = support;
			globals.vcb = vcb;
			allDone(false, config, dispatcher, globals);
		}
	},

	interneuron: {
		type: 'node',
		name: myName,
		ivKey: false,
		connectTo: {host: false, port: false},
		outflow: ['statusUpdate'],
		controls: {
			subscriptions: {
				onSubscriber: 'newSubscribtion',
				published: {statusUpdate: 'Emitted everytime a relay status changes'},
				allowAll: true
			}
		}
	},

	resources: [{name: 'redis'}],
	skills: [
	{
		name: 'boot',
		emits: ['boot'],
		beforeEmit: function(self, message, allDone) {
			self.resources.globals.cFile = cFile;
			self.resources.globals.conf = conf;
			self.resources.globals.conf.relayList = self.resources.globals.conf.relayList || {};


			vcb.init(self);
			support.init(self);

			self.resources.globals.conf = self.resources.globals.cFile.update('relayList', conf.relayList);
			allDone();

			// } catch(e) {
			// 	self.debugLog(`Strange error: ${e}`, 4);
			// 			allDone();
			// }
			// });
			}

	},{
		name: 'interval',
			hears: ['action', 'clear'],
			emits: ['heartbeat'],
			beforeEmit: function(self, message, allDone) {
				if (self.resources.globals.enableFlag) allDone()
				else allDone(false, false);
			},
			skillex: { 
				startOn: 'clear',
				stopOn: 'action',
				timers: [{ms: 1000, emit: 'heartbeat'}]
			}

	}, {
			name: 'timeout',
			hears: ['action'],
			emits: ['clear'],
			skillex: {
				timers: [
					{ms: 1500, startOn: 'action', emit: 'clear'}
				]
			}

	}, {
			name: 'actuator',
			hears: ['heartbeat'],
			emits: ['action', 'statusUpdate']

	}, {
			name: 'eval',
			hears: ['newSubscriber', 'statusUpdate'],
			skillex: {
				newSubscriber: function(self, message, allDone) {
					self.debugLog('New subscriber: ' + JSON.stringify(message, null, '\t'), 1.9, allDone);
				},

				statusUpdate: function(self, message, allDone) {
					self.debugLog('statusUpdate: ' + JSON.stringify(message, null, '\t'), 1.9);
				}
			}

		}
	],
	vocab: {
		beforeHelp: vcb.beforeHelp,
		evaluations: [
		{
			inarray: ['closeall', 'stop'],
			handler: vcb.close
		}
		],
		lexicon: {
			name: {
				nick: 'name',
				help: NYI,
				parameters: [
				{nick: 'relayName'},
				{nick: 'pinNum'}
				],
				handler: vcb.nameRelay
			},
			turn: {
				nick: 'turn',
				help: NYI,
				parameters: [
				{nick: 'relay'},
				{nick: 'status'} 
				],
				handler: vcb.turn
			},
			status: {
				nick: 'status',
				help: NYI,
				parameters: [{nick: 'all', optional: true}],
				handler: vcb.status
			}
		}
	}
}