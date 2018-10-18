import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Button, InputNumber, Switch, message } from 'antd';
import './style/queueManage.scss';
import {getQueueRules, setQueueRules} from "./reducer/queueManageReducer";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import Select from "../../public/Select";

const Option = Select.Option;

class QueueRules extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
            isWarnedMaxNum: false,
            isWarnedMaxTime: false
		};
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

    //排队规则方式选择
    onQueueRuleChange(checked)
    {
        this.queueRulesData.sizeUseable = checked ? 1 : 0;


        this.setState({isUpdate: !this.state.isUpdate, isWarnedMaxNum: false, isWarnedMaxTime: false});
    }

    onQueueRuleChange2(checked)
    {
        this.queueRulesData.timeUseable = checked ? 1 : 0;

        this.setState({isUpdate: !this.state.isUpdate, isWarnedMaxNum: false, isWarnedMaxTime: false});
    }

    //排队上限人数
    onQueueMemberChange(value)
    {
        this.queueRulesData.size = value;

        this.setState({isUpdate: !this.state.isUpdate, isWarnedMaxNum: false, isWarnedMaxTime: false});
    }

    //排队规则时间类型选择
    onTimeTypeChange(value)
    {
        this.queueRulesData.timeType = value;

        this.setState({isUpdate: !this.state.isUpdate, isWarnedMaxNum: false, isWarnedMaxTime: false});
    }

    //排队规则时间
    onQueueTimeChange(value)
    {
        this.queueRulesData.timeOut = value;

        this.setState({isUpdate: !this.state.isUpdate, isWarnedMaxNum: false, isWarnedMaxTime: false});
    }

    //保存排队规则
    handleSaveQueueRules()
    {
        let {isWarnedMaxNum, isWarnedMaxTime} = this.state;
        if (!this.queueRulesData.size)
        {
            if (!isWarnedMaxNum)
            {
                message.error(getLangTxt("setting_queue_rule_note1"));
                this.setState({isWarnedMaxNum: true});
            }

            return false;
        }
        if (!this.queueRulesData.timeOut)
        {
            if (!isWarnedMaxTime)
            {
                message.error(getLangTxt("setting_queue_rule_note2"));
                this.setState({isWarnedMaxTime: true});
            }

            return false;
        }
        this.props.setQueueRules(this.queueRulesData);
    }

	render()
	{

        let {queueMangeData} = this.props;

        this.queueRulesData = queueMangeData.getIn(["queueRules"]) || {};

        let {sizeUseable, timeUseable, size, timeOut, timeType = ""} = this.queueRulesData,
            progress = queueMangeData.getIn(["progress"]) || 2;

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
            <div className="queueRules">
                <div className="queueRulesTitle">{getLangTxt("setting_queue_limit")}</div>
                <div className="queueRulesContent">
                    <Switch checked={sizeUseable === 1} onChange={this.onQueueRuleChange.bind(this)}/>
                    <span>{getLangTxt("setting_queue_rule_word1")}</span>
                    <InputNumber
                        min={1}
                        max={500}
                        precision={0}
                        value={size}
                        onChange={this.onQueueMemberChange.bind(this)}
                    />
                    <span>{getLangTxt("setting_queue_rule_word2")}</span>
                </div>
                <div className="queueRulesContent">
                    <Switch checked={timeUseable === 1} onChange={this.onQueueRuleChange2.bind(this)}/>
                    <span>{getLangTxt("setting_queue_rule_word3")}</span>
                    <InputNumber
                        min={1}
                        max={120}
                        precision={0}
                        value={timeOut}
                        onChange={this.onQueueTimeChange.bind(this)}
                    />
                    <Select value={timeType} style={{ width: "80px" }}
                        onChange={this.onTimeTypeChange.bind(this)}
                        option={[<Option value={1}>{getLangTxt("minute")}</Option>,
                        <Option value={0}>{getLangTxt("second")}</Option>]}
                    />
                    <span>{getLangTxt("setting_queue_rule_word4")}</span>
                </div>
                <div className="queueGroupFooter">
                    <Button className="primary" type="primary" onClick={this.handleSaveQueueRules.bind(this)}>{getLangTxt("save")}</Button>
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
	return bindActionCreators({getQueueRules, setQueueRules}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueRules);
