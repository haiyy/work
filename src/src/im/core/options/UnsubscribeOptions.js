class UnsubscribeOptions {
	
	getOptions()
	{
		return {
			'invocationContext': this.invocationContext,
			'timeout': this.timeout,
			'onSuccess': this.onSuccess,
			'onFailure': this.onFailure
		};
	}
	
	invocationContext = null;
	
	onSuccess = function() {
		
	};
	
	onFailure = function() {
		
	};
	
	timeout = 0;
}

export default UnsubscribeOptions;