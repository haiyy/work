class HyperyMediaData {
	constructor()
	{
	
	}
	
	deserialize(data)
	{
		if(!data)
			return;
		
		this.templateInfo = data.templateinfo;
		this.thumbnailImage = data.thumbnailimage;
		this.params = data.params || [];
		
		if(this.templateInfo)
		{
			this.pname = this.templateInfo.pname;
			this.name = this.templateInfo.name;
			this.template_id = this.templateInfo.template_id;
		}
	}
	
	getParams(value, params = null)
	{
		let paramsObject = params ? params : {...this.params};
		
		for(let key in value)
		{
			if(paramsObject.hasOwnProperty(key))
			{
				paramsObject[key] = {...this.params[key], value: value[key]}
			}
		}
		
		return paramsObject;
	}
}

export default HyperyMediaData;

/*{
  "expiretime": 1200,
  "code": 200,
  "data": [
    {
      "templateinfo": {
        "pname": "电商行业",
        "name": "推荐商品",
        "template_id": "7e9744fd4ac5441abdae9bc2dc13466e"
      },
      "thumbnailimage": "http://192.168.31.195:8081/magicbox/images/chanpin.png",
      "position": "1",
      "params": {
        "xn_cmtid": "791b5dde308143b881cc4f56cbbf2687",
        "xn_devicetype": "xn_undefined",
        "xn_ntid": "xn_undefined",
        "xn_version": "xn_undefined",
        "xn_userrole": "xn_undefined",
        "xn_waiterid": "xn_undefined",
        "xn_siteid": "kf_1000",
        "userid": "xn_undefined",
        "xn_cmtname": "单一商品推荐",
        "xn_msgid": "xn_undefined",
        "username": "xn_undefined",
        "token": "xn_undefined"
      }
    },
	。。。
]
}*/