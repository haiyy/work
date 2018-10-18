class ConnectOptions {
	userName = 'ntguest';
	password = 'xiaoneng123';
	invocationContext = null;
	useSSL = false;
	timeout = 10; //单位s
	keepAliveInterval = 180; //单位s
	cleanSession = true;
	mqttVersion = 4;
	
	onSuccess = null;
	onFailure = null;
	ports = [];
	hosts = [];
	willMessage = null;
	
	getOptions()
	{
		return {
			'timeout': this.timeout,
			'userName': this.userName,
			'password': this.password,
			'willMessage': this.willMessage,
			'keepAliveInterval': this.keepAliveInterval,
			'cleanSession': this.cleanSession,
			'useSSL': this.useSSL,
			'invocationContext': this.invocationContext,
			'onSuccess': this.onSuccess,
			'onFailure': this.onFailure,
			'hosts': this.hosts,
			'ports': this.ports,
			'mqttVersion': this.mqttVersion
		};
	}
}

export default ConnectOptions;