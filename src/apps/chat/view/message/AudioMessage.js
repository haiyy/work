import React from 'react';
import "../../../../public/styles/chatpage/message/audioMessage.scss";
import { allVideo, videos } from "./VideoMessage";

class AudioMessage extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.playAudio = this.pause.bind(this);
		
		this.interval = -1;
	}
	
	componentWillUnmount()
	{
		let index = videos.findIndex(value => this.playAudio === value);
		index > -1 && videos.splice(index, 1);
	}
	
	pause()
	{
		this.audio.pause();
		
		clearInterval(this.interval);
	}
	
	playAudioOwn()
	{
		allVideo(this.playAudio);
		
		let paused = this.audio.paused,
			audioImg = this.audioImg,
			index = 1,
			{message} = this.props,
			{isKF, isRobot} = message,
			audioImgType,
			allAudioImg = document.getElementsByClassName('audioImg');
		
		clearInterval(this.interval);
		
		if(isKF || isRobot)
		{
			audioImgType = 'blueAudio';
		}
		else
		{
			audioImgType = 'whiteAudio';
		}
		
		if(allAudioImg && allAudioImg.length > 0)
		{
			/*所有的动画变成完整图片*/
			for(let j = 0; j < allAudioImg.length; j++)
			{
				allAudioImg[j].setAttribute('src', require("../../../../public/images/chatPage/" + audioImgType + "3.png"));
			}
		}
		
		if(paused)
		{
			this.interval = setInterval(function() {
				index++;
				if(index > 3)
				{
					index = 1;
				}
				audioImg.setAttribute('src', require("../../../../public/images/chatPage/" + audioImgType + index + ".png"));
			}, 360);
			this.audio.play && this.audio.play();
		}
		else
		{
			audioImg.setAttribute('src', require("../../../../public/images/chatPage/" + audioImgType + "3.png"));
			this.audio.pause && this.audio.pause();
		}
	}
	
	onended()
	{
		let audioImg = this.audioImg,
			{message} = this.props,
			{isKF, isRobot} = message,
			audioImgType;
		
		if(isKF || isRobot)
		{
			audioImgType = 'blueAudio';
		}
		else
		{
			audioImgType = 'whiteAudio';
		}
		
		clearInterval(this.interval);
		
		audioImg.setAttribute('src', require("../../../../public/images/chatPage/" + audioImgType + "3.png"));
	}
	
	render()
	{
		let {message = {}} = this.props,
			{duration = 0} = message,
			{isKF, isRobot} = message,
			audioImgType;
		
		if(duration <= 0)
			duration = 0;
		
		if(isKF || isRobot)
		{
			audioImgType = 'blueAudio';
		}
		else
		{
			audioImgType = 'whiteAudio';
		}
		//crossOrigin="anonymous"
		return (
			<div className="audioWrapper" onClick={this.playAudioOwn.bind(this)}>
				<img className="audioImg" ref={node => this.audioImg = node}
				     src={require("../../../../public/images/chatPage/" + audioImgType + "3.png")}/>
				<span className="audioTime">{duration + "'"}</span>
				<audio className="allAudio" ref={node => this.audio = node} src={message.url} preload="metadata"
				        onEnded={this.onended.bind(this)}/>
			</div>
		)
	}
}

export default AudioMessage;
