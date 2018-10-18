import LogUtil from "./LogUtil";
import { urlLoaderForTimeout } from "./cFetch";

class NIMPullForJSONUtils {
	_isPulling = false;
	_pullNum = 0;
	_currentVersion = -1;
	deviceType = "";
	
	constructor()
	{
	}
	
	/**
	 *拉取当前版本的消息
	 *@param versionId int 当前消息版本号
	 */
	pullMessages(versionId)
	{
		log("pullMessages versionId = " + versionId);
		
		if(this._isPulling)
			return;
		
		this._isPulling = true;
		this._currentVersion = versionId;
		
		let data = {
			userid: this.userid,
			versionid: versionId,
			fromate: 0, //0：json格式；1：protobuf格式
			sessionid: this.sessionId,
			from: this.deviceType
		}, opts = {
			body: JSON.stringify(data),
			method: "post",
			headers: {"Content-Type": "application/json"}
		};
		
		log("pullMessages start versionId = " + versionId);
		
		urlLoaderForTimeout(this.url, opts, "application/json; charset=UTF-8", 5000)
		.then(({jsonResult}) => {
			this._isPulling = false;
			
			let {code, data} = jsonResult,
				success = code === 200;
			
			log("pullMessages end success = " + success);
			
			this._getHttpCallBack && this._getHttpCallBack(success, data, this.sessionId, code);
		});
		
		//------------------修复fetch在IE8下不返回结果的BUG-------------------
		clearTimeout(this.timeoutID);
		
		this.timeoutID = setTimeout(() => {
			this._isPulling = false;
		}, 5000);
		//------------------end-------------------
	}
	
	_getHttpCallBack(success, data, sessionId, code)
	{
		if(success)
		{
			this._pullNum = 0;
			
			this.callBack(true, data);
		}
		else
		{
			if(this._pullNum < 1 && code != "2001")//会话版本号不为失效 2018-09-19
			{
				this.pullMessages(this._currentVersion);
				this._pullNum++;
			}
			else
			{
				this._pullNum = 0;
				this.callBack(false, data, sessionId, code);
			}
		}
	}
	
	destroy()
	{
		this.callBack = null;
		this.url = "";
		this.userid = "";
		this.sessionId = "";
	}
	
	callBack = null;
	
	url = "";
	userid = "";
	sessionId = "";
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("NIMPullForJSONUtils", info, log);
}

export default NIMPullForJSONUtils;
