class SubscribeOptions {
	getOptions()
	{
		return {
			'qos': this.qos,
			'invocationContext': this.invocationContext,
			'timeout': this.timeout,
			'onSuccess': this.onSuccess,
			'onFailure': this.onFailure
		};
	}
	
	qos = 1;
	invocationContext = null;
	onSuccess = null;
	onFailure = null;
	timeout = 6;
}

export default SubscribeOptions;