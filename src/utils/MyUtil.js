/**
 * 获取有效链接地址
 * @example
 * sourceUrl https://xiaoneng.com?token=###token###
 * ==> https://xiaoneng.com?token=1234
 * @param {String} sourceUrl
 * @return String
 * */
import React from 'react';
import Model from "./Model";
import md5 from "md5";
import { zeroFill, createMessageId } from "../lib/utils/Utils";
import { urlLoader, urlLoaderForTimeout } from "../lib/utils/cFetch";
import MessageType from "../im/message/MessageType";
import LogUtil from "../lib/utils/LogUtil";
import TextChatSentence from "../model/vo/sentence/TextChatSentence";
import SystemSentence from "../model/vo/sentence/SystemSentence";
import AudioChatSentence from "../model/vo/sentence/AudioChatSentence";
import ImageChatSentence from "../model/vo/sentence/ImageChatSentence";
import FileTransChatSentence from "../model/vo/sentence/FileTransChatSentence";
import SeparationSentence from "../model/vo/sentence/SeparationSentence";
import VideoChatSentence from "../model/vo/sentence/VideoChatSentence";
import HyperMediaChatSentence from "../model/vo/sentence/HyperMediaChatSentence";
import NtalkerEvent from "../apps/event/NtalkerEvent";
import LoginUserProxy from "../model/proxy/LoginUserProxy";
import Settings from "./Settings";
import DeviceType from "../model/vo/DeviceType";
import UserSourceProxy from "../model/proxy/UserSourceProxy";
import VersionControl from "./VersionControl";
import { sendToMain } from "../core/ipcRenderer";
import Channel from "../model/vo/Channel";
import LoadProgressConst from "../model/vo/LoadProgressConst";
import ConfigProxy from "../model/proxy/ConfigProxy";
import { ntalkerListRedux, serverTimeGap } from "./ConverUtils";
import GlobalEvtEmitter from "../lib/utils/GlobalEvtEmitter";
import { truncateToFit } from "./StringUtils";
import Lang from "../im/i18n/Lang";
import { name } from "../../package.json";
import Loading from "../components/xn/loading/Loading";

let _configProxy = null;

export function configProxy()
{
	if(!_configProxy)
	{
		_configProxy = Model.retrieveProxy(ConfigProxy.NAME)
	}
	
	return _configProxy;
}

export function loginUserProxy()
{
	return Model.retrieveProxy(LoginUserProxy.NAME)
}

export function token()
{
	return loginUserProxy().ntoken;
}

let _userSourceProxy = null,
	_source = {"ename": "input", "cname": "直接输入", "source_logo": "input", "wap_logo": "inputwap"};

export function getSource(key)
{
	if(!_userSourceProxy)
	{
		_userSourceProxy = Model.retrieveProxy(UserSourceProxy.NAME);
	}
	
	let source = _userSourceProxy.getSourceItem(key);
	if(!source)
	{
		source = _source;
	}
	
	return source;
}

export function getSourceUrl(userInfo)
{
	if(!userInfo || !userInfo.usertrail)
		return "icon-input";
	
	let userTail = userInfo.usertrail,
		deviceType = userTail.tml,
		source = userTail.source;
	
	return getSourceForDevice(source, deviceType);
}

export function getSourceForDevice(source, device)
{
	let deviceType = device,
		userSource, url;
	
	deviceType = deviceType ? deviceType : "web";
	
	if(deviceType === DeviceType.PC || deviceType === DeviceType.WAP)
	{
		userSource = getSource(source);
	}
	else
	{
		userSource = getSource(DeviceType.getDevicetype(deviceType));
	}
	
	if(userSource)
	{
		if(deviceType === DeviceType.PC)
		{
			url = userSource.source_logo;
		}
		else
		{
			url = userSource.wap_logo;
		}
		
		if(!url)
			return "icon-input";
		
		if(url.indexOf("http") >= 0)
			return url;
		
		return ("icon-" + url) || "icon-input";
	}
	
	return "icon-input";
}

export function loginUser()
{
	let loginUserProxy = Model.retrieveProxy(LoginUserProxy.NAME);
	return loginUserProxy.loginUser;
}

