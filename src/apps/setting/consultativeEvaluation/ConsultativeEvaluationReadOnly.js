import React from 'react'
import { Radio, Tabs, Icon } from 'antd';
import EvaluateStyleReadOnly from './EvaluateStyleReadOnly';
import EvaluateContentReadOnly from './EvaluateContentReadOnly';
import './style/consultativeEvaluation.scss';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { editConfigLevel } from "../configLevel/configLevel";
import { getEvaluation, editEvaluation, clearEvaluationProgress } from './action/consultativeEvaluation';
import { Map } from "immutable";
import ConfigItemsLevel from "../../../model/vo/ConfigItemsLevel";
import { getLangTxt } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { _getProgressComp } from "../../../utils/ComponentUtils";
const TabPane = Tabs.TabPane;

class ConsultativeEvaluationReadOnly extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {}
	}
	
	componentDidMount()
	{
		
		let configLevelValue = this._getConfigLevel(),
			obj = {item: 8};
		
		this.setState({configLevelValue});
		this.props.getEvaluation(obj);
	}
	
	//设置范围 0：企业； 1：用户群；
	onSettingLevelChange(e)
	{
		
		let {target: {value: configLevelValue = ""}} = e,
			obj = {item: 8, level: configLevelValue};
		
		this.props.editConfigLevel(obj);
		this.setState({configLevelValue});
		
	};
	
	onTabChange()
	{  //切换页签调用
		this.props.clearEvaluationProgress();
	}
	
	goToUserGroup()
	{   //跳转至用户群
		let path = [{"title": getLangTxt("setting_web_set"), "key": "visitorservicesetting"},
			{
				"title": getLangTxt("setting_users_set"), "key": "basictemplateinfo", "fns": ["basictemplateinfo"],
				"custom": true
			}];
		this.props.route(path);
	}
	
	//获取评价开启级别
	_getConfigLevel()
	{
		
		let {getConfigLevel = Map()} = this.props;
		let configLevel = getConfigLevel.get(ConfigItemsLevel.Evaluate);
		
		configLevel = configLevel || 0;
		
		return configLevel;
	}
	
	//保存评价方式及内容修改信息
	saveEvaluateEdit(boolean)
	{
		if(boolean)
		{
			this.props.editEvaluation(this.evaluateList);
		}
	}
	
	//评价内容或方式Tab页渲染
	_getCompanyComponent(evaluateList)
	{
		let {conversationEvaluationMethods = []} = evaluateList,
			{progress} = this.props;
		
		return (
			<div className="oneWrap_company">
				<Tabs defaultActiveKey="1" onChange={this.onTabChange.bind(this)}>
					<TabPane tab={getLangTxt("setting_evalue_content")} key="1">
						<EvaluateContentReadOnly
							contentData={evaluateList || {}}
							saveEvaluateEdit={this.saveEvaluateEdit.bind(this)}
						/>
						{
							_getProgressComp(progress, "submitStatus evaStatus")
						}
					</TabPane>
					<TabPane tab={getLangTxt("setting_evalue_mode")} key="2">
						<EvaluateStyleReadOnly
							styleData={conversationEvaluationMethods || []}
							saveEvaluateEdit={this.saveEvaluateEdit.bind(this)}
						/>
						{
							_getProgressComp(progress, "submitStatus evaStatus")
						}
					</TabPane>
				</Tabs>
			</div>
		);
	}
	
	reFreshFn()
	{
		let obj = {item: 8};
		this.props.getEvaluation(obj);
	}
	
	render()
	{
		
		let isCompanyLevel = this.state.configLevelValue === 0,
			{configLevelValue} = this.state,
			{evaluateList, progress} = this.props;
		
		this.evaluateList = evaluateList;
		
		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
		
		return (
			<div className="consultativeEvaluation" style={{height: '100%'}}>
				{/*<div className="evaluateLevelBox">
                    <span>设置范围</span>
                    <RadioGroup className="radioBox" onChange={this.onSettingLevelChange.bind(this)}
                                value={configLevelValue}>
                        <Radio className="sameRadio" value={0}>按企业设置</Radio>
                        <Radio className="sameRadio" value={1}>按用户群设置</Radio>
                    </RadioGroup>
                </div>*/}
				{
					/*isCompanyLevel ? this._getCompanyComponent(evaluateList) : this._getUserGroupComponent()*/
					this._getCompanyComponent(evaluateList)
				}
			
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		evaluateList: state.getEvaluateList.data || {},
		getConfigLevel: state.getConfigLevel,
		progress: state.getEvaluateList.progress
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({editConfigLevel, getEvaluation, editEvaluation, clearEvaluationProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ConsultativeEvaluationReadOnly);
