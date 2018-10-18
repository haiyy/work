class KeepAliveMessage {
	sessionid = "";
	
	lastversion = -1; // SDK中最新版本号
	
	constructor()
	{
	}
	
	serialize()
	{
		return {sessionid: this.sessionid, lastversion: this.lastversion};
	}
	
	deserialize(data)
	{
	}
}

export default KeepAliveMessage;