class UserStatus
{
	static OFFLINE = 0;
	static AVAILABLE = 1;
	static INVISIBLE = 2;
	static BUSY = 3;
	static AWAY = 4;
	static LOGGING = 5;
	
	static getLabel(value)
	{
		let label = null;
		
		switch(value)
		{
			case UserStatus.AVAILABLE:
				label = available_label;
				break;
			
			case UserStatus.AWAY:
				label = away_label;
				break;
			
			case UserStatus.BUSY:
				label = busy_label;
				break;
			
			case UserStatus.INVISIBLE:
				label = invisible_label;
				break;
			
			case UserStatus.OFFLINE:
				label = offline_label;
				break;
			
			case UserStatus.LOGGING:
				label = logging_label;
				break;
		}
		
		return label;
	}
}

let available_label = "在线",
	busy_label = "忙碌",
	away_label = "离开",
	invisible_label = "隐身",
	offline_label = "离线",
	logging_label = "登录中";

export default UserStatus;