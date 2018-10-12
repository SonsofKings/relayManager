const myName = 'relayManager',
	debug = (process.argv[3] == 'debug'),
	vcb = require('./lib/vocab'),
	NYI = 'Not Yet Implemented',
	//Must Update confTemplate uPort and uHost before first Boot
	confTemplate = {
		uplinkHost: '127.0.0.1',
		uplinkPort: 8000,
		ivKey: 'passw0rd',
		relayList: [
			{rID: 0, relayName: 'relay-1', pin: 11, state: "off"},
			{rID: 1, relayName: 'relay-2', pin: 12, state: "off"},
			{rID: 2, relayName: 'relay-3', pin: 13, state: "off"},
			{rID: 3, relayName: 'relay-4', pin: 14, state: "off"}
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
			//Set Tools
			let rlys = config.resources[0].resex.relays;
			cFile = dispatcher.utilities.configFile;
			conf = cFile.get(confTemplate);		

			//Push Resource Requirements
			for (let i=0; i<conf.relayList.length; i++) {
				rlys[i] = {pin: conf.relayList[i].pin};
			}	

			//Establish Connection Points
			config.interneuron.ivKey = conf.ivKey;
			config.interneuron.connectTo.host = conf.uplinkHost;
			config.interneuron.connectTo.port = conf.uplinkPort;

			//Establish Globals
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
				relays: []
			}
		}	
	],

	skills: [
	{
		name: 'boot',
		emits: ['awake'],
		beforeEmit: function(self, message, allDone) {
			//Establish Living Config
			self.resources.globals.cFile = cFile;
			self.resources.globals.conf = conf;

			//Pass Self to Vocab
			vcb.init(self, conf);

			//Finish Boot
			allDone();
		}
	}, 

	{
		name: 'eval',
		hears: ['newSubscriber', 'statusUpdate'],
		emits: [],
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
			kill: {
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
			},
			relays: {
				nick: 'relays',
				help: 'Returns all known information about current relays',
				parameters: false,
				handler: vcb.relays
			},
			setpin: {
				nick: 'setpin',
				help: 'Set (relay) to watch (GPIOPIN# 9P Standard)',
				parameters: [
				{nick: 'relay'},
				{nick: 'pin'}
				],
				handler: vcb.setpin
			}
		}
	}
}