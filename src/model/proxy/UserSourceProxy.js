import Proxy from "../Proxy";

class UserSourceProxy extends Proxy {
	
	static NAME = 'UserSourceProxy';
	
	_userSource = {};
	constructor()
	{
		super();
		
		this.name = UserSourceProxy.NAME;
	}
	
	/**
	 * 更新访客来源
	 * @param Array value
	 * @param Boolean isCover
	 * */
	update(value, isCover = false)
	{
		if(!Array.isArray(value) || value.length <= 0)
			return;
		
		for (let i = 0, len = value.length, item; i < len; i++)
		{
			item = value[i];
			
			if(item)
			{
				if(this._userSource[item.ename])
				{
					if(isCover)
						this._userSource[item.ename] = item;
				}
				else
				{
					this._userSource[item.ename] = item;
				}
			}
		}
	}
	
	getSourceItem(key)
	{
		if(!this._userSource)
			return null;
		
		return this._userSource[key];
	}
}

export default UserSourceProxy;
