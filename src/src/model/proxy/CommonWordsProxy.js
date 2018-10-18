import React from 'react';
import Model from "../../utils/Model";
import Settings from "../../utils/Settings";
import { loginUserProxy } from "../../utils/MyUtil";
import { urlLoader } from "../../lib/utils/cFetch";
import UsualTips from "../../apps/chat/view/aside/UsualTips";

class CommonWordsProxy extends React.Component {
	
	static NAME = "CommonWordsProxy";
	
	constructor()
	{
		super();
		
		this.name = CommonWordsProxy.NAME;
		
		this._companyCommonWords = [];
		this._personalCommonWords = [];
		this._allCommonWords = [];
		this._templateCommonWords = [];
	}
	
	get companyCommonWords()
	{
		return this._companyCommonWords;
	}
	
	get personnalCommonWords()
	{
		return this._personalCommonWords;
	}
	
	get allCommonWords()
	{
		return this._allCommonWords;
	}
	
	get templateCommonWords()
	{
		return this._templateCommonWords;
	}
	
	shouldComponentUpdate()
	{
		return false;
	}
	
	/**
	 * 加载常用话术
	 *
	 * @param {String} templateid 模版ID
	 * @param {int} type 加载常用话术类型（0->全部 1->企业 2->个人 3->模版）
	 * */
	loadData(type = 0, templateid = "")
	{
		let {siteId: siteid, userId: userid, ntoken} = loginUserProxy(),
			all = "",
			query = "";
		
		switch(type)
		{
			case UsualTips.ALL:
				all = "/all";
				break;
			
			case UsualTips.COMPANY:
				query = "";
				break;
			
			case UsualTips.PERSON:
				query = "?userid=" + userid;
				break;
			
			case UsualTips.TEMPLATE:
				query = "?templateid=" + templateid;
				break;
		}
		
		let settingUrl = Settings.querySettingUrl("/fastResponse/", siteid, all + query);
		
		return urlLoader(settingUrl, {headers: {token: ntoken}})
		.then(({jsonResult}) => {
			let success = jsonResult.code === 200,
				data = jsonResult.data;
			
			if(success)
			{
				this.updateCommonWords(type, data);
			}
			
			return Promise.resolve(success);
		});
	}
	
	updateCommonWords(type, data)
	{
		switch(type)
		{
			case UsualTips.ALL:
				this._allCommonWords = data;
				break;
			
			case UsualTips.COMPANY:
				this._companyCommonWords = data;
				break;
			
			case UsualTips.PERSON:
				this._personalCommonWords = data;
				break;
			
			case UsualTips.TEMPLATE:
				this._templateCommonWords = data;
				break;
		}
	}
	
	render()
	{
		return null;
	}
	
	getProxyName()
	{
		return this.name;
	}
	
	onRegister()
	{
	
	}
	
	onRemove()
	{
	
	}
	
	static searchCommonWords(searchValue, commonWords = null)
	{
		if(searchValue == "" || searchValue === undefined)
			return [];
		
		if(!commonWords)
		{
			commonWords = Model.retrieveProxy(CommonWordsProxy.NAME).allCommonWords || [];
		}
		
		let words = [];
		
		loop(commonWords, searchValue, words);
		
		return words;
	}
	
	static applyStyle(str, search)
	{
		if(!str)
			return str;
		
		let arr = str.split(search);
		
		return arr.reduce((total, currentValue, index) => {
			if(index > 0)
			{
				total.push(<span style={{color: '#f50'}}>{search}</span>, <span>{currentValue}</span>)
			}
			else
			{
				total.push(<span>{currentValue}</span>)
			}
			return total;
		}, [])
	}
}

function loop(words, searchValue, result)
{
	words.forEach(word => {
		if(word.fastResponses && word.fastResponses.length > 0)
		{
			loop(word.fastResponses, searchValue, result);
		}
		else
		{
			if(searchValue === "/" ||
				((word.response && word.response.indexOf(searchValue) > -1) ||
					(word.title && word.title.indexOf(searchValue) > -1)))
			{
				result.push(word);
			}
		}
	});
}

export default CommonWordsProxy;
