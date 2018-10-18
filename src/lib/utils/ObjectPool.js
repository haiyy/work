import IPool from "../api/IPool";

class ObjectPool {
	registerClass(type, classObject)
	{
		if(!_classMap.hasOwnProperty(type))
		{
			_classMap[type] = classObject;
		}
	}

	getObject(type)
	{
		let pools = _free[type];
		if(!pools || pools.length <= 0)
		{
			createObjects(type);
		}

		return _free[type].pop();
	}

	freeObject(object)
	{
		if(!object instanceof IPool)
			return;

		object.clear();

		_free[object.poolType].push(object);
	}
}

let _free = {},
	_classMap = {},
	_minNum = 5;

function createObjects(type)
{
	let _class = _classMap[type], i = 0, pools = _free[type];

	if(!_class || typeof _class != "function")
		return;

	pools = pools ? pools : [];

	for (; i < _minNum; i++)
	{
		pools.push(new _class());
	}

	_free[type] = pools;
}

export default new ObjectPool;
