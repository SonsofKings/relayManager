const myName = 'relayManager',
	debug = (process.argv[3] == 'debug'),
	support = require('./lib/support'),
	vcb = require('./lib/vocab'),
	NYI = 'Not Yet Implemented',
	// errMsgs = {},
	//Must Update confTemplate before first Boot
	confTemplate = {
		uplinkHost: '127.0.0.1',
		uplinkPort: 8000,
		ivKey: 'passw0rd',
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
		debugAll: true,
		outputDebugAt: (debug) ? 0 : 5,
		version: '1.0',
		beforeBoot: function(config, dispatcher, globals, allDone) {
			cFile = dispatcher.utilities.configFile;
			conf = cFile.get(confTemplate);

			console.log(conf);			

			config.interneuron.ivKey = conf.ivKey;
			config.interneuron.connectTo.host = conf.uplinkHost;
			config.interneuron.connectTo.port = conf.uplinkPort;

			globals.cFile = cFile;
			globals.conf = conf;
			globals.relayCount = conf.relayList.length;
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
				onSubscriber: 'newSubscription',
				published: {statusUpdate: 'Emitted everytime a relay status changes'},
				allowAll: true
			}
		}
	},

	resources: [
		{
			name: 'relayControl',
			nick: 'relays',
			resex: {
				relays: [
					{pin: 11},
					{pin: 12},
					{pin: 13},
					{pin: 14}
				]
			}
		},
		{
			name: 'fileCollection',
			nick: 'fileCollection',
			resex: {
				filePath: [
					'{{neuronRoot}}/lib/relayCollection.js'
				]
			}

		}	
	],

	skills: [
	{
		name: 'boot',
		emits: ['startUp'],
		beforeEmit: function(self, message, allDone) {
			self.resources.globals.cFile = cFile;
			self.resources.globals.conf = conf;
			self.resources.globals.conf.relayList = self.resources.globals.conf.relayList || {};

			vcb.init(self, conf);
			support.init(self);

			self.resources.globals.conf = self.resources.globals.cFile.update('relayList', conf.relayList);
			allDone();
		}
	}, 

	{
		name: 'eval',
		hears: ['startUp'],
		emits: ['suicide'],
		skillex: {
			startUp: function(self, message, allDone) {
				self.debugLog('About to call status', 1.9)
				self.resources.relays.status();
			}
		}
	}, 

	{
		name: 'die',
		hears: ['suicide']
	},

	{
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
		lexicon: {
			stop: {
				nick: 'kill',
				help: 'Turn off all relays',
				handler: vcb.kill
			},
			name: {
				nick: 'name',
				help: 'Name (rID) (newNick)',
				parameters: [
				{nick: 'rID'},
				{nick: 'newNick'}
				],
				handler: vcb.name
			},
			turn: {
				nick: 'turn',
				help: 'Turn (relay ID) (on/off)',
				parameters: [
				{nick: 'relay'},
				{nick: 'state'} 
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