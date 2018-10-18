import RosterUser from "./RosterUser";

class BuddyGroup extends Array
{
	groupName = '';
	groupId = '';
	groupCount = 0;
	// lastIndex = -1;

	constructor() 
	{
		super();
	}
	
	get label()
	{
		if(!groupName)
			return '';
		
		return groupName + '['+ this.groupCount +']';
	}

	updateGroupSize()
	{
		this.groupCount = length;
	}

	deleteItem(id)
	{
		let index = this.indexOf(id);
		if(index >= 0)
		{
			return this.splice(index, 1).length > 0;
		}
	}

	indexOf(id)
	{
		let item, len = length;

		for (let i = 0; i < len; i++) 
		{
			item = this[i];
			if(!item)
				continue;

			if(item instanceof BuddyGroup)
			{	
				if(item.groupId == id)
				{
					return i;
				}
			}
			else if(item instanceof RosterUser)
			{
				if(item.userId == id)
				{
					return i;
				}
			}
		}
		
		return -1;
	}

	toString()
	{
		return "[ BuddyGroup groupName = " + groupName + " length = " + length + " groupId = " + groupId + "]";
	}
}

export default BuddyGroup;