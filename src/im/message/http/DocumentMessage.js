import PooledClass from "../../../lib/utils/PooledClass";

class DocumentMessage {
	
	versionid = -1;
	
	// 文档消息类型
	type = 11;
	
	_content = null;
	_contentString = "";
	
	constructor()
	{
	
	}
	
	serialize()
	{
		return {
			versionid: this.versionid,
			contentString: this._contentString,
			type: this.type
		};
	}
	
	deserialize(data)
	{
		if(!data)
			return;
		
		let {versionid, contentString} = data;
		
		this.versionid = versionid;
		this.setContentString(contentString);
	}
	
	getContent()
	{
		return this._content;
	}
	
	setContent(value)
	{
		if(typeof value !== "object")
			return;
		
		this._content = value;
		this.contentString = JSON.stringify(value);
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
	
	release()
	{
		DocumentMessage.release(this);
	}
}

PooledClass.addPoolingTo(DocumentMessage, PooledClass.oneArgumentPooler);

export default DocumentMessage;