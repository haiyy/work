import TagData from "./TagData";

class SelectedTagsData {
	
	_data = [];
	
	constructor(props)
	{
	}
	
	add(tagDataArr)
	{
		if(!tagDataArr || !tagDataArr.length)
			return;
		
		tagDataArr.forEach(tagData => {
			let index = this._data.findIndex(item => item && item.key === tagData.key);
			
			index <= -1 && this._data.push(tagData);
		})
	}
	
	del(keys)
	{
		if(!keys || !keys.length)
			return;
		
		let index = this._data.findIndex(item => item.key === keys);
		
		if(index > -1)
			this._data.splice(index, 1);
	}
	
	addTag(key, value = {}, searchKey = "")
	{
		let index = this._data.findIndex(item => item.key === key);
		
		if(index > -1)
			return false;
		
		let tagData = new TagData();
		tagData.key = key;
		tagData.value = value;
		tagData.searchKey = searchKey;
		
		this._data.push(tagData);
	}
	
	get keys()
	{
		if(!this._data)
			return;
		
		return this._data.map(tag => tag.key);
	}
	
	get data()
	{
		return this._data;
	}
	
	set data(value)
	{
		this._data = Array.isArray(value) ? value : this._data;
	}
	
	clear()
	{
		this._data = [];
	}
}

export default SelectedTagsData;
