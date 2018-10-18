import React, { Component } from 'react';
import { Input, Select, Tree, Popover, Button, Checkbox } from 'antd';
import '../../../../public/styles/chatpage/usualTips.scss'
import Model from "../../../../utils/Model";
import CommonWordsProxy from "../../../../model/proxy/CommonWordsProxy";
import InputMessage from "../../../../model/vo/InputMessage";
import { bglen } from "../../../../utils/StringUtils";
import { getNoDataComp } from "../../../../utils/ComponentUtils";
import TreeNode from "../../../../components/antd2/tree/TreeNode";
import IndexScrollArea from "../../../../components/IndexScrollArea";
import { getLangTxt } from "../../../../utils/MyUtil";
import ".././style/UsualTips.scss";

const Option = Select.Option;

class UsualTips extends React.PureComponent {
	
	static TEXT_TYPE = 1;
	static FILE_TYPE = 2;
	static IMG_TYPE = 3;
	
	static ALL = '0';  //全部
	static COMPANY = '1';  //企业
	static PERSON = '2';  //个人
	static TEMPLATE = '3';  //模版
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			commonWords: [],
			searchVal: "",
			selectedKeys: []
		};
		
		this._currentType = UsualTips.ALL;
		let smartInput = localStorage.getItem("smartInput");
		
		this.smartInputOn = smartInput != 0;
	}
	
	componentDidMount()
	{
		this._onSelect(this._currentType); 
	}
	
	get _commonWordsProxy()
	{
		return Model.retrieveProxy(CommonWordsProxy.NAME);
	}
	
	_getCommonWordsFromType(value)
	{
		switch(value)
		{
			case UsualTips.COMPANY:
				return this._commonWordsProxy.companyCommonWords;
			
			case UsualTips.PERSON:
				return this._commonWordsProxy.personnalCommonWords;
			
			case UsualTips.TEMPLATE:
				return this._commonWordsProxy.templateCommonWords;
		}
		
		return this._commonWordsProxy.allCommonWords;
	}
	
	_onSelect(value, option, forceUpdate = false)
	{
		this._currentType = value;
		
		let commonWords = forceUpdate ? [] : this._getCommonWordsFromType(value);
		
		if(commonWords.length <= 0)
		{
			this._commonWordsProxy.loadData(value)
			.then(success => {
				commonWords = this._getCommonWordsFromType(value);
				this.state.searchVal && (commonWords = CommonWordsProxy.searchCommonWords(this.state.searchVal, this._getCommonWordsFromType(value)));
				this.setState({commonWords});
			});
		}
		else
		{
			this.state.searchVal && (commonWords = CommonWordsProxy.searchCommonWords(this.state.searchVal, this._getCommonWordsFromType(value)));
			this.setState({commonWords});
		}
	}
	
	searchTips(e)
	{
		//搜索常用话术基础版
		let searchVal = e.target.value;
		
		this.state.searchVal = searchVal;
		
		if(searchVal)
		{
			let currentWords = this._getCommonWordsFromType(this._currentType),
				commonWords = CommonWordsProxy.searchCommonWords(searchVal, currentWords);
			
			this.setState({commonWords});
		}
		else
		{
			this._onSelect(this._currentType);
		}
	}
	
	_getCommonWordsComp(commonWords)
	{
		return commonWords.map((word) => {
			if(word.groupName)  //是否是组
			{
				if(!word.fastResponses)
					return <TreeNode key={word.groupId} title={this._getGroupName(word.groupName)}
					                 groupId={word.groupId}/>;
				
				return <TreeNode key={word.groupId} title={this._getGroupName(word.groupName)} groupId={word.groupId}>
					{
						this._getCommonWordsComp(word.fastResponses, word.groupId)
					}
				</TreeNode>;
			}
			else
			{
				return <TreeNode key={word.itemId} title={this._getWordComp(word)} data={word} isLeaf={true}/>;
			}
		});
	}
	
	_getGroupName(groupName)
	{
		return bglen(groupName) > 47 ?
			<Popover
				content={<div style={{width: '2rem', wordBreak: 'break-word'}}>{groupName}</div>}
				title="" placement="topLeft">
				<span>{groupName}</span>
			</Popover>
			:
			<span>{groupName}</span>
	}
	
	_getWordComp(word)
	{
		if(word.type === UsualTips.FILE_TYPE) //文件
		{
			let fileData = JSON.parse(word.response);
			return <div className="fileBox">
				<div className="fileBoxLeft">
					<img src={require("../../../../public/images/chat_file.png")}/>
				</div>
				{
					bglen(fileData.fileName) > 47 ?
						<Popover
							content={<div style={{width: '320px', wordBreak: 'break-word'}}>{fileData.fileName}</div>}
							title="" placement="topLeft">
							<a href={fileData.fileUrl}>{fileData.fileName}</a>
						</Popover>
						:
						<a href={fileData.fileUrl}>{fileData.fileName}</a>
				}
			</div>;
		}
		else if(word.type === UsualTips.IMG_TYPE)  //图片
		{
			let imgData = JSON.parse(word.response);
			return (
				<div className="imgBox">
					<div className="imgBoxLeft">
						<img className="imgCon" src={imgData.imgUrl} alt={imgData.imgName} {...onErrorEvtObject()}/>
					</div>
					{
						bglen(imgData.imgName) > 47 ?
							<Popover
								content={<div className="popoverStyle"
								              style={{width: '320px', wordBreak: 'break-word'}}>{imgData.imgName}</div>}
								title=""
								placement="topLeft">
								<span className="imgNameCon">{imgData.imgName}</span>
							</Popover>
							:
							<span className="imgNameCon">{imgData.imgName}</span>
					}
				</div>
			);
		}
		else
		{
			return (
				bglen(word.title) + bglen(word.response) > 46 ?
					<Popover
						content={<div className="popoverStyle" style={{width: '320px', wordBreak: 'break-word'}}><span
							style={{fontWeight: 'bold'}}>【{word.title}】</span>{word.response}</div>} title=""
						placement="topLeft">
						<div className="textTipBox">
							<i className="textTipTitle">【{word.title}】</i>
							<span>{word.response}</span>
						</div>
					</Popover>
					:
					<div className="textTipBox">
						<i className="textTipTitle">【{word.title}】</i>
						<span>{word.response}</span>
					</div>
			);
		}
	}
	
	_onSelectWords(selectedKeys, {node, selected})
	{
		if(selected)
		{
			let data = node.props.data || {},
				{response = "", title = "", type} = data,
				{chatData = {}} = this.props,
				forceSend = type === UsualTips.FILE_TYPE;
			
			if(type !== undefined)
			{
				let inputMessage = new InputMessage(type, response, forceSend);
				
				chatData.inputMessage = inputMessage;
			}
			
			this.setState({selectedKeys: []});
		}
	}
	
	onRefresh()
	{
		this._onSelect(this._currentType, "", true);
	}
	
	onChange(e)
	{
		let smartInput = e.target.checked ? 1 : 0;
		localStorage.setItem("smartInput", smartInput);
	}
	
	render()
	{
		return (
			<div className="usualTIpsStyle">
				<div className="usualTIpsStyleLeft">
					<div className="searchValueBox clearFix">
						<Select className="searchSelect" defaultValue={UsualTips.ALL}
						        onSelect={this._onSelect.bind(this)}
						        getPopupContainer={() => document.querySelector(".ant-layout-aside")}>
							<Option value={UsualTips.ALL}>{getLangTxt("rightpage_all")}</Option>
							<Option value={UsualTips.COMPANY}>{getLangTxt("rightpage_company")}</Option>
							<Option value={UsualTips.PERSON}>{getLangTxt("rightpage_person")}</Option>
						</Select>
						<Input className="searchIpt" placeholder={getLangTxt("rightpage_search")} value={this.state.searchVal}
						       onChange={this.searchTips.bind(this)}/>
						<Button type="primary" shape="circle" size="small" onClick={this.onRefresh.bind(this)}>
							<i className="icon-shuaxin iconfont"/>
						</Button>
					</div>
				</div>
				
				<div className="usualTIpsStyleRight">
					<IndexScrollArea ref={node => this.scrollArea = node} speed={1} style={{height: '100%'}}
					                 smoothScrolling>
						<Tree onSelect={this._onSelectWords.bind(this)} selectedKeys={this.state.selectedKeys} style={{height: '100%', width:"100%"}}>
							{
								this.state.commonWords.length ?
									this._getCommonWordsComp(this.state.commonWords)
									: getNoDataComp()
							}
						</Tree>
					</IndexScrollArea>
				</div>
				{
					this.props.smartInputHide ? null :
							<Checkbox defaultChecked={this.smartInputOn} onChange={this.onChange.bind(this)}>{getLangTxt("rightpage_command_word_on")}</Checkbox>
				}

			</div>
		)
	}
}

function onErrorEvtObject()
{
	return {
		onError: (event) => {
			if(event && event.target)
			{
				event.target.src = require("../../../../public/images/failedLoad.png");
				event.target.className = "img_load_error";
			}
		}
	};
}

export default UsualTips;


