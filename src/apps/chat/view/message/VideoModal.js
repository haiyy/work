import React from 'react';
import { DefaultPlayer  as Video, apiHelpers } from 'react-html5video';
import "../../../../public/styles/chatpage/message/videoMessage.scss";
import { downloadByATag, getLangTxt } from "../../../../utils/MyUtil";
import { allVideo, videos } from "./VideoMessage";

const {togglePause} = apiHelpers;

class VideoModal extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {paused: true};
		
		this.togglePause = this.togglePause.bind(this);
	}
	
	componentWillUnmount()
	{
		let index = videos.findIndex(value => this.togglePause === value);
		index > -1 && videos.splice(index, 1);
	}
	
	togglePause()
	{
		togglePause(this._myVideo.videoEl, {paused: false});
		this.setState({paused: true});
	}
	
	togglePauseOwn(all = true)
	{
		if(!this._myVideo)
			return;
		
		let paused = this.state.paused;
		
		all && allVideo(this.togglePause);
		
		togglePause(this._myVideo.videoEl, {paused: paused});
		
		this.setState({paused: !paused});
	}
	
	set myVideo(value)
	{
		this._myVideo = value;
	}
	
	get myVideo()
	{
		return this._myVideo;
	}
	
	onClose()
	{
		let modal = document.getElementsByClassName('portalWrapper');
		
		if(modal && modal.length > 0)
			modal[0].parentNode.removeChild(modal[0]);
		
		if(typeof this.props.onClose === "function")
		{
			this.props.onClose();
		}
	}
	
	downloadVideo()
	{
		let src = this.myVideo.videoEl.src;
		
		downloadByATag(src);
	}
	
	render()
	{
		let {message} = this.props;
		
		return (
			message.sourceurl && message.sourceurl.indexOf("http") > -1 ?
				<div className="videoModalWrap">
					<Video ref={node => this.myVideo = node} poster={message.url} src={message.sourceurl}
					       onPlayPauseClick={this.togglePauseOwn.bind(this)}
					       onFullscreenClick={this.onClose.bind(this)}>
					</Video>
					
					<i className="icon-xiangxia iconfont" onClick={this.downloadVideo.bind(this)}/>
				</div>
				:
				<div className="videoWrapCannot">
					{
						getLangTxt("20037")
					}
				</div>
		);
	}
}

export default VideoModal;