const guestParamsMap = {
	"###UID###": "userId",
	"###UNAME###": "userName",
	"###IP###": "ip",
	"###COUNTRY###": "country",
	"###PROVINCE###": "province",
	"###CITY###": "city",
	"###DEVICETYPE###": "tml",
	"###EXTERINFO###": "exterinfo",
	"###SETTINGID###": "settingid",
};

const kfParamsMap = {
	"###TOKEN###": "ntoken",
	"###KFUSERID###": "userId",
	"###SITEID###": "siteId",
};

const converParamsMap = {
	"###SETTINGID###": "settingid",
	"###SESSIONID###": "sessionId",
	"###ERPPARAM###": "erpparam",
};

export function getWorkUrl(sourceUrl, guestUserInfo = null, chatData = null)
{
	if(!sourceUrl || sourceUrl.length < 0)
		return "";
	
	let workUrl = sourceUrl;
	
	workUrl = replaceForWorkUrl(workUrl, kfParamsMap, loginUserProxy());
	
	if(guestUserInfo)
	{
		workUrl = replaceForWorkUrl(workUrl, guestParamsMap, guestUserInfo);
	}
	
	if(chatData && chatData.chatDataVo)
	{
		workUrl = replaceForWorkUrl(workUrl, converParamsMap, chatData.chatDataVo);
	}
	
	return workUrl;
}

function replaceForWorkUrl(url, map, data)
{
	for(let key in map)
	{
		let param = map[key];
		if(data[param] && url.indexOf(key) > -1)
		{
			url = url.replace(key, data[param]);
		}
	}
	
	return url;
}

/**
 * 获取访客有效链接地址
 * @example
 * sourceUrl https://xiaoneng.com?token=###token###
 * ==> https://xiaoneng.com?token=1234
 * @param {String} sourceUrl
 * @param {UserInfo} userInfo
 * @param {Array} options [{replacer:"", content:""}]
 * @return String
 * */
export function getFKWorkUrl(sourceUrl, userInfo, options = [])
{
	if(!sourceUrl || !userInfo)
		return "";
	
	const {userId} = userInfo,
		fkuserIdReplacer = "###USERID###";
	
	let workUrl = sourceUrl;
	
	if(workUrl.indexOf(fkuserIdReplacer) > -1)
	{
		workUrl = workUrl.replace(fkuserIdReplacer, userId);
	}
	
	options.forEach(({replacer, content}) => {
		if(replacer && workUrl.indexOf(replacer) > -1)
		{
			workUrl = workUrl.replace(replacer, content);
		}
	});
	
	return getWorkUrl(workUrl);
}

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * inlined Object.is polyfill to avoid requiring consumers ship their own
 * https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is
 */
function is(x, y)
{
	// SameValue algorithm
	if(x === y)
	{
		// Steps 1-5, 7-10
		// Steps 6.b-6.e: +0 != -0
		// Added the nonzero y check to make Flow happy, but it is redundant
		return x !== 0 || y !== 0 || 1 / x === 1 / y;
	}
	else
	{
		// Step 6.a: NaN == NaN
		return x !== x && y !== y;
	}
}

window.shallowEqual = shallowEqual;

/**
 * Performs equality by iterating through keys on an object and returning false
 * when any key has values which are not strictly equal between the arguments.
 * Returns true when the values of all keys are strictly equal.
 * @param {Object} objA
 * @param {Object} objB
 * @param {Boolean} isAll 是否完整比较
 * @return {Boolean} 是否相同
 */
export function shallowEqual(objA, objB, isAll = false, deep = -1)
{
	if(is(objA, objB))
		return true;
	
	if(typeof objA !== 'object' || objA === null || typeof objB !== 'object' || objB === null)
		return false;
	
	let keysA = Object.keys(objA),
		keysB = Object.keys(objB);
	
	if(keysA.length !== keysB.length)
		return false;
	
	let comparefn = (isAll && deep > 0) ? shallowEqual : is;
	
	deep--;
	
	// Test for A's keys different from B.
	for(let i = 0; i < keysA.length; i++)
	{
		if(!hasOwnProperty.call(objB, keysA[i]) || !comparefn(objA[keysA[i]], objB[keysA[i]], isAll, deep))
		{
			return false;
		}
	}
	
	return true;
}

export function zeroFillTo2(number)
{
	return zeroFill(number, 2);
}

/**
 * 毫秒数转化为hh:mm:ss >24小时显示超过24小时
 */
export function getFormatTime(interval = 0, need = false)
{
	interval = parseInt(interval / 1000);
	if(!interval || interval == 0)
	{
		return need ? "" : "00:00:00";
	}
	
	if(interval <= 0)
	{
		return need ? "" : "00:00:00";
	}
	
	let hours = Math.floor(interval / 3600),  //取得剩余小时数 60 * 60
		minutes = parseInt(interval / 60) % 60,  //取得剩余分钟数
		seconds = interval % 60;  //取得剩余秒数
	
	if(hours > 24)
	{
		return "超过24小时";
	}
	else
	{
		if(hours == 0)
		{
			hours = "00";
		}
		else if(hours < 10)
		{
			hours = "0" + hours;
		}
		
		if(minutes == 0)
		{
			minutes = "00";
		}
		else if(minutes < 10)
		{
			minutes = "0" + minutes;
		}
		
		if(seconds == 0)
		{
			seconds = "00";
		}
		else if(seconds < 10)
		{
			seconds = "0" + seconds;
		}
		return hours + ":" + minutes + ":" + seconds;
	}
}

window.formatTimestamp = formatTimestamp;

/**
 * 格式化时间戳
 * @param {Date} timestamp  Date or number
 * @return
 * @example
 * 2016-11-25 10:03:00 or 10:03:30
 * */
export function formatTimestamp(timestamp, isShowToday = false, noTime = false)
{
	if(!timestamp)
		timestamp = new Date();
	
	if(typeof timestamp === "number")
	{
		timestamp = new Date(timestamp);
	}
	
	if(!timestamp instanceof Date)
		return;
	
	if(!timestamp.getFullYear)
		return timestamp;
	
	let now = new Date(),
		year = timestamp.getFullYear(),
		month = timestamp.getMonth() + 1,
		day = timestamp.getDate(),
		
		//判断是不是当天
		notToday = (day != now.getDate() || month != (now.getMonth() + 1) || year != now.getFullYear());
	
	if(notToday || isShowToday)
	{
		let t = zeroFillTo2(timestamp.getHours()) + ":" + zeroFillTo2(timestamp.getMinutes()) + ":" + zeroFillTo2(timestamp.getSeconds())
		if(noTime)
		{
			//"YYYY-MM-DD"
			return t;
		}
		
		//"YYYY-MM-DD JJ:NN:SS"
		return year + "-" + zeroFillTo2(month) + "-" + zeroFillTo2(day) + " " + t;
	}
	else
	{
		//"JJ:NN:SS"
		return zeroFillTo2(timestamp.getHours()) + ":" + zeroFillTo2(timestamp.getMinutes()) +
			":" + zeroFillTo2(timestamp.getSeconds());
	}
	
	return "";
}

/**
 * 格式化时间(s) Dur
 * */
export function formatTime(interval, sep = false, omit = false)
{
	if(interval <= -1 || typeof interval !== "number")
		return "";
	
	let days = Math.floor(interval / (3600 * 24)),
		hours = Math.floor((interval - days * 3600 * 24) / 3600),  //取得剩余小时数 60 * 60
		minutes = parseInt(interval / 60) % 60,  //取得剩余分钟数
		seconds = interval % 60,  //取得剩余秒数
		dsep = ":",
		hsep = ":",
		msep = ":",
		ssep = "";
	
	if(days > 0)
	{
		if(sep)
		{
			dsep = "天";
			hsep = "时";
		}
		else
		{
			hsep = ""
		}
		
		return zeroFillTo2(days) + dsep + zeroFillTo2(hours) + hsep;
	}
	else if(hours > 0)
	{
		if(sep)
		{
			hsep = "时";
			msep = "分";
			ssep = "秒";
		}
		else
		{
			msep = ":"
		}
		
		return zeroFillTo2(hours) + hsep + zeroFillTo2(minutes) + msep + zeroFillTo2(seconds) + ssep;
	}
	else
	{
		if(sep)
		{
			msep = "分";
			ssep = "秒";
		}
		else
		{
			ssep = "";
		}
		
		if(omit)
		{
			if(minutes <= 0)
			{
				return seconds + ssep;
			}
		}
		
		return zeroFillTo2(minutes) + msep + zeroFillTo2(seconds) + ssep;
	}
}

