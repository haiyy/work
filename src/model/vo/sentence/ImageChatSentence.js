import AbstractChatSentence from './AbstractChatSentence';
import MessageType from '../../../im/message/MessageType';

class ImageChatSentence extends AbstractChatSentence
{
	_imageUrl = "";
	_sourceUrl = "";
	_dataUrl = "";
	isEmotion = false;
	extension = "png";
	_size = "";

	progress = 1;  //1->成功上传 0->正在上传
	file = null;  //上传Image的File对象
	error = -1;  //error = 20031
	
    constructor(message)
    {
        super(message);
		
		this.messageType = MessageType.MESSAGE_DOCUMENT_IMAGE;
    }
    
    get url()
    {
    	return this.progress === 1 ?  this.imageUrl : this.dataUrl;
    }
	
	get imageUrl()
	{
		return this._imageUrl;
	}
	
	set imageUrl(value)
	{
		this._imageUrl = value;
	}
	
	get size()
	{
		if(!this._size && this.file)
		{
			let tsize = this.file.size/1024;
			return tsize ? tsize.toPrecision(3) + " KB" : "0 KB";
		}
		
		return this._size;
	}
	
	set size(value)
	{
		this._size = value;
	}

	get sourceUrl()
	{
		return this._sourceUrl;
	}
	
	set sourceUrl(value)
	{
		this._sourceUrl = value;
	}

	get dataUrl()
	{
		return this._dataUrl;
	}

	set dataUrl(value)
	{
		this._dataUrl = value;
	}
	
	get fileName()
	{
		return this.messageBody;
	}
	
	serialize()
	{
		let imageData = {
			converid: this.sessionID,
			messageid: this.sentenceID,
			createat:this.createTime,
			fromuser: this.userInfo.toWeakObject(),
			message: this.messageBody,
			msgtype:this.messageType,
			url:this.imageUrl,
			sourceurl:this.sourceUrl,
			status:this.status,
			size:this.size,
			extension:this.extension
		};
		
		if(this.isEmotion)
		{
			imageData.isemotion = this.isEmotion;
		}
		
		return imageData;
	}
	
	deserialize(data)
	{
		this.sessionID = data.converid;
		this.sentenceID = data.messageid;
		this.status = data.status;
		this.createTime = data.createat;
		this.userInfo = data.fromuser;
		this.expiredTime = data.expiredtime;
		this.messageBody = data.message;
		this.imageUrl = data.url;
		this.sourceUrl = data.sourceurl;
		this.size = data.size;
		this.extension = data.extension;
		
		if(data.isemotion)
		{
			this.isEmotion = data.isemotion;
		}
		
		if(data.toUsers)
		{
			this.toUsers = data.tousers;
		}
	}
}

export default ImageChatSentence;
