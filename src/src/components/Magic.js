import React from 'react';
import ReactDOM from "react-dom"
import GlobalEvtEmitter from "../lib/utils/GlobalEvtEmitter";

export class Magic extends React.Component {
	constructor(props)
	{
		super(props);
		
		this.offsetX = 0;
		this.offsetY = 0;
	}
	
	handleClick = (event) => {
		const iframe = event.target.parentNode.querySelector('iframe');
		const iframeDoc = (iframe.contentDocument) ? iframe.contentDocument : iframe.contentWindow.document;
		
		let {x, y} = iframe.getBoundingClientRect();
		const {left, top} = iframe.getBoundingClientRect();
		
		if(!x && !y)
		{
			x = left;
			y = top;
		}
		
		const clickElement = iframeDoc.elementFromPoint(this.offsetX - x, this.offsetY - y);
		
		const newEvent = iframeDoc.createEvent('HTMLEvents');
		newEvent.initEvent('click', true, true);
		
		if(clickElement)
		{
			if(clickElement.tagName.toLowerCase() === 'a')
			{
				clickElement.click();
			}
			else
			{
				clickElement.dispatchEvent(newEvent);
			}
		}
	}
	
	handleMouseDown = (event) => {
		this.offsetX = event.clientX;
		this.offsetY = event.clientY;
	}
	
	componentDidMount()
	{
		if(!this.props.url)
			return;
		
		const iframe = this.iframe;
		
		fetch(this.props.url)
		.then((response) => {
			return response.text();
		})
		.then((data) => {
			if(!iframe || !iframe.contentWindow || !iframe.contentWindow.document) return;
			
			iframe.contentWindow.document.open("text/html", "replace");
			iframe.contentWindow.document.write(data);
			iframe.contentWindow.document.close();
			iframe.contentWindow.xnoriginurl = this.props.url;
		})
	}
	
	iframe_onload(e)
	{
		try
		{
			if(!this.iframe)
				return;
			
			let frameW, frameH;
			var iframeWin = this.iframe.contentWindow || this.iframe.contentDocument.parentWindow;
			if(iframeWin.document.body)
			{
				frameW = iframeWin.document.documentElement.scrollWidth || iframeWin.document.body.scrollWidth;
				frameH = iframeWin.document.documentElement.scrollHeight || iframeWin.document.body.scrollHeight;
			}
			
			this.iframe.width = frameW;
			this.iframe.height = frameH;
			
			GlobalEvtEmitter.emit("scrollBottom");
		}
		catch(e)
		{
		}
	}
	
	render()
	{
		return (
			<div style={{position: 'relative'}}>
				<div className="user-select-disable" onMouseDown={this.handleMouseDown} onClick={this.handleClick}
				     style={{position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 2}}/>
				<iframe ref={node => this.iframe = node} scrolling='no' src={"about:blank"} style={{border: "none"}}
				        onLoad={this.iframe_onload.bind(this)}/>
			</div>
		);
	}
}
