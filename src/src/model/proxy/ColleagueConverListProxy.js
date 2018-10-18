import Proxy from "../Proxy";
import { fromJS, List } from "immutable";

class ColleagueConverListProxy extends Proxy {
	static NAME = "ColleagueConverListProxy";
	_groups = [];
	_users = [];
	
	constructor()
	{
		super();
		
		this.name = ColleagueConverListProxy.NAME;
	}
	
	update(list)
	{
		if(!list || !list.groups || !list.users)
			return;
		
		this._groups = fromJS(list.groups);
		
		this._users = fromJS(list.users)
		.groupBy(user => user.get("groupId"));
	}
	
	getGroups()
	{
		return this._groups;
	}
	
	getGroupSize(value)
	{
		return this.getUserByGroupId(value).size;
	}
	
	getUserByGroupId(value)
	{
		if(this._users && this._users.has(value))
		{
			return this._users.get(value);
		}
		
		return List();
	}
	
	clear()
	{
		this._groups = [];
		this._users = [];
	}
}

export default ColleagueConverListProxy;
