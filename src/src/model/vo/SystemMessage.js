class SystemMessage {
	
	static INFO = 1;  //提示
	static WARN = 2;  //警告
	static ERROR = 3;  //错误
	
	messageBody = "";
	errorType = 1;
	id = -1;
	
	constructor(message, errorType = 1, id = -1)
	{
		this.messageBody = message;
		this.errorType = errorType;
		this.id = id;
	}
	
	toString()
	{
		return "SystemMessage messageBody = " + this.messageBody;
	}
}

export default SystemMessage;