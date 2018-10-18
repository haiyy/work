import { zeroFill } from "./Utils";
import { uploadLogContent } from "./cFetch";

class LogUtil {
	static DEBUG = 0;
	static INFO = 1;
	static WARN = 2;
	static ERROR = 3;
	
	static debug = false;
	static mqttDebug = false;
	static limit = false;
	static limitNum = 100;
	static uploadNum = 20;
}

let logs = [];

LogUtil.trace = function(category, level, log) {
	if(!LogUtil.debug || !log || log.length <= 0)
		return;
	
	let info = time() + " ";
	
	if(Array.isArray(log))
	{
		log = log.map(item => ((typeof item !== "string" && JSON.stringify(item)) || item))
		.join(" ");
	}
	
	if(LogUtil.limit && log.length > LogUtil.limitNum)
	{
		log = log.substr(0, LogUtil.limitNum);
	}
	
	switch(level)
	{
		case LogUtil.INFO:
			info += "[INFO]" + info + " " + category + " " + log;
			console.info(info);
			break;
		
		case LogUtil.DEBUG:
			info += "[DEBUG]" + info + " " + category + " " + log;
			console.debug(info);
			break;
		
		case LogUtil.WARN:
			info += "[WARN]" + info + " " + category + " " + log;
			console.warn(info);
			break;
		
		case LogUtil.ERROR:
			info += "[ERROR]" + info + " " + category + " " + log;
			console.error(info);
			break;
	}
	return;
	logs.push({[level]: info});
	
	if(logs.length > LogUtil.uploadNum)
	{
		uploadLogContent(JSON.stringify(logs));
		logs = [];
	}
};

let padTime = function(number) {
	return zeroFill(number, 2);
};

function time()
{
	let date = new Date(),
		now = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" +
			date.getDate() + " " + padTime(date.getHours()) + "-" +
			padTime(date.getMinutes()) + "-" +
			padTime(date.getSeconds()) + "-" +
			padTime(date.getMilliseconds(), true);
	return now;
};

export default LogUtil;
