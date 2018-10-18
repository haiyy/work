import React from "react";
import Slider from "rc-slider"
import 'rc-slider/assets/index.css';
import "../view/style/callAudio.less"

class LZ_Audio extends React.Component {

	constructor(props)
	{
		super(props);

		this.state = {
			currentTime: 0,
			sliderValue: 0,
			isPlaying: false,
			isMuted: false,
			autioWidth:200,
		};

		this.onPlay = this.onPlay.bind(this);
		this.onPause = this.onPause.bind(this);
		this.onPause1 = () => this.setState({isPlaying: false})
		this.onMuted = this.onMuted.bind(this)
	}

	componentWillUnmount()
	{
		let index = fns.findIndex(value => value === this.onPause);

		if(index > -1)
		{
			fns.splice(index, 1);
		}
	}

	onPlay(event)
	{


		this.setInterval();

		let {currentTime} = this.state,
			{src} = this.props;

			console.log(src);
		if(src)
		{
			audio.src = src;
			audio.currentTime = currentTime;
			audio.volume = .1;
			audio.play();

			this.setState({isPlaying: true});

			pauseOpration(this.onPause1);

			let index = fns.findIndex(value => value === this.onPause);
			index <= -1 && fns.push(this.onPause1);
		}
	}

	setInterval()
	{
		clearInterval(intervalID);
		intervalID = setInterval(() => {
	
			this.setState({
				currentTime: audio.currentTime,
				duration: audio.duration
			});
			console.log('ok')
			if(audio.currentTime==audio.duration){
				this.setState({
					currentTime:0,
					isPlaying:false
			
				});	
				clearInterval(intervalID);
			}
		}, 1000);
	
	}

	onPause(event)
	{

        audio.pause();
		clearInterval(intervalID);
		this.setState({isPlaying: false});
	}

	onChange(value)
	{
		audio.currentTime = value;
		audio.play()

		this.state.sliderValue = 0;
	}

	getTimeStr(time)
	{
		//分钟
		var minute = time / 60;
		var minutes = parseInt(minute);
		if(minutes < 10)
		{
			minutes = "0" + minutes;
		}
		//秒
		var second = time % 60;
		var seconds = parseInt(second);
		if(seconds < 10)
		{
			seconds = "0" + seconds;
		}

		return "" + minutes + "" + ":" + "" + seconds + ""

	}

	onMuted()
	{
		let {isMuted} = this.state;
		this.setState({
			isMuted: !isMuted,
		})
		audio.muted = !isMuted;
	}

	onBeforeChange()
	{
		this.setState({sliderValue: this.state.currentTime});
	}

    onstopPropag(event){
        event.stopPropagation();
    }
    
    onInitCurrentTime(){
        this.setState({
            currentTime:0,
            isPlaying:false
        })
	}
	
	callAudioTime(){
		let {isPlaying,currentTime,duration} = this.state,
			TimeContent=null;

		if(isPlaying || duration > 0){
			return TimeContent= (
				<div className="callAudio-Time">
				<span className="lz-current-time">{this.getTimeStr(currentTime || 0)}</span>
				<span className="lz-pause-btn">{"/"}</span>
				<span className="lz-duration">{this.getTimeStr(duration || 0)}</span>
			</div>
			)
		}
		
		return TimeContent;
	}

	render()
	{
		let {duration, currentTime, sliderValue, isPlaying, isMuted,autioWidth} = this.state,
			valueProps = !sliderValue ? {value: currentTime} : {},
			{sliderStyle} = this.props;
			
			autioWidth=isPlaying || duration>0?258:200;

		sliderStyle = sliderStyle || {};
		return (
			<div className="callAudio" style={{width:`${autioWidth}px`,marginBottom:5}} onClick={this.onstopPropag.bind(this)}>
				{
					!isPlaying ?
						<i className={`${!isPlaying ? 'callAudio-startType' : null} ${'iconfont icon-start callAudio-Start'}`}
						   onClick={this.onPlay}/> : null
				}
				{
					isPlaying ?
						<i className={`${isPlaying ? 'callAudio-zantingType' : null} ${'iconfont icon-zanting callAudio-Start'}`}
						   onClick={this.onPause}/> : null
				}
				<Slider ref={node => this.slider = node}
				        className={`${'callAudio-Slider'}`}
				        min={0} max={duration || 1} {...valueProps}
				        {...sliderStyle}
				        onBeforeChange={this.onBeforeChange.bind(this)}
				        onAfterChange={this.onChange.bind(this)}/>
				{
					this.callAudioTime()
				}
				<i className={`${isMuted ? 'callAudio-mutedType' : null} ${'iconfont icon-jingyin1  callAudio-Jingyin'}`}
				   onClick={this.onMuted}/>
            
			</div>
		);
	}
}

export default LZ_Audio;

export var audio = new Audio();

let fns = [];

function pauseOpration(fn)
{

	fns.forEach(value => {
		if(value !== fn && typeof value === "function")
		{
			value()
		}
	});
}

let intervalID = -1;



