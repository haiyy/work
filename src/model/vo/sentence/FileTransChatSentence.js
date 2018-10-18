import AbstractChatSentence from './AbstractChatSentence';
import MessageType from "../../../im/message/MessageType";
import { getFileSize } from "../../../utils/MyUtil";

class FileTransChatSentence extends AbstractChatSentence {
	url = null;
	extension = null;
	progress = 1;  //1->成功上传 0->正在上传
	file = null;  //上传Image的File对象
	error = "";  //error = 20031
	_size = "";
	
	constructor(message)
	{
		super(message);
		
		this.messageType = MessageType.MESSAGE_DOCUMENT_FILE;
	}
	
	get size()
	{
		let tsize = this._size;
		if(!this._size && this.file)
		{
			tsize = this.file.size;
		}
		
		return getFileSize(tsize);
	}
	
	set size(value)
	{
		this._size = value;
	}
	
	serialize()
	{
		let fileData = {
			converid: this.sessionID,
			messageid: this.sentenceID,
			createat: this.createTime,
			fromuser: this.userInfo.toWeakObject(),
			message: this.messageBody,
			msgtype: this.messageType,
			status: this.status,
			size: this._size,
			url: this.url,
			extension: this.extension
		};
		
		return fileData;
	}
	
	get fileName()
	{
		return this.messageBody;
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
		this.url = data.url;
		this.size = data.size;
		this.extension = data.extension;
		
		if(data.toUsers)
		{
			this.toUsers = data.tousers;
		}
	}
}

export default FileTransChatSentence;
