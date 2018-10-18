import TrailRecord from "./TrailRecord";
import LogUtil from "../../lib/utils/LogUtil";
import { formatTimestamp } from "../../utils/MyUtil";

export default class TrailRecordList {
	
	constructor(data)
	{
		if(!data || !data instanceof Array || data.length === 0)
		{
			LogUtil.trace("trail", LogUtil.ERROR, "error code 310000：recordList init data is invaild");
			throw new Error("310000");
		}
		
		this.records = new Set();
		
		this._time = -1;
		
		data.map((v, index) =>
		{
			try
			{
				if(index === 0)
				{
					if(v.time > 0)
					{
						this._time = formatTimestamp(v.time, true);
					}
				}
				
				this.records.add(new TrailRecord(v));
			}
			catch(e)
			{
				LogUtil.trace("trail", LogUtil.ERROR, "error code 310001：recordList data is auto filter, some record data will not show");
			}
		});
	}
	
	get size()
	{
		return this.records.size;
	}
	
	get time()
	{
		if(this._time !== -1)
		{
			return this._time;
		}
		return "";
	}
	
	getAll()
	{
		return Array.from(this.records);
	}
	
	merge(trailRecordList)
	{
		let mergeList = new Set(this.records);
		trailRecordList.forEach((compareRecord) =>
		{
			let duplicateFlag = false;
			
			this.records.forEach((record) =>
			{
				if(record.isSame(compareRecord))
				{
					duplicateFlag = true;
				}
			});
			
			if(!duplicateFlag)
			{
				mergeList.add(compareRecord);
			}
		});
		
		return mergeList;
	}
}
