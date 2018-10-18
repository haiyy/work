import React from 'react';
import "./css/newsRemind.scss";
import GlobalEvtEmitter from "../../lib/utils/GlobalEvtEmitter";
import NtalkerEvent from "../event/NtalkerEvent";
import { ntalkerListRedux } from "../../utils/ConverUtils";
import { Redirect } from "react-router-dom";

class NewsRemind extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.state = {count: 0, link: false};
		
		this.onChange = this.onChange.bind(this);
		
		GlobalEvtEmitter.on(NtalkerEvent.CHAT_DATA_CHANGE, this.onChange);
		GlobalEvtEmitter.on(NtalkerEvent.CHAT_DATA_LIST_CHANGE, this.onChange);
	}
	
	componentWillUnmount()
	{
		this.__ntalkerListRedux = null;
		GlobalEvtEmitter.removeListener(NtalkerEvent.CHAT_DATA_CHANGE, this.onChange);
		GlobalEvtEmitter.removeListener(NtalkerEvent.CHAT_DATA_LIST_CHANGE, this.onChange);
	}
	
	get _ntalkerListRedux()
	{
		if(!this.__ntalkerListRedux)
		{
			this.__ntalkerListRedux = ntalkerListRedux();
		}
		
		return this.__ntalkerListRedux;
	}
	
	onChange()
	{
		this.setState({count: this._ntalkerListRedux.untreatedConverCount});
	}
	
	onClick()
	{
		this.setState({link: true});
	}
	
	render()
	{
		let {count} = this.state;
		
		if(!count)
			return null;
		
		if(this.state.link)
		{
			this.state.link = false;
			return <Redirect to="/chats"/>;
		}
		
		return (
			<div className="newsRemindWrapper" onClick={this.onClick.bind(this)}>
				<div className="count">{count}</div>
			</div>
		);
	}
}

export default NewsRemind;
