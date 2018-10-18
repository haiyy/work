class HandshakeMessage {
	
	token = "";
	device = "";
	ip = "";
	appkey = "";
	userid = "";
	sessionid = "";
	
	constructor()
	{
	}
	
	serialize()
	{
		return {
			token: this.token,
			device: this.device,
			ip: this.ip,
			appkey: this.appkey,
			userid: this.userid,
			sessionid: this.sessionid
		};
	}
	
	deserialize(data)
	{
	}
}

export default HandshakeMessage;