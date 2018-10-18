import React from 'react';
import { DefaultPlayer  as Video, apiHelpers } from 'react-html5video';
import "../../../../public/styles/chatpage/message/videoMessage.scss";
import VideoModal from './VideoModal';
import NTDragView from "../../../../components/NTDragView";
import Portal from "../../../../components/Portal";
import { downloadByATag } from "../../../../utils/MyUtil";

const {togglePause} = apiHelpers;

class VideoMessage extends React.Component {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			videoModal: false,
			paused: true
		};
		
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
	
	onFullscreenClick(e)
	{
		this.setState({
			videoModal: true
		});
		
		if(this.myVideo)
		{
			this.myVideo.videoEl.pause();
		}
	}
	
	_onClose()
	{
		this.setState({
			videoModal: false
		});
	}
	
	getVideoModal()
	{
		let {message = {}} = this.props;
		
		return (
			<Portal>
				<NTDragView enabledDrag={true} enabledClose={true} wrapperProps={{width: 926, height: 520}}
				            _onClose={this._onClose.bind(this)}>
					<VideoModal message={message} onClose={this._onClose.bind(this)}/>
				</NTDragView>
			</Portal>
		);
	}
	
	downloadVideo()
	{
		let src = this.myVideo.videoEl.src;
		
		downloadByATag(src);
	}
	
	set myVideo(value)
	{
		this._myVideo = value;
	}
	
	get myVideo()
	{
		return this._myVideo;
	}
	
	render()
	{
		let {message = {}} = this.props,
			{videoModal} = this.state;
		
		return (
			<div className="videoWrap">
				<Video ref={node => this.myVideo = node} poster={message.url} src={message.sourceurl}
				       onPlayPauseClick={this.togglePauseOwn.bind(this)}
				       onFullscreenClick={this.onFullscreenClick.bind(this)}/>
				<i className="icon-xiangxia iconfont" onClick={this.downloadVideo.bind(this)}/>
				{
					videoModal ? this.getVideoModal() : null
				}
			</div>
		)
	}
}

export default VideoMessage;

export let videos = [];

export function allVideo(value)
{
	videos.forEach(v => {
		if(typeof v === "function" && value !== v)
		{
			v();
		}
	})
	
	if(!videos.includes(value))
	{
		videos.push(value);
	}
}
