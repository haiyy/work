import TrailSession from "./TrailSession";
import LogUtil from "../../lib/utils/LogUtil";

export default class TrailSessionList {
	
	constructor(data)
	{
		this.sessions = new Set();
		
		if(!data || !data instanceof Array || data.length === 0)
		{
			LogUtil.trace("trail", LogUtil.ERROR, "error code 330000：sessionList init data is invalid");
			return;
		}
		
		data.map((v) =>
		{
			this.sessions.add(new TrailSession(v));
		});
	}
	
	merge(trailSessionList)
	{
		let mergeList = new Set(this.sessions);
		trailSessionList.forEach((compareSession) =>
		{
			let duplicateFlag = false;
			
			this.sessions.forEach((session) =>
			{
				if(session.isSame(compareSession))
				{
					duplicateFlag = true;
				}
			});
			
			if(!duplicateFlag)
			{
				mergeList.add(compareSession);
			}
		});
		
		return mergeList;
	}
	
	getSessions()
	{
		return Array.from(this.sessions);
	}
}