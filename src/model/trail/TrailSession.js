import TrailInfoList from "./TrailInfoList";
import TrailRecordList from "./TrailRecordList";
import LogUtil from "../../lib/utils/LogUtil";

export default class TrailSession {
	
	constructor(session)
	{
		// 设置访问信息
		this.infos = new TrailInfoList(session.infos);
		// 设置页面信息
		try
		{
			this.records = new TrailRecordList(session.records);
		}
		catch(e)
		{
			LogUtil.trace("trail", LogUtil.ERROR, "error code 320002 trail session is invalid, set records to []");
			this.records = [];
		}
	}
	
	isSame(session)
	{
		return this.infos.isSame(session.infos);
	}
}
