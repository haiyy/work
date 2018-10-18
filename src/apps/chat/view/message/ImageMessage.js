import React from "react";
import GlobalEvtEmitter from "../../../../lib/utils/GlobalEvtEmitter";
import MessageType from "../../../../im/message/MessageType";
import Lang from "../../../../im/i18n/Lang";

class ImageMessage extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		this.state = {url: ""};
	}
	
	_onShowImageHandle(event)
	{
		let {currentSrc} = event.target;
		
		GlobalEvtEmitter.emit("show_all_img", currentSrc, this.props.isHistory);
	}
	
	_getUrl()
	{
		let message = this.props.message;
		if(message && message.file)
		{
			if(message.dataUrl)
			{
				this.setState({url: message.dataUrl});
			}
			else if(message.file)
			{
				let file = message.file,
					reader = new FileReader();
				
				reader.addEventListener("load", () => {
					message.dataUrl = reader.result;
					this.setState({url: reader.result});
					
					reader = null;
				}, false);
				
				reader.readAsDataURL(file);
			}
		}
	}
	
	componentDidMount()
	{
		this._getUrl();
	}
	
	componentDidUpdate()
	{
		this._getUrl();
	}
	
	_getUI(message)
	{
		return <img src={message.url} className="imageMessage" alt={message.sourceUrl}
		            {...onErrorEvtObject()} onClick={this._onShowImageHandle.bind(this)}
		            onLoad={() => setTimeout(() => GlobalEvtEmitter.emit("scrollBottom"), 1000)}/>;
	}
	
	getError()
	{
		let {error, status} = this.props.message;
		
		if(status === MessageType.STATUS_MESSAGE_SEND_FAILED && error)
		{
			let text = Lang.getLangTxt(error);
			
			return [
				<div className="errorTipsBg"/>,
				<div className="errorTips">{text}</div>
			]
		}
		
		return null;
	}
	
	render()
	{
		if(!this.props.message)
			return null;
		
		let message = this.props.message;
		
		return (
			<div className="maxImg">.
				{
					this._getUI(message)
				}
				{
					this.getError()
				}
			</div>
		);
		
	}
}

export function onErrorEvtObject()
{
	return {
		onError: (event) => {
			if(event && event.target)
			{
				event.target.src = require("../../../../public/images/image_load_error.png");
			}
		}
	};
}

export default ImageMessage;
