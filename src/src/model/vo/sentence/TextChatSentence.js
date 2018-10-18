import AbstractChatSentence from './AbstractChatSentence';
import MessageType from '../../../im/message/MessageType';
import { stateToHTML } from 'draft-js-export-html';
import Draft from 'draft-js';
import SmileyDict from "../../../utils/SmileyDict";
import { replaceLink, replaceLinkForText } from "../../../utils/StringUtils";
import { decode } from "../../../components/emojione";

const {convertFromRaw} = Draft;

class TextChatSentence extends AbstractChatSentence {
	
	constructor(message)
	{
		super(message);
		
		this.messageType = MessageType.MESSAGE_DOCUMENT_TXT;
		this.sensitiveWord = [];
	}
	
	serialize()
	{
		return {
			converid: this.sessionID,
			messageid: this.sentenceID,
			createat: this.createTime,
			fromuser: this.userInfo.toWeakObject(),
			message: this.messageBody,
			msgtype: this.messageType,
			status: this.status,
			translate: this.translate
		};
	}
	
	_htmlMessage = "";
	get htmlMessage()
	{
		try
		{
			if(!this.messageBody)
				return "";
			
			if(this._htmlMessage)
				return this._htmlMessage;
			
			let message = this.messageBody, raw;
			
			if(typeof this.messageBody === "string")
			{
				let notJson = (message.indexOf("{") <= -1 || message.lastIndexOf("}") <= -1);
				
				if(notJson)
				{
					this._htmlMessage = this.messageBody.replace(SmileyDict.reg, this._createSmileImg);
					return this._htmlMessage = replaceLinkForText(this._htmlMessage);
				}
				
				raw = JSON.parse(message);
			}
			else
			{
				raw = this.messageBody;
			}
			
			let options = this._dealRaw(raw),
				contentState = convertFromRaw(raw);
			
			this._htmlMessage = stateToHTML(contentState, options);
			
			this.sensitiveWord = ["2", "456"];
			
			this._htmlMessage = this._htmlMessage.replace(SmileyDict.reg, this._createSmileImg)
			.replace(new RegExp(this.sensitiveWord.join("|"), "ig"), this.changeSensitiveWordBgColor);
			
			return this._htmlMessage;
		}
		catch(e)
		{
			console.log("htmlMessage stack = " + e.stack);
		}
		
		return this.messageBody;
	}
	
	get includeImg()
	{
		if(!this._includeImg)
		{
			this._includeImg = this._htmlMessage && this._htmlMessage.indexOf("img") > -1;
		}
		
		return this._includeImg;
	}
	
	_dealRaw(raw)
	{
		let options = {inlineStyles: {}};
		
		if(raw && Array.isArray(raw.blocks))
		{
			let blocks = raw.blocks;
			for(let i = 0, len = blocks.length, block; i < len; i++)
			{
				block = blocks[i];
				
				replaceLink(block, raw);
				this._parseColor(block, options);
			}
		}
		
		return options;
	}
	
	_parseColor(block, options)
	{
		if(!block)
			return block;
		
		let inlineStyleRanges = block.inlineStyleRanges, inlineStyle;
		
		if(Array.isArray(inlineStyleRanges))
		{
			for(let i = 0; i < inlineStyleRanges.length; i++)
			{
				inlineStyle = inlineStyleRanges[i];
				options.inlineStyles[inlineStyle.style] = {style: {color: inlineStyle.style}};
			}
		}
	}
	
	_createSmileImg(text)
	{
		let smileItems = SmileyDict.getSmileItem(text),
			repTxt = "" + text;
		
		smileItems.forEach(item => {
			let tip = item[0],
				fileName = item[2] + ".png",
				imgPath = require("../../../public/images/emoji/" + fileName),
				imgFlg = "<img src='" + imgPath + "' alt='" + tip + "'/>";
			
			repTxt = imgFlg;
			//repTxt = repTxt.replace(item[0], imgFlg);
		});
		
		return repTxt;
	}
	
	changeSensitiveWordBgColor(text)
	{
		return `<span style="background-color: red;color:white;">${text}</span>`;
	}
	
	deserialize(data)
	{
		this.sessionID = data.converid;
		this.sentenceID = data.messageid;
		this.status = data.status;
		this.createTime = data.createat;
		this.userInfo = data.fromuser;
		this.expiredTime = data.expiredtime;
		this.messageBody = decode(data.message);
		
		if(data.toUsers)
		{
			this.toUsers = data.tousers;
		}
	}
}

export default TextChatSentence;