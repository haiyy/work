import PooledClass from "../../../lib/utils/PooledClass";

class ResultMessage {
	
	type = -1;
	
	// 处理结果
	result = false;
	
	// 失败原因
	reason = "";
	
	// 扩展内容
	_contentString = "";
	
	constructor()
	{
	}
	
	serialize()
	{
		return {};
	}
	
	deserialize(data)
	{
		if(!data)
			return;
		
		let {result, content, type, reason} = data;
		
		this.result = result;
		this.setContentString(content);  //服务器传值String
		this.type = type;
		this.reason = reason;
	}
	
	setContent(value)
	{
		if(typeof value !== "object")
			return;
		
		this._content = value;
		this.contentString = JSON.stringify(value);
	}
	
	getContent()
	{
		return this._content;
	}
	
	getContentString()
	{
		return this._contentString;
	}
	
	setContentString(value)
	{
		if(typeof value !== "string")
			return;
		
		this._contentString = value;
		this._content = JSON.parse(value);
	}
	
	destroy()
	{
	}
	
	release()
	{
		ResultMessage.release(this);
	}
}

PooledClass.addPoolingTo(ResultMessage, PooledClass.oneArgumentPooler);

export default ResultMessage;