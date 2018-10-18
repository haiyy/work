import React from 'react';
import { EventEmitter } from "events";

class NTPureComponent extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.eventEmitter = new EventEmitter();
	}
	
	componentWillUnmount()
	{
		this.eventEmitter.removeAllListeners();
	}
	
	emit(type, data)
	{
		if(this.eventEmitter)
		{
			this.eventEmitter.emit(type, data);
		}
	}
	
	removeListener(type, listener)
	{
		if(this.eventEmitter)
		{
			this.eventEmitter.removeListener(type, listener);
		}
	}
	
	removeAllListeners(type)
	{
		if(this.eventEmitter)
		{
			this._eventEmitter.removeAllListeners(type);
		}
	}
	
	on(type, listener)
	{
		if(this.eventEmitter)
		{
			this.eventEmitter.on(type, listener);
		}
	}
}

export default NTPureComponent;
