import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Button, InputNumber, Switch, Select } from 'antd';
import './style/queueManage.scss';
import { getQueueRules } from "./reducer/queueManageReducer";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";

class QueueRulesReadOnly extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {};
	}
	
	queueRulesData = null;
	
	componentDidMount()
	{
		this.props.getQueueRules();
	}
	
	componentWillUnmount()
	{
		this.queueRulesData = null;
	}
	
	render()
	{
		
		let {queueMangeData} = this.props;
		
		this.queueRulesData = queueMangeData.getIn(["queueRules"]) || {};
		
		let {sizeUseable, timeUseable, size, timeOut, timeType} = this.queueRulesData,
			progress = queueMangeData.getIn(["progress"]) || 2;
		
		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
		
		return (
			<div className="queueRules">
				<div className="queueRulesTitle">{getLangTxt("setting_queue_limit")}</div>
				<div className="queueRulesContent">
					<Switch disabled={true} checked={sizeUseable === 1}/>
					<span>{getLangTxt("setting_queue_rule_word1")}</span>
					<InputNumber
						disabled
						min={1}
						max={500}
						precision={0}
						value={size}
					/>
					<span>{getLangTxt("setting_queue_rule_word2")}</span>
				</div>
				<div className="queueRulesContent">
					<Switch disabled={true} checked={timeUseable === 1}/>
					<span>{getLangTxt("setting_queue_rule_word3")}</span>
					<InputNumber disabled min={1} max={120} precision={0} value={timeOut}/>
					<Select disabled value={timeType + ''} style={{width: "80px"}}>
						<Option value={1 + ''}>{getLangTxt("minute")}</Option>
						<Option value={0 + ''}>{getLangTxt("second")}</Option>
					</Select>
					<span>{getLangTxt("setting_queue_rule_word4")}</span>
				</div>
				<div className="queueGroupFooter">
					<Button disabled className="primary" type="primary">{getLangTxt("save")}</Button>
				</div>
				{
					_getProgressComp(progress, "submitStatus queueStatus")
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		queueMangeData: state.queueManageReducer
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getQueueRules}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueRulesReadOnly);
