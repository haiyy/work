import Proxy from "../Proxy";
import { equalHyperMedia } from "../../utils/HyperMediaUtils";

class HyperMediaProxy extends Proxy {
	
	static NAME = 'HyperMediaProxy';
	
	constructor(props)
	{
		super(props);
		
		this.tempeltes = [];
		this.name = HyperMediaProxy.NAME;
	}
	
	hasMedia(tempid)
	{
		let index = this.tempeltes.findIndex(({params:{xn_cmtname}}) => equalHyperMedia(tempid, xn_cmtname));
		
		return index > -1;
	}
	
	getParam(tempid)
	{
		let index = this.tempeltes.findIndex(({params:{xn_cmtname}}) => equalHyperMedia(tempid, xn_cmtname));
		
		if(index > -1)
		{
			var param = this.tempeltes[index] || {};
		}
		
		return {...param};
	}
	
	update(data)
	{
		this.tempeltes = data;
	}
}

export default HyperMediaProxy;

/*
{
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
	{
		"templateinfo": {
			"pname": "电商",
			"name": "上图下文",
			"template_id": "0898897bccd14a0fbc714ac8b48fdd4b"
		},
		"thumbnailimage": "http://192.168.31.195:8081/magicbox/images/chanpin.png",
		"position": "1",
		"params": {
			"xn_cmtid": "6697d5dfb9f34799a75be4a5a9c579f2",
			"xn_devicetype": "xn_undefined",
			"xn_ntid": "xn_undefined",
			"xn_version": "xn_undefined",
			"xn_userrole": "xn_undefined",
			"xn_waiterid": "xn_undefined",
			"xn_siteid": "kf_1000",
			"userid": "xn_undefined",
			"xn_cmtname": "上图下文",
			"xn_msgid": "xn_undefined",
			"username": "xn_undefined",
			"token": "xn_undefined"
		}
	}
]
}*/
