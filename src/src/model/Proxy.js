import { EventEmitter } from "events";

class Proxy extends EventEmitter {
	static NAME = 'ProxyName';
	
	constructor(props)
	{
		super(props);
	}
	
	/**
	 * Get the Proxy name
	 *
	 * @return the Proxy instance name
	 */
	getProxyName()
	{
		return this.name;
	}
	
	/**
	 * Called by the Model when the Proxy is registered
	 */
	onRegister()
	{
	
	}
	
	/**
	 * Called by the Model when the Proxy is removed
	 */
	onRemove()
	{
	
	}
}

export default Proxy;

