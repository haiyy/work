import React, { Component } from "react";
import { getQueryStr, hashCode } from "../../../../utils/HyperMediaUtils";
import Settings from "../../../../utils/Settings";
import NTIFrame from "../../../../components/NTIFrame";
import GlobalEvtEmitter from "../../../../lib/utils/GlobalEvtEmitter";

class HyperMediaMessage extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.onComplete = this.onComplete.bind(this);
		this.onChange = this.onChange.bind(this);
		
		this.state = {};
		
		this.url = Settings.getHyperMediaHtml(getQueryStr(props.message.params));
		this.url = encodeURI(this.url);
		
		this.hashCodeStr = hashCode(this.url);
		
		GlobalEvtEmitter.on(this.hashCodeStr, this.onChange);
	}
	
	onChange(data)
	{
		if(data && data.method === "windowHeight")
		{
			if(data.msg && data.msg.heightSe)
			{
				this.setState({height: data.msg.heightSe + "px"});
			}
		}
	}
	
	componentWillUnmount()
	{
		this.onComplete = null;
		this.iframe = null;
		GlobalEvtEmitter.removeListener(this.hashCodeStr, this.onChange);
	}
	
	onComplete()
	{
		//this.setState({isShowIframe: true});
		
		let timeoutId = setTimeout(() => {
			GlobalEvtEmitter.emit("scrollBottom");
			clearTimeout(timeoutId);
		}, 500)
		
	}
	
	render()
	{
		let { height} = this.state,
			istyle = {height};
		
		return (
			<div className="hyPerMediaMessageWrapper">
				<NTIFrame src={this.url} style={istyle} scrolling="no" onComplete={this.onComplete}/>
			</div>
		);
	}
}

export default HyperMediaMessage;
