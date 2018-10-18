import BuddyGroup from "../../../model/vo/BuddyGroup";
import LogUtil from "../../../lib/utils/LogUtil";

class IColleagueList
{
	constructor() 
	{
        this.colleagueList = [];
        this.map = new Map();
	}

	/**
	*[
	*	{
	*		groupid, groupName, groupCount,
	*		children:[
	*			...
	*		]
	*	},
	*	...
	*]	
	**/
	addOrgStructure(groups, parent)
	{
		try
		{
			let group,
				buddyGroup,
				len = groups.length;

			for(let i = 0; i < len; i++)
			{
				group = groups[i];
				if(!group || this.map.has(group.groupid))
					continue;

				buddyGroup = new BuddyGroup();
				buddyGroup.groupId = group.groupid;
				buddyGroup.groupName = group.groupname;
				buddyGroup.groupCount = group.groupcount;
				
				if(parent)
				{
					parent.push(buddyGroup);
				}
				else
				{
					this.colleagueList.push(buddyGroup);
				}

				this.map.set(buddyGroup.groupId, buddyGroup);
				
				let children = group.children;
				if(!children || children.length <= 0)
					continue;

				this.addOrgStructure(children, buddyGroup);	
			}
		}
		catch(e)
		{
			log('parseOrgStructure stack: ' + e.stack);
		}
	}
	
	addColleague(roster)
	{	
		try 
		{
			let group = this.map.get(roster.groupId);

			if(group)
			{
				var index = group.indexOf(roster.userId);

				if(index <= -1)
				{
					group.push(roster);
				}
			}
			else
			{
				group = new BuddyGroup();
				group.groupId = roster.groupId;
				group.groupName = roster.groupName;
				group.groupCount = 1;
				group.push(roster);

				this.colleagueList.push(group);
				this.map.set(group.groupId, group);
			}
		}
		catch(e)
		{
			log('addColleague e.stack: ' + e.stack);
		}
	}

	removeAll()
	{
		this.colleagueList = [];
	}

	removeColleague(roster)
	{
		let group = this.map.get(roster.groupId);

		if(group)
		{
			group.deleteItem(roster.userId);
		}
	}
}

function log(log, info = LogUtil.INFO)
{
	LogUtil.trace('IColleagueList', info, log);
}

export default IColleagueList;