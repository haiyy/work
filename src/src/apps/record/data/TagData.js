class TagData {
	constructor(props)
	{
	}
	
	key = "";
	key2 = "";
	value = "";
	searchKey = "";
	
	isKey = true;
	
	getKey()
	{
		if(this.isKey)
		{
			return this.key;
		}
		
		return this.key2;
	}
}

export default TagData;
