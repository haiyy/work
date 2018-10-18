import React from 'react';
import { shallowEqual } from "../utils/MyUtil";

class EnterFrameComp extends React.Component {
	
	static defaultProps = {
		frameRate: 10,
		equalKeys: []
	};
	
	constructor(props)
	{
		super(props);
		
		this._timeOutId = -1;
		this.delayRun = this.delayRun.bind(this);
	}
	
	get frameTime()
	{
		let rate = this.props.frameRate || 10; //1000/10
		
		return parseInt(1000 / rate);
	}
	
	shouldComponentUpdate(nextProps, nextState)
	{
		if(this._timeOutId > -1)
			return false;
		
		let bChange = this.compare(nextProps, nextState, this.props, this.state);
		
		if(bChange)
		{
			this._timeOutId = setTimeout(this.delayRun, this.frameTime);
		}
		
		return false;
	}
	
	componentWillUnmount()
	{
		clearTimeout(this._timeOutId);
		this._timeOutId = -1;
	}
	
	setState(value, callback)
	{
		if(this._timeOutId > -1)
		{
			if(this.state)
			{
				Object.assign(this.state, value);
			}
			return false;
		}
		
		super.setState(value, callback);
	}
	
	compare(nextProps, nextState, thisProps, thisState)
	{
		let equalKeys = thisProps.equalKeys && thisProps.equalKeys.length > 0 ? thisProps.equalKeys : Object.keys(nextProps),
			deep = nextProps.deep || 3,
			index = equalKeys.findIndex(key => !shallowEqual(nextProps[key], thisProps[key], true, deep));
		
		return index > -1 || !shallowEqual(nextState, thisState, true, 2);
	}
	
	delayRun()
	{
		clearTimeout(this._timeOutId);
		this._timeOutId = -1;
		
		this.forceUpdate();
	}
}

export default EnterFrameComp;