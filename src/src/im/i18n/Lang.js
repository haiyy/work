import zh_CN from "./zh_CN";
import en_US from "./en_US";
import ILang from "../../lib/api/ILang";

class Lang extends ILang {
	
	constructor()
	{
		super();
	}
	
	/**
	 * 设置语言种类
	 * IM内部使用
	 * @deprecated
	 * */
	setI18n(value = "")
	{
		switch(value)
		{
			case 'en_us':
				this.lang = new en_US();
				break;
			
			default:
				this.lang = new zh_CN();
				break;
		}
	}
	
	/**
	 * @inheritDoc
	 */
	getError(errorCode, ...args)
	{
		if(this.lang)
		{
			return this.lang.getError(errorCode, ...args);
		}
		
		return null;
	}
	
	/**
	 * @inheritDoc
	 */
	getLangTxt(errorCode, ...substitutions)
	{
		if(this.lang)
		{
			return this.lang.getLangTxt(errorCode, ...substitutions);
		}
		
		return '';
	}
	
	/**
	 *获取语言包
	 * @inheritDoc
	 */
	setLangs(value)
	{
		if(this.lang)
		{
			this.lang.setLangs(value);
		}
	}
}

export default new Lang();