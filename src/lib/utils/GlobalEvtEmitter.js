import { EventEmitter } from "events";

let _eventEmitter = new EventEmitter();
_eventEmitter.setMaxListeners(5000000);

export default _eventEmitter;