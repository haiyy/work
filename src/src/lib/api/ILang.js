import { mergeObject, format } from "../utils/Utils";

/**
 * 语言包类
 * */
class ILang {
	
	langs = {};
	
	constructor()
	{
		if(window && window.i18n)
		{
			this.setLangs(window.i18n);
		}
	}
	
	/**
	 *获取语言包
	 * @value
	 */
	setLangs(value)
	{
		if(!value)
			return;
		
		mergeObject(this.langs, value);
	}
	
	/**
	 * 根据code获取NIMError相关错误对象
	 * @param {int} errorCode 错误代码
	 * @param {Array} args
	 * @return {Error}
	 * */
	getError(errorCode, ...args)
	{
		let error = format(this.langs[errorCode], ...args);
		
		if(error && error.length > 0)
		{
			return new Error(error);
		}
		
		return null;
	}
	
	/**
	 *根据code获取对应语句
	 *@param {int} errorCode 错误代码
	 *@param {Array}substitutions ['', '']
	 *@return {String}
	 */
	getLangTxt(errorCode, ...args)
	{
		let txt = this.langs[errorCode];
		if(args.length <= 0)
			return txt;
		
		return format(txt, args);
	}
}

export default ILang;