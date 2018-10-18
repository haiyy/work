import { getLoadData, loginUserProxy, reoperation } from "../../utils/MyUtil";
import LogUtil from "../../lib/utils/LogUtil";
import { EventEmitter } from "events";
import { version, initServer } from '../../../package.json';
import { generateSiteId } from '../../utils/StringUtils';

class CheckoutUpdate extends EventEmitter {

	static FORCEUPDATE_TYPE = 1;  //强制更新
	static UPDATE_TYPE = 2;  //需要更新
	static NONEED_TO_UPDATE_TYPE = 0; //不需要更新
	static MANUAL_UPDATE_TYPE = 3;  //手动更新
	static UPDATE = "Update"; //发起更新
	static COMPLETE = "complete"; //加载更新文件成功

	constructor(props)
	{
		super(props);

		this.siteInfos = [];

		if(localStorage.length > 0 && localStorage.getItem('update'))
		{
			this.siteInfos = JSON.parse(localStorage.getItem('update')) || [];
		}
		
		this.getUpdateInfo = reoperation(this.getUpdateInfo.bind(this), 700);
		
		this.on(CheckoutUpdate.COMPLETE, this.onComplete.bind(this));
	}

	onComplete()
	{
		this.emit(CheckoutUpdate.UPDATE, this.getUpdateType());
	}

	get siteId()
	{
		return loginUserProxy().siteId;
	}

	getUpdateInfo(siteId)
	{
		if(Type !== 1 || !siteId)
			return;
		
		let url = `${initServer}/client/version?siteid=` + generateSiteId(siteId);
		
		getLoadData(url)
		.then(jsonResult => {

			let logType = LogUtil.INFO,
				success = false;

			if(jsonResult.error !== 20033)
			{
				success = true;
			}
			else
				logType = LogUtil.ERROR;

			log(["getUpdateInfo data = ", jsonResult], logType);

			if(!(success && jsonResult.data))
				return;

			let {version, url, size, info, forceupdate, macUrl, x64Url} = jsonResult.data;

			this.lastVersion = version || "";
			this.url = url;
			this.size = size;
			this.info = info;
			this.macUrl = macUrl;
			this.x64Url = x64Url;
			this.forceupdate = forceupdate;

			this.emit(CheckoutUpdate.COMPLETE);
		})
	}

	get noupdateInfo()
	{
		if(!this.siteInfos.length)
			return false;

		let lastSiteId = this.siteId || loginUserProxy().lastSiteId,
			info = this.siteInfos.find(item => item.siteid === lastSiteId) || {};

		return info || {};
	}

	getUpdateType()
	{
		if(this.forceupdate === 1)
			return CheckoutUpdate.FORCEUPDATE_TYPE;

		if(this.noupdateInfo.version === this.lastVersion)
			return CheckoutUpdate.NONEED_TO_UPDATE_TYPE;

		let curVersion = version.split("."),
			lastVersion = this.lastVersion.split(".");

		if(curVersion.length === 3 && lastVersion.length === 3)
		{
			if(curVersion[0] < lastVersion[0] || curVersion[1] < lastVersion[1])
			{
				return CheckoutUpdate.FORCEUPDATE_TYPE
			}
			else if(curVersion[2] < lastVersion[2])
			{
				return CheckoutUpdate.UPDATE_TYPE;
			}
		}

		return CheckoutUpdate.NONEED_TO_UPDATE_TYPE;
	}

	doNomoreRemind()
	{
		let index = this.siteInfos.findIndex(item => item.siteid && item.siteid === this.siteId);

		if(index <= -1)
		{
			this.siteInfos.push({
				siteid: this.siteId || loginUserProxy().lastSiteId, version: this.lastVersion
			});
		}

		localStorage.setItem('update', JSON.stringify(this.siteInfos));
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("CheckoutUpdate", info, log);
}

export default CheckoutUpdate;
