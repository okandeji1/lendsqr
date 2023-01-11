import Events from 'events';

const eventEmitter = new Events.EventEmitter();

// NOTE: set max event to unlimited, this may be dangerous, by default the max event that can be added to an event is set to 10 to avoid memory leak.
eventEmitter.setMaxListeners(0);

export default eventEmitter;
