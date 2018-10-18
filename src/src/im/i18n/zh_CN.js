import ILang from "../../lib/api/ILang";

class zh_CN extends ILang {
	constructor()
	{
		super();
		
		this.setLangs(this._langs);
	}
	
	_langs = {
		11001: '未知错误',
		
		10099: '正在连接服务器！',
		10098: '与服务器连接成功！',
		10097: '与服务器连接出现异常，请重新连接！',
		//10096被占用
		10103: '正在连接服务器！',
		
		10105: '{0} ERROR: {2} 参数类型传递错误{1}！',
		10106: '无效类型{0}:{1}',
		10107: '{0} 验证失败!',
	}
}

export default zh_CN;