import { getSourceForDevice, getSourceUrl } from "../../utils/MyUtil";

class PendingConverData {

	_updateTime = -1;

	constructor(value)
	{
		value && this.updateData(value);
	}

	updateData(value)
	{
		let {
			userid, username, source, isvip, dv, tml, forbidden, city, province,
			conversation: {converid, summarized, prid, extrainfo, lastmsgtime, starttime, templateid}
		} = value;

		this.userId = userid;
		this.userName = username;
		this.isVip = isvip;
		this.sourceIcon = getSourceForDevice(source, tml);
		this.source = source;
		this.dv = dv;
		this.tml = tml;

		this.converId = converid;
		this.prid = prid;
		this.extrainfo = extrainfo;
		this.lastmsgtime = lastmsgtime;
		this.summarized = summarized;
		this.starttime = starttime;
		this.forbidden = forbidden;
		this.city = city || "";
		this.province = province || "";
		this.templateid = templateid;

		this.updateTime = this.starttime;
		
	}

    get address()
    {
        if(this.city.indexOf(this.province) >= 0)
            return this.province;

        return this.province + this.city;
    }

	set updateTime(lastmsgtime)
	{
		if(lastmsgtime > 0)
		{
			this._updateTime = new Date(lastmsgtime);
		}
	}

	get updateTime()
	{
		return this._updateTime;
	}

	/**
	 * 更新
	 * @param {ChatDataVo} value 会话信息
	 *
	 * */
	updateChatData(value)
	{
		let {
			rosterUser = {}, summarized,
			sessionId, productId, startChatTime
		} = value;

		this.userId = rosterUser.userId;
		this.userName = rosterUser.userName;
		this.converId = sessionId;
		this.sourceIcon = getSourceUrl(rosterUser.userInfo);
		this.prid = productId;
		this.starttime = startChatTime;
		this.summarized = summarized;

		this.updateTime = this.starttime;
	}
}

export default PendingConverData;
