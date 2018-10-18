import LogUtil from "../lib/utils/LogUtil";

class TabDataManager {
	constructor()
	{
		_map = {};
	}
	
	/**
	 *添加Tab
	 *@param {String} userID  干系人ID
	 *@param {String} chatSessionID 会话ID
	 *@param {String} tabComponentName  NtalkerTab.name
	 *return void
	 */
	setTab(userID, chatSessionID, tabComponentName)
	{
		log("setTab userID = " + userID + " ,chatSessionID = " + chatSessionID + " ,tabComponentName = " + tabComponentName);
		
		if(!userID || !tabComponentName || tabComponentName.length <= 0)
			return;
		
		let tabID = makeTabID(userID, chatSessionID);
		let tTabID = getTabID(userID, chatSessionID, tabID);
		if(tTabID != "")
		{
			delete _map[tTabID];
		}
		
		_map[tabID] = tabComponentName;
	}
	
	/**获取*/
	getTabName(userID, chatSessionID)
	{
		let tabID = getTabID(userID, chatSessionID);
		if(tabID != "")
			return _map[tabID];
		
		return "";
	}
	
	removeTab(userID, chatSessionID)
	{
		var tabID = getTabID(userID, chatSessionID);
		if(tabID != "")
			delete _map[tabID];
	}
	
	clear()
	{
		_map = {};
	}
}

let _map;

const TAB_ID_SEPARATOR = "#TABID#";

function makeTabID(userID, chatSessionID)
{
	return chatSessionID ? (userID + TAB_ID_SEPARATOR + chatSessionID) : userID;
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace("TabDataManager", info, log);
}

function getTabID(userID, chatSessionID, tabID = null)
{
	if(tabID && _map.hasOwnProperty(tabID))
		return tabID;
	
	let key;
	for(key in _map)
	{
		if((chatSessionID && (key.indexOf(chatSessionID) >= 0)) ||
			key.indexOf(userID) >= 0)
		{
			tabID = key;
			break;
		}
	}
	
	return tabID;
}

export default new TabDataManager();