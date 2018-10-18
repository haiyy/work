import React from 'react';
import  { formatTime } from "../utils/MyUtil";

/*计时器组件*/
class Timer extends React.PureComponent {
	
	static COUNT_DOWN = 2;
	static COUNT_UP = 1;
	
	_onTimer;
	_onTimerComplete;
	
	constructor(props)
	{
		super(props);
		
		this.date = this.props.date > 0 ? this.props.date : 0;
		this.mode = this.props.mode;
		this._onTimer = this.props.onTimer;
		this._onTimerComplete = this.props.onTimerComplete;
		
		this.state = {
			remainTime: formatTime(this.date)
		};
		
		this.runTimer();
	}
	
	componentWillReceiveProps(nextProps)
	{
		let nextDate = nextProps.date;
		if(nextDate !== undefined)
		{
			this.date = nextDate > 0 ? nextDate : 0;
		}
	}
	
	runTimer()
	{
		if(this.timerKey)
			return;
		
		this.timerKey = Symbol("Timer");
		
		addTimer(this.timerKey, () =>
		{
			
			this.mode === Timer.COUNT_DOWN ? this.date-- : this.date++;
			
			if(typeof this._onTimer === "function")
			{
				this._onTimer();
			}
			
			if(this.date <= 0)
			{
				if(typeof this._onTimerComplete === "function")
				{
					this._onTimerComplete();
				}
			
				this.stop();
				
				this.date = 0;
			}
			
			this.setState({
				remainTime: formatTime(this.date)
			});
		});
	}
	
	stop()
	{
		removeTimer(this.timerKey);
	}
	
	componentWillUnmount()
	{
		this.stop();
	}
	
	render()
	{
		return <span style={this.props.style}> {this.state.remainTime} </span>;
	}
}

let timerExe = new Map(),
	index,  //setInterval返回的索引
	interval = 1000,
	running = false;

/**
 * 自行启动定时器，不需要外部调用
* */
function start()
{
	if(running)
		return;
	
	index = setInterval(exeTimer, interval);
	
	running = true;
}

/**
 * 停止所有定时，不需要外部调用
 * */
function stop()
{
	clearInterval(index);
	timerExe.clear();
	running = false;
}

/**
 * 添加定时器
 * @param {Function} exeFuc
 * */
function addTimer(key, exeFuc)
{
	if(!exeFuc || !key)
		return;
	
	if(!running)
	{
		start();
	}
	
	timerExe.set(key, exeFuc);
}

/**
 * 移除定时器
 * */
function removeTimer(key)
{
	if(timerExe.has(key))
	{
		timerExe.delete(key);
	}
	
	if(timerExe.size <= 0)
	{
		stop();
	}
}

function exeTimer()
{
	timerExe.forEach(every);
}

function every(value)
{
	if(typeof value === "function")
	{
		value();
	}
}

export default Timer;
