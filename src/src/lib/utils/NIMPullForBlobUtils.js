import LogUtil from "./LogUtil";
import { urlStreamForTimeout } from "./cFetch";

class NIMPullForBlobUtils {
	_isPulling = false;
	_pullNum = 0;
	_currentVersion = -1;
	timeout = 5000;
	deviceType = "";
	
	constructor()
	{
		this._onError = this._onError.bind(this);
		this._onLoadEnd = this._onLoadEnd.bind(this);
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
			fromate: 1, //0：json格式；1：protobuf格式
			sessionid: this.sessionId,
			from: this.deviceType
		}, opts = {
			body: JSON.stringify(data), method: "post", headers: {"Content-Type": "application/json"}
		};
		
		log("pullMessages start versionId = " + versionId);
		
		urlStreamForTimeout(this.url, opts, 5000)
		.then(({blob, jsonResult}) => {
			this._isPulling = false;
			
			let result = blob,
				isError = (jsonResult && jsonResult.code === 408)
					|| (!blob || blob.error_code === 4001 || blob.error_code === 4000);
			
			log("pullMessages end success = " + isError);
			
			if(isError)
			{
				result = {error: 20033};
			}
			
			this._getHttpCallBack(true, result);
		});
	}
	
	_reader = null;
	
	_getHttpCallBack(success, data)
	{
		if(success)
		{
			this._pullNum = 0;
			
			if(data instanceof Blob)
			{
				this._reader = new FileReader();
				this._reader.addEventListener("onerror", this._onError, false);
				this._reader.addEventListener("loadend", this._onLoadEnd, false);
				this._reader.readAsArrayBuffer(data);
			}
		}
		else
		{
			if(this._pullNum < 1)
			{
				this.pullMessages(this._currentVersion);
				this._pullNum++;
			}
			else
			{
				this._pullNum = 0;
				this.callBack && this.callBack(false, data);
			}
		}
	}
	
	_onError()
	{
		this.removeListener();
		this.callBack(false, {error: 20033});
	}
	
	_onLoadEnd()
	{
		let result = this._reader ? this._reader.result : {error: 20033};
		
		this.removeListener();
		
		this.callBack(true, result);
		this._pullNum = 0;
		this._isPulling = false;
	}
	
	removeListener()
	{
		if(this._reader)
		{
			this._reader.removeEventListener("onerror", this._onError);
			this._reader.removeEventListener("loadend", this._onLoadEnd);
			this._reader = null;
		}
	}
	
	destroy()
	{
		this.removeListener();
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
	LogUtil.trace("NIMPullForBlobUtils", info, log);
}

export default NIMPullForBlobUtils;
