import TrailAddress from "./TrailAddress";
import TrailSource from "./TrailSource";
import { TimeConvert } from "../../components/common/utils";

export default class TrailInfo {
	
	constructor(data)
	{
		// sid
		this.sid = data.sid;
		// ip地域
		this.ipAddress = data.ip + new TrailAddress(data).address;
		// 终端
		this.terminal = data.tml;
		// 设备
		this.device = data.dv;
		// 访问来源
		this.source = new TrailSource(data).value;
		// 关键词
		this.keyword = data.keyword;
		
		// 访问页面
		this.visitPageCount = "";
		if(data.webNodeCount !== undefined)
		{
			this.visitPageCount = data.webNodeCount + "个";
		}
		
		// 最大访问层级
		this.maxVisitLevel = "";
		if(data.maxLevel && data.maxLevelName)
		{
			this.maxVisitLevel = data.maxLevel + (data.maxLevelName ? ("-" + data.maxLevelName) : "");
		}
		
		// 停留时长
		this.stayTime = "";
		if(data.totalTimelong !== undefined)
		{
			this.stayTime = TimeConvert.secondTohms(Math.round(parseInt(data.totalTimelong / 1000)), 'zh', false);
		}
		
	}
	
	isSame(infoList)
	{
		if(this.sid === infoList.sid)
		{
			return true;
		}
	}
}
