import Channel from "../model/vo/Channel";
import { sendAppEvent, sendT2DEvent, upload, UPLOAD_IMAGE_ACTION } from "../utils/MyUtil";
import SessionEvent from "../apps/event/SessionEvent";
import APPEvent from "../apps/event/APPEvent";
import LogUtil from "../lib/utils/LogUtil";
import GlobalEvtEmitter from "../lib/utils/GlobalEvtEmitter";
import { ntalkerListRedux } from "../utils/ConverUtils";

let ipcRenderer;

export function initIpcRenderer()
{
	const common = window.common_electron;
	if(common && common.ipc)
	{
		log("initIpcRenderer init...");
		
		ipcRenderer = common.ipc;
		ipcRenderer.on(Channel.QUIT, onQuit);
		ipcRenderer.on(Channel.USER_STATUS, onUserStatus);
		ipcRenderer.on(Channel.SHOW, onShow);
		ipcRenderer.on(Channel.SHORT_CUT, onShortCut);
		ipcRenderer.on(Channel.VISITOR_SOURCE, onVisitorSource);
		ipcRenderer.on(Channel.FORCE_OPEN_WINDOW, onForceOpenWindow);
		ipcRenderer.on(Channel.APPDATA_PATH, onAppdataPath);
		ipcRenderer.on("SYSTEM_MESSAGE_ACTION", onSystemMessageAction);
		
		let isShowScreen = localStorage.getItem('isShowScreen') == 1;
		
		sendToMain(Channel.INIT_IPC, {isShowScreen});
	}
}

function onAppdataPath(event, value)
{
	console.log("onAppdataPath value = ", value);
	
	const common = window.common_electron;
	if(common)
	{
		common.systempath = value;
	}
}

function onForceOpenWindow()
{
	GlobalEvtEmitter.emit("focus");
}

function onVisitorSource()
{
	//log(["onShow: " , arguments]);
}

function onQuit(event)
{
	GlobalEvtEmitter.emit("MainToQuit");
}

function onShow()
{
	//console.log("onShow: " + arguments);
}

function onShortCut(event, dataUrl)
{
	upload(dataUrl, UPLOAD_IMAGE_ACTION, true)
	.then((res) => {
		
		var {jsonResult = {data: {}}} = res,
			{data = {srcFile: {}, thumbnailImage: {}}, code} = jsonResult,
			success = code === 200,
			{srcFile: {url: sourceurl}} = data;
		
		if(!success)
		{
			//未知错误
			return;
		}
		
		if(success)
		{
			sendAppEvent({listen: APPEvent.SHORT_CUT, sourceurl});
		}
	});
}

function onUserStatus(event, status)
{
	GlobalEvtEmitter.emit("userStatusChange", status);
}

/**
 * @param {int} type 系统消息类别：1 -> 一般消息，2 -> 协同会话
 * @param {string or JSONObject} message 消息内容
 * @param errorType 1->正确 2 ->提示 3->错误
 * @param {Boolean} autoClose 自动关闭，延迟10S， type == 2时，不起作用
 * */
export function sendSystemPrompt(message, type = 1, id = "", errorType = "", autoClose = true)
{
	console.log("ipcRenderer sendSystemPrompt message = ", message, type);
	sendToMain("SYSTEM_MESSAGE", id, type, message, errorType, autoClose);
}

/**
 * 关闭系统消息面板
 * @param {string} id id === ""时，关闭所有消息面板
 * */
export function closeSystemPrompt(id = "")
{
	console.log("ipcRenderer closeSystemPrompt id = ", id);
	sendToMain("SYSTEM_MESSAGE_CLOSE", id)
}

export function sendToMain(channel)
{
	if(ipcRenderer)
	{
		ipcRenderer.send(...arguments);
	}
}

function onSystemMessageAction(event, data)
{
	let ntalkerList = ntalkerListRedux();
	
	if(ntalkerList && data)
	{
		let {id, actionId} = data;
		let chatData = ntalkerList.getTabData(id);
		
		chatData && chatData.requestCooperateAction(actionId);
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("ipcRenderer", info, log);
}

window.sendToMain = sendToMain;