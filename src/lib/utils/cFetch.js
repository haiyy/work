import Settings from "../../utils/Settings";
import TranslateProxy from "../../model/chat/TranslateProxy";

let fetch;

if(window && window.WebSocket)
{
	fetch = require("isomorphic-fetch");
}
else
{
	require("./xhr");
	fetch = require("fetch-ie8");
}

const errorMessages = (res) => `${res.status} ${res.statusText}`;

/*
 *json  {body:"",method:"put"}
 * return Promise;
 */
export function urlLoader(url, options = {}, contentType = "application/json; charset=UTF-8")
{
	let opts = Object.assign({method: "get"}, options);

	if(contentType)
	{
		opts.headers = {
			...opts.headers,
			"Content-Type": contentType
		};
	}
	else
	{
		opts.headers && (delete opts.headers["Content-Type"]);
	}
	
	if(!opts.headers)
		opts.headers = {};
	
	opts.headers.lang = TranslateProxy.LANGUAGE;

	return fetch(url, opts)
	.then(jsonParse)
	.catch(error => {
		return Promise.resolve({jsonResult: {...error, success: false, code: 500}});
	});
}

export function urlLoaderForTimeout(url, options = {}, contentType = "application/json; charset=UTF-8", timeout = 15000)
{
	return new Promise((resolve, reject) => {
		let myFetch = urlLoader(url, options, contentType);

		TimeOut(myFetch, timeout)
		.then(responseData => {
			resolve(responseData);
		});
	});
}

const TimeOut = (requestPromise, timeout = 30000) => {
	let timeoutAction = null;

	const timerPromise = new Promise((resolve, reject) => {
		timeoutAction = () => {
			resolve({jsonResult: {success: false, code: 408}});
		}
	});

	setTimeout(() => {
		timeoutAction()
	}, timeout);

	return Promise.race([requestPromise, timerPromise]);
};

export function urlStream(url, options)
{
	let opts = Object.assign({method: "post"}, options);

	opts.headers = {
		...opts.headers
	};

	return fetch(url, opts)
	.then(blobParse)
	.catch(error => {
		return {error}
	});
}

export function urlStreamForTimeout(url, options = {}, timeout = 15000)
{
	return new Promise(resolve => {
		let myFetch = urlStream(url, options);

		TimeOut(myFetch, timeout)
		.then(responseData => {
			resolve(responseData);
		});
	});
}

/**
 * 上传图片或文件
 * @param {File} or {Blob} file　文件内容
 * @param {String} action　上传图片还是文件 UPLOAD_IMAGE_ACTION or UPLOAD_FILE_ACTION
 * @return Promise.then()
 * */
export function uploadLogContent(content, terminalType = "kf", isCompress = false)
{
	let formData = new FormData(),
		uploadUrl = Settings.getUploadUrl() + "/terminal/logContent";

	formData.append("content", content);

	formData.append("terminalType", terminalType);
	formData.append("isCompress", isCompress);

	return urlLoader(uploadUrl, {
		body: formData,
		method: "post"
	}, "");
}

function jsonParse(res)
{
	return res.json()
	.then(jsonResult => ({...res, jsonResult}));
}

function blobParse(res)
{
	return res.blob()
	.then(blob => ({...res, blob}));
}

// TODO: 用户登陆之后，需保存Token至cookie
export function cFetch(url, options)
{
}
