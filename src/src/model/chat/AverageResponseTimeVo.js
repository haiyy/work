class AverageResponseTimeVo {
	
	_converId = "";
	
	constructor()
	{
		this._totalTime = 0;  //总响应时长
		this._responseCount = 0;  //回合数
		this._guestSendTime = -1;  //访客发送消息时间
	}
	
	update(sentence)
	{
		if(sentence.bsystem || sentence.isRobot || sentence.sessionID !== this.converId)
			return;
		
		if(sentence.isKF)
		{
			if(this._guestSendTime > 0 && this._guestSendTime < sentence.createTime)
			{
				this._totalTime += sentence.createTime - this._guestSendTime;
				
				this._guestSendTime = -1;
				this._responseCount += 1;
			}
		}
		else
		{
			if(this._guestSendTime <= -1 || sentence.createTime < this._guestSendTime)
			{
				this._guestSendTime = sentence.createTime;
			}
		}
	}
	
	get averageResponseTime()
	{
		if(this._responseCount <= 0)
			return 0;
		
		return parseInt(this._totalTime / (this._responseCount * 1000));
	}
	
	get converId()
	{
		return this._converId;
	}
	
	set converId(value)
	{
		if(value !== this._converId)
		{
			this._totalTime = 0;
			this._responseCount = 0;
			this._guestSendTime = -1;
		}
		
		this._converId = value;
	}
}

export default AverageResponseTimeVo;