# Relay Manager
___
####Author: Winston Purkiss

This neuron utilizes a relayControl resource to grant the nrlx terminal GPIO control over the 40 base pins mounted on the bundlebox. 

###Requirements
___
npm 'onoff' module

###Interneuron
___
`name:` relayManager

###Vocabulary
___
`name`: Name a Relay Based on ID. Usage: name (rID#) (newName)

Example: name 0 lights 

`turn`: Toggle a Relays State. Usage: turn (rID# || nick) (on || off)

Example: turn lights on

`kill`: Turns off all Relays. Usage: kill

`relays`: Returns all Known Information about the Relays. Usage: relays

`setpin`: Tells Relay to watch a specific pin. Restart Required. Usage: setpin (rID#) (pin#)

Example: setpin 0 11

###Skills
___
None

###Resources 
___
####Stock
None

####Custom
RelayControl: Is a custom resource designed around the 'onoff' module. It controls the relays through three basic methods(set, relayCount, and kill).
