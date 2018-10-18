import { EventEmitter } from "events";
import TextChatSentence from "../vo/sentence/TextChatSentence";
import { urlLoader } from "../../lib/utils/cFetch";
import Settings from "../../utils/Settings";
import AbstractChatSentence from "../vo/sentence/AbstractChatSentence";

//http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=95947443
class TranslateProxy extends EventEmitter {
	
	wrap = [];
	timeoutId = -1;
	static Enabled = TRANSLATE_ENABLED || (1 == TranslateProxy.Enabled2);
	static Enabled2 = "{{TRANSLATE_ENABLED}}";
	static DEST_LANGUAGE = "";
	static LANGUAGE = "";
	
	constructor(props)
	{
		super(props);
		
		this.name = "TranslateProxy";
		this.sendToServer = this.sendToServer.bind(this);
		
	}
	
	/**
	 * @param {Object} message {messageid, message:""}
	 * */
	add(message, delay = true)
	{
		if(!TranslateProxy.Enabled)
			return;
		
		let messageid = "", item = {};
		
		if(message instanceof TextChatSentence)
		{
			messageid = item.messageid = message.sentenceID;
			item.message = message.htmlMessage;
		}
		else
		{
			if(!(message instanceof AbstractChatSentence))
			{
				messageid = item.messageid = message.messageid;
				item.message = message.message;
			}
		}
		
		if(this.timeoutId < 0)
		{
			this.timeoutId = setTimeout(this.sendToServer, 500);
			this.wrap = [];
		}
		
		let index = this.wrap.findIndex(value => value.messageid == messageid);
		
		index > -1 && this.wrap.splice(index, 1);
		
		this.wrap.push(item);
		
		!delay && this.sendToServer();
	}
	
	on(callBack)
	{
		super.on(this.name, callBack)
	}
	
	sendToServer()
	{
		clearTimeout(this.timeoutId);
		this.timeoutId = -1;
		
		if(!TranslateProxy.DEST_LANGUAGE)
		{
			console.log("没有目标翻译 destLanguage is null");
			return;
		}
		
		let translateUrl = Settings.translateUrl();
		
		if(!translateUrl)
		{
			console.log("翻译地址:translateUrl is null");
			return;
		}
		
		urlLoader(translateUrl, {
			body: JSON.stringify({
				"sourceStr": this.wrap, "sourceLanguage": "", "destLanguage": TranslateProxy.DEST_LANGUAGE
			}), method: "post"
		})
		.then(({jsonResult}) => {
			if(jsonResult.code === 200)
			{
				this.emit(this.name, jsonResult.data.sourceStr);
			}
		});
		
		this.wrap = [];
	}
	
	clear()
	{
		this.wrap = [];
		this.removeAllListeners(this.name);
		clearTimeout(this.timeoutId);
		this.timeoutId = -1;
	}
}

export default TranslateProxy;