/**
 * 获取文件大小
 * @param {String} value
 * */
export function getFileSize(value)
{
	let mSize = Math.floor(value / (1024 * 1024)),
		kbSize = Math.floor(value / 1024);
	
	if(mSize > 0)
	{
		return (value / (1024 * 1024)).toFixed(2) + " M";
	}
	else if(kbSize > 0)
	{
		return (value / 1024).toFixed(2) + " KB";
	}
	else
	{
		return value + " b";
	}
}

export function formatTimes(value)
{
	let hours = parseInt((value % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
		minutes = parseInt((value % (1000 * 60 * 60)) / (1000 * 60)),
		seconds = parseInt((value % (1000 * 60)) / 1000),
		times = "00" + " : " + "00" + " : " + "00";
	
	if(value > 0)
	{
		times = zeroFillTo2(hours) + " : " + zeroFillTo2(minutes) + " : " + zeroFillTo2(seconds)
	}
	
	return times;
}

/**
 * 加密生成md5
 * */
export function ntMd5(pwd)
{
	if(!pwd)
		return "";
	
	return md5(pwd);
}

/**
 * 创建消息
 * @param {Object} body 消息体
 * @param {int} msgType 消息类型
 * @param {UserInfo} userInfo 发送者
 * @return
 * @example
 * msgType == MessageType.MESSAGE_DOCUMENT_TXT
 * body == messageBody
 * @return
 * @example
 * msgType == MessageType.MESSAGE_DOCUMENT_IMAGE
 * body == [sourceUrl, imageurl]
 * */
export function createSentence(body, msgType, userInfo = null, translate = "")
{
	try
	{
		let sentence;
		switch(msgType)
		{
			case MessageType.MESSAGE_DOCUMENT_TXT:
			case MessageType.MESSAGE_DOCUMENT_RICH_MEDIA:
				sentence = new TextChatSentence();
				sentence.messageType = msgType;
				if(typeof body !== "string" && body.msgtype)
					sentence.deserialize(body);
				else
				{
					translate && (sentence.translate = translate);
					sentence.messageBody = body;
				}
				break;
			
			case MessageType.MESSAGE_DOCUMENT_IMAGE:
				sentence = new ImageChatSentence();
				createImageOrFileSentence(sentence, body);
				break;
			
			case MessageType.MESSAGE_DOCUMENT_AUDIO:
				sentence = new AudioChatSentence();
				sentence.deserialize(body);
				break;
			
			case MessageType.MESSAGE_DOCUMENT_VIDEO:
				sentence = new VideoChatSentence();
				sentence.deserialize(body);
				break;
			
			case MessageType.MESSAGE_DOCUMENT_FILE:
				sentence = new FileTransChatSentence();
				createImageOrFileSentence(sentence, body);
				break;
			
			case MessageType.MESSAGE_DOCUMENT_HYPERMEDIA:
				sentence = new HyperMediaChatSentence();
				sentence.deserialize(body);
				break;
			
			case MessageType.MESSAGE_DOCUMENT_SEPARATION:
				sentence = new SeparationSentence();
				sentence.deserialize(body);
				break;
			
			case MessageType.MESSAGE_DOCUMENT_COMMAND:
				sentence = new SystemSentence();
				sentence.deserialize(body);
				break;
			
			default:
				return null;
			
		}
		
		if(!sentence.sentenceID)
		{
			sentence.sentenceID = createMessageId();
			sentence.createTime = new Date().getTime() - serverTimeGap();
		}
		
		if(userInfo)
		{
			sentence.userInfo = userInfo;
		}
		
		return sentence;
	}
	catch(e)
	{
		log("createSentence stack: " + e.stack);
	}
	
	return null;
}

function createImageOrFileSentence(sentence, body)
{
	if(!body)
		return;
	
	sentence.createTime = new Date().getTime() - serverTimeGap();
	
	if(body.file)
	{
		sentence.file = body.file;
		sentence.error = body.error;
		sentence.progress = body.progress;
		sentence.messageBody = sentence.file.name;
		sentence.sentenceID = "P" + body.file.uid;
	}
	else if(body.dataUrl)
	{
		sentence.dataUrl = body.dataUrl;
		sentence.progress = body.progress;
		sentence.error = body.error;
		sentence.messageBody = body.name;
		sentence.sentenceID = body.id;
	}
	else
	{
		sentence.deserialize(body);
	}
	
	if(body.loadData)
	{
		let loadData = body.loadData;
		if(loadData.type == 4)  //文件
		{
			sentence.url = loadData.url;
		}
		else if(loadData.type == 2)  //图片
		{
			sentence.imageUrl = loadData.url;
			sentence.sourceUrl = loadData.sourceurl;
		}
		
		sentence.size = loadData.size;
		sentence.messageBody = loadData.oldfile;
		sentence.extension = loadData.extension;
	}
}

/**
 * 发布APPEvent
 * @param data 消息体
 * @example
 * data = {listen:event,content:...}
 * @return
 * @example
 * data = APPEvent.USER_CHANGED
 * */
export function sendAppEvent(data)
{
	GlobalEvtEmitter.emit(NtalkerEvent.APP, data);
}

/**
 * 发布SessionEvent
 * @param data 消息体
 * @example
 * data = {listen:event,params:[]}
 * @return
 * */
export function sendT2DEvent(data)
{
	GlobalEvtEmitter.emit(NtalkerEvent.T2D, data);
}

/**
 * 获取登录code
 * */
export function getLoginCode()
{
	let loginCodeUrl = Settings.getLoginCodeUrl();
	
	log("getLoginCode getLoginCodeUrl = " + loginCodeUrl);
	
	return urlLoader(loginCodeUrl, {}, "application/json; charset=UTF-8", 1)
	.then(({jsonResult}) => {
		let {code, data} = jsonResult,
			success = code === 200,
			result = {success};
		
		log("getLoginCode getLoginCodeUrl = " + loginCodeUrl + ", success = " + success);
		
		if(success)
		{
			let loginUserProxy = Model.retrieveProxy(LoginUserProxy.NAME);
			loginUserProxy.loginCode = data.code;
			loginUserProxy.loginCodeKey = data.key;
		}
		
		return Promise.resolve(result);
	})
}

export let UPLOAD_IMAGE_ACTION = "/file/image";
export let UPLOAD_FILE_ACTION = "/file/all";

/**
 * 上传图片或文件
 * @param {File} or {Blob} file　文件内容
 * @param {String} action　上传图片还是文件 UPLOAD_IMAGE_ACTION or UPLOAD_FILE_ACTION
 * @return Promise.then()
 * */
export function upload(file, action = "/file/all", isBase64 = false)
{
	log(["upload file = ", JSON.stringify(file), ", action = " + action]);
	
	let formData = new FormData(),
		uploadUrl = Settings.getUploadUrl() + action;
	
	formData.append("path", "/client");
	
	if(isBase64)
	{
		formData.append("base64String", file);
	}
	else
	{
		formData.append("file", file);
	}
	
	return urlLoader(uploadUrl, {
		body: formData,
		method: "post"
	}, "");
}

export function uploadShortCut(dataUrl, chatData)
{
	let tChatData = chatData,
		id = createMessageId(),
		name = id + ".png";
	
	if(tChatData && dataUrl)
	{
		tChatData.addSentenceToOutput(createSentence({
			id, dataUrl, progress: 0, error: "", name
		}, MessageType.MESSAGE_DOCUMENT_IMAGE));
		
		upload(dataUrl, UPLOAD_IMAGE_ACTION)
		.then((res) => {
			log(["uploadShortCut upload res = ", JSON.stringify(res)]);
			
			let jsonResult = res.jsonResult;
			
			if(!jsonResult)
			{
				//未知错误
				return;
			}
			
			tChatData.sendMessage(createSentence({
				id, dataUrl, progress: 1, error: "", name, loadData: jsonResult
			}, MessageType.MESSAGE_DOCUMENT_IMAGE));
		});
	}
}

/**
 * 调用组件方法
 * @param {String} componentName 组件名
 * @param {String} methodName 方法名
 * @param {Array} params 参数
 * @return Boolean
 * @example
 * setProperty.call(this, componentName, methodName, value);
 * */
export function callComponentMethod(componentName, methodName, params)
{
	let component = this.refs[componentName];
	
	if(component)
	{
		let realComponent = returnRealComponent(component);
		
		if(typeof realComponent[methodName] === "function")
		{
			realComponent[methodName](...params);
			return true;
		}
	}
	
	return false;
}

/**
 * 设置组件的属性值
 * @param {String} componentName 组件名
 * @param {String} propertyName 属性名
 * @param {String} propertyValue 属性值
 * @return void
 * @example
 * setProperty.call(this, componentName, propertyName, value);
 * */
export function setProperty(componentName, propertyName, value)
{
	let component = this.refs[componentName];
	
	if(component)
	{
		let realComponent = returnRealComponent(component);
		
		realComponent[propertyName] = value;
	}
}

function returnRealComponent(component)
{
	if(component.constructor.name !== "Connect")
	{
		return component;
	}
	else
	{
		let refs = component.refs;
		if(refs && refs["wrappedInstance"])
		{
			let realComponent = refs["wrappedInstance"];
			
			return realComponent ? realComponent : component;
		}
	}
	
	return component;
}

/**
 * 数据加载（进度）
 * @param token ""
 * */
export function getLoadData(url, body = null, method = "get", token = null, count = 1, noHead = false)
{
	let headers;
	if(!noHead)
	{
		if(!token && loginUserProxy().ntoken)
			headers = {token: loginUserProxy().ntoken};
	}
	
	if(token)
	{
		headers = token;
	}
	
	log("getLoadData url = " + url);
	
	return urlLoader(url, {
		method,
		body,
		headers
	})
	.then((res) => {
		let jsonResult = res.jsonResult,
			result = jsonResult;
		
		if(jsonResult.code !== 200 && jsonResult.code !== undefined)  //=== undefined 对接完成去掉
		{
			if(count < 3)
			{
				return getLoadData(url, body, method, token, ++count, noHead);
			}
			else
			{
				result.error = 20033;
				result.data = undefined;
				
				log("getLoadData url = " + url + ", 加载失败！！！");
			}
		}
		
		return Promise.resolve(result);
	})
}

/**
 * 播放新消息声音
 * */
let audio;

export function playMsgAudio()
{
	if(VersionControl.SOUND_ON !== 1)
		return;
	
	if(!audio)
	{
		audio = new Audio();
		audio.src = require("../public/media/message.mp3");
	}
	
	if(audio.paused)
	{
		audio.play();
		GlobalEvtEmitter.emit("newmessage");
	}
}

/**
 * 新消息强制打开窗口
 * */
export function forceOpenWindow()
{
	let ntalkerList = ntalkerListRedux(),
		des = name;
	
	if(ntalkerList)
	{
		let count = ntalkerList.untreatedConverCount;
		
		if(count > 0)
		{
			des += "\n" + getLangTxt("notify", count)
		}
	}
	
	sendToMain(Channel.NEW_MESSAGE, VersionControl.FORCE_OPEN_WINDOW, des);
}

/**
 *缩放和旋转
 * @param int rotate 旋转 角度
 * @param number zoom 放大缩小
 * @return String eg:matrix(-2, 0, 0, -2, 0, 0)
 * */
export function getMatrix(rotate, zoom)
{
	rotate = rotate % 360;
	
	let deg = rotate * Math.PI / 180,
		cosVal = parseFloat(Math.cos(deg)
		.toFixed(3)) * zoom,
		sinVal = parseFloat(Math.sin(deg)
		.toFixed(3)) * zoom;
	
	return "matrix(" + cosVal + "," + sinVal + "," + (-1 * sinVal) + "," + cosVal + ",0,0)";
}

/**
 * 下载文件
 * @param String link 文件链接
 * */
export function downloadByATag(src, fileName = "")
{
	var $a = document.createElement('a');
	$a.setAttribute("href", src);
	$a.setAttribute("download", fileName);
	
	var evObj = document.createEvent('MouseEvents');
	evObj.initMouseEvent("click", true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
	$a.dispatchEvent(evObj);
}

/**
 * 批量下载
 * @param Array urls 下载数组
 * @param dist 下载文件夹
 * @param callback 下载完成回调函数
 * */
export function batchDownload(urls, dist = "image", callback = null)
{
	let common_electron = window.common_electron;  //window.common_electron是从小能shell映射过来的对象
	if(common_electron && typeof common_electron.batchDownload === "function")
	{
		common_electron.batchDownload(urls, dist, callback);
	}
	else
	{
		if(typeof callback === "function")
		{
			callback();
		}
	}
}

/**
 * 加载组件
 *
 * <div className="la-square-jelly-box">
 *    <div></div>
 *    <div></div>
 * </div>
 *
 *
 * */
export function getProgressComp(progress)
{
	if(progress === LoadProgressConst.SAVING || progress === LoadProgressConst.LOADING)//正在保存 || 正在加载
	{
		return (
			<div className="la-square-jelly-background">
				<Loading style={{
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center",
					//background: "#000"
				}}/>
			</div>
		);
	}
	
	return null;
}

/*
 * 数据提交状态组件
 * */

export function _getProgressComp(progress, className = "submitStatus")
{
	if(progress === LoadProgressConst.SAVING_SUCCESS)
	{
		return <div className={className} style={{color: "#6dcc8a"}}>
			<i className="iconfont icon-001zhengque"/>
			<span>{getLangTxt("save_success")}</span>
		</div>;
	}
	else if(progress === LoadProgressConst.SAVING_FAILED)
	{
		return <div className={className} style={{color: "#eb4e3d"}}>
			<i className="iconfont icon-009cuowu"/>
			<span>{getLangTxt("save_failed")}</span>
		</div>;
	}
	else if(progress === LoadProgressConst.SAVING || progress === LoadProgressConst.LOADING)//正在保存 || 正在加载
	{
		return (
			<div className="la-square-jelly-background">
				<Loading style={{
					width: "100%",
					height: "100%",
					display: "flex",
					justifyContent: "center",
					alignItems: "center"
				}}/>
			</div>
		);
	}
	
	return null;
}

/**
 * 从加载的数据中获取data
 * */
export function getDataFromResult(value)
{
	let data = value;
	
	if(value && value.hasOwnProperty("data"))
	{
		data = value.data;
	}
	
	return Promise.resolve(data);
}

/**
 * sort()
 * return {function}
 * */
export function by(propertyName)
{
	return function(object1, object2) {
		let value1 = object1[propertyName],
			value2 = object2[propertyName];
		return value1 - value2;
	}
}

export function getModalContainer()
{
	return null;
	
	let modalContainers = document.getElementsByClassName('modalContainer');
	
	if(modalContainers && modalContainers.length > 0)
	{
		return modalContainers[0];
	}
	
	let div = document.createElement("div"),
		divattr = document.createAttribute("class");
	
	divattr.value = "modalContainer";
	div.setAttributeNode(divattr);
	
	let _app = document.getElementsByClassName('AppCSS')[0];
	
	_app.appendChild(div);
	
	return div;
}

/*判断责任客服内容的函数*/
export function kfContent(nickname, showname)
{
	if(nickname && showname)
	{
		return nickname + "[" + showname + "]";
	}
	else
	{
		return nickname || showname || getLangTxt("noData5");
	}
}

/**
 * omitObj = {a:1, b:2, c:3}
 * omit(omitObj, ["a", "b"]) => {c:3}
 * */
export function omit(obj, fields)
{
	const shallowCopy = {
		...obj,
	};
	for(let i = 0; i < fields.length; i++)
	{
		const key = fields[i];
		delete shallowCopy[key];
	}
	return shallowCopy;
}

let notification = null;

export function notifyMe(count = 0)
{
	if(Type === 1)
		return;
	
	if(notification)
	{
		notification.close();
		notification.onclick = null;
		notification = null;
	}
	
	if(count <= 0)
		return;
	
	// 先检查浏览器是否支持
	if(!("Notification" in window))
	{
		log("This browser does not support desktop notification");
	}
	
	// 检查用户是否同意接受通知
	else if(Notification.permission === "granted")
	{
		// If it's okay let's create a notification
		notification = sendNotify(count);
	}
	
	// 否则我们需要向用户获取权限
	else if(Notification.permission === 'denied' || Notification.permission === 'default')
	{
		log("Notification.permission = " + Notification.permission);
		
		Notification.requestPermission(function(permission) {
			// 如果用户同意，就可以向他们发送通知
			if(permission === "granted")
			{
				notification = sendNotify(count);
			}
		});
	}
}

let notifications = [];

function sendNotify(count)
{
	notifications.forEach(value => value.close());
	notifications = [];
	
	var notification = new Notification(getLangTxt("reminding"), {
		body: getLangTxt("notify", count), icon: require("../public/images/log_128x128.png")
	});
	notification.onclick = function() {
		notification.close();
		notification.onclick = null;
		notification = null;
	};
	
	notifications.push(notification);
	
	return notification;
}

const fileTypeArr = [".DOCX", ".PDF", ".JPG", ".PNG", ".PPT", ".RAR", ".ZIP", ".XLSX", ".TXT"];

/**
 * 判断文件类型
 * */
export function getFileTypeImgSrc(suffixName)
{
	if(!suffixName)
		return require("../public/images/chatPage/unknown.png");
	
	if(suffixName === ".DOCX" || suffixName === ".DOC")
	{
		suffixName = ".DOCX";
	}
	
	if(fileTypeArr.indexOf(suffixName) === -1)
		return null;
	
	let fileUrl = require("../public/images/chatPage/" + suffixName.substring(1) + ".png");
	
	return fileUrl;
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("MyUtil", info, log);
}

/**
 * 时间戳转换日期
 * @param <int> timestamp    待时间戳(秒)
 */
export function getLocalTime(timestamp)
{
	if(!timestamp)
		timestamp = new Date();
	
	if(typeof timestamp === "number")
	{
		timestamp = new Date(timestamp);
	}
	
	if(!timestamp instanceof Date)
		return "";
	
	let year = timestamp.getFullYear(),
		month = timestamp.getMonth() + 1,
		day = timestamp.getDate();
	
	//"YYYY-MM-DD"
	return year + "-" + zeroFillTo2(month) + "-" + zeroFillTo2(day) + " " +
		zeroFillTo2(timestamp.getHours()) + ":" + zeroFillTo2(timestamp.getMinutes());
}

/**
 * 时间戳转换日期
 * @param dataList: 排序列表; checkedKeys: 排序项; idName: 排序项标示key; type: -1上1下;
 */
export function upOrDown(dataList, checkedKeys, idName, type)
{
	if(checkedKeys.length < 1)
		return;
	
	let changedItems = [];
	
	if(type > 0)
	{
		checkedKeys.reverse();
	}
	
	for(var i = 0; i < checkedKeys.length; i++)
	{
		let index = dataList.findIndex(item => item[idName] === checkedKeys[i]);
		
		if(index === 0 && type === -1 || index === dataList.length - 1 && type === 1)
			return;
		
		if(index <= -1 || index + type > dataList.length - 1 || index + type < 0)
			return;
		
		let item = dataList[index],
			target = dataList[index + type],
			tempRank = item.rank,
			tempIndex;
		
		if(item.index)
		{
			tempIndex = item.index;
			item.index = target.index;
			target.index = tempIndex;
		}
		
		item.rank = target.rank;
		target.rank = tempRank;
		
		dataList.sort((a, b) => a.rank - b.rank);
		
		if(!changedItems.includes(item))
		{
			changedItems.push(item);
		}
		
		if(!changedItems.includes(target))
		{
			changedItems.push(target);
		}
	}
	return changedItems;
}

/**
 * 去重操作
 * */
export function reoperation(fn, wait)
{
	let timeout = null;
	return function() {
		if(timeout !== null) clearTimeout(timeout);
		timeout = setTimeout(fn.bind(null, ...arguments), wait);
	}
}

export function postMessage(message, targetOrigin = "*")
{
	try
	{
		let iframes = document.getElementsByTagName("iframe");
		if(iframes && iframes.length)
		{
			for(var i = 0; i < iframes.length; i++)
			{
				iframes[i].contentWindow.frames.postMessage(message, targetOrigin);
			}
		}
	}
	catch(e)
	{
	
	}
}

export function getATag(url, title, clsName = "")
{
	if(!url || !title)
	{
		return null;
	}
	
	if(url)
	{
		title = title ? title : url;
	}
	else
	{
		return <span>{truncateToFit(title, 8)}</span>;
	}
	
	return <a className={clsName} href={url + ""} target="_blank">{truncateToFit(title, 8)}</a>
}

export function getLangTxt(errorCode, ...substitutions)
{
	return Lang.getLangTxt(errorCode, ...substitutions);
}
