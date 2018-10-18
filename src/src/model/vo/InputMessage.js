import UsualTips from "../../apps/chat/view/aside/UsualTips";
import PooledClass from "../../lib/utils/PooledClass";

class InputMessage {
	
	type = UsualTips.TEXT_TYPE;
	_content = "";  // String || JSON
	forceSend = false;
	
	constructor(type, content, forceSend = false)
	{
		this.type = type;
		this.content = content;
		this.forceSend = forceSend;
	}
	
	get content()
	{
		return this._content;
	}
	
	set content(value)
	{
		if(this.type !== UsualTips.TEXT_TYPE && typeof value === "string")
		{
			this._content = JSON.parse(value);
		}
		else
		{
			this._content = value;
		}
	}
	
	get imgUrl()
	{
		if(this._content)
		{
			return this._content.imgUrl || "";
		}
		
		return "";
	}
	
	get imgName()
	{
		if(this._content)
		{
			return this._content.imgName || "";
		}
		
		return "";
	}
	
	get fileUrl()
	{
		if(this._content)
		{
			return this._content.fileUrl || "";
		}
		
		return "";
	}
	
	get fileName()
	{
		if(this._content)
		{
			return this._content.fileName || "";
		}
		
		return "";
	}
	
	get size()
	{
		if(this._content)
		{
			return this._content.size || 0;
		}
		
		return 0;
	}
}

PooledClass.addPoolingTo(InputMessage, PooledClass.fourArgumentPooler);

export default InputMessage;