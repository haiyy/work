import React from 'react'
import { Form, Switch, Icon } from 'antd'
import FaqSettingCommon from './FaqSettingCommon'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { editConfigLevel } from "../configLevel/configLevel"
import './style/faqSetting.scss';
import { Map } from "immutable";
import ConfigItemsLevel from "../../../model/vo/ConfigItemsLevel";
import { getLangTxt } from "../../../utils/MyUtil";

class FaqSetting extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
			listSetting: true,
			outputvisible: false,
			typeSetting: false,
			newfaq: false,
			newlist: false,
			faqnewlist: [{"title": "", "time": "", "parent": "", "answer": "", "key": "1"}],
			faqopen: 1,
			faqagain: false,
			addQues: false,
			startTime: '',
			endTime: '',
			newFaqName: ''
		};
	}
	
	componentDidMount()
	{
		let configLevel = this._getConfigLevel();
		if(configLevel == 0)
			this.setState({typeSetting: true});
	}
	
	handleClickListSetting()
	{
		this.setState({listSetting: !(this.state.listSetting)})
	}
	
	handleClickTypeSetting()
	{
		this.setState({typeSetting: !this.state.typeSetting});
		let configLevel = this._getConfigLevel(), data = {item: 3}, obj;
		if(!configLevel)
		{
			obj = {item: 3, level: 1};
			this.props.editConfigLevel(obj);
		}
		else if(configLevel)
		{
			obj = {item: 3, level: 0};
			this.props.editConfigLevel(obj);
		}
	}
	
	_getUserGroupFaqSetting()
	{
		return (
			<div>
				<p className="userGroupPWrapper">
					<Icon type="exclamation-circle-o" style={{
						fontSize: "0.18rem", display: 'inline-block', marginRight: "15px",
						marginTop: "-5px", verticalAlign: "middle"
					}}/>
					<span>{getLangTxt("note1")}</span>
					<span className="autoAnswerConfigure" onClick={this.goToUserGroup.bind(this)}
					      style={{cursor: "pointer"}}>{getLangTxt("note2")}</span>
					<span>{getLangTxt("note3")}</span>
				</p>
			</div>
		)
	}
	
	//跳转至访客聊窗
	goToWebChat()
	{
		let path = [{"title": getLangTxt("setting_web_set"), "key": "visitorservicesetting"},
			{"title": getLangTxt("setting_webview"), "key": "webview", "fns": ["webview_edit", "webview_check"]}];
		this.props.route(path)
	}
	
	//跳转至用户群
	goToUserGroup()
	{
		let path = [{"title": getLangTxt("setting_web_set"), "key": "visitorservicesetting"}, {
			"title": getLangTxt("setting_users_set"), "key": "basictemplateinfo", "fns": ["basictemplateinfo"], "custom": true
		}];
		this.props.route(path)
	}
	
	_getConfigLevel()
	{
		let {getConfigLevel = Map()} = this.props;
		let configLevel = getConfigLevel.get(ConfigItemsLevel.FaqSetting);
		
		configLevel = configLevel === undefined ? 0 : configLevel;
		
		return configLevel;
	}
	
	render()
	{
		let configLevel = this._getConfigLevel();
		
		return (
			<div className="faqsetting" style={{height: "100%", position: "relative"}}>
				<div style={{position: "relative", zIndex: '10', overflow: 'hidden'}}>
					<h2 className="faqsetting_pad">
						<i className="iconfont icon-011tishi"/>
						<span>{getLangTxt("setting_faq_tip1")}</span>
						<a className="autoAnswerConfigure" onClick={this.goToWebChat.bind(this)}
						   style={{margin: "0 5px"}} href="javascript:;">
							{getLangTxt("setting_faq_tip2")}
						</a>
						<span>{getLangTxt("setting_faq_tip3")}</span>
					</h2>
					
					<div style={{float: 'left', marginTop: '0.05rem', width: '100%'}}>
						<span className="faqsetting_settitle">{getLangTxt("setting_faq_dimension_set")}</span>
						<div style={{float: 'left', marginLeft: '20px'}}>
							<Switch defaultChecked={configLevel === 0} checked={this.state.typeSetting}
							        onChange={this.handleClickTypeSetting.bind(this)}/>
							
							<span style={{marginLeft: '12px', marginRight: '55px'}}>
								{getLangTxt("company_setting")}
                            </span>
							
							<Switch defaultChecked={configLevel === 1} checked={!this.state.typeSetting}
							        onChange={this.handleClickTypeSetting.bind(this)}/>
							
							<span style={{marginLeft: "12px"}}>{getLangTxt("users_setting")}</span>
						</div>
					</div>
				</div>
				
				<div className="faqsetting-body">
					{configLevel === 1 ? this._getUserGroupFaqSetting() : <FaqSettingCommon/>}
				</div>
			</div>
		)
	}
}

FaqSetting = Form.create()(FaqSetting);

function mapStateToProps(state)
{
	return {
		getConfigLevel: state.getConfigLevel
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		editConfigLevel
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(FaqSetting));
