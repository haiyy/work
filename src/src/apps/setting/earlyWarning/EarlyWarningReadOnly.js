import React from 'react'
import { Switch, Radio, Input, Button, Table, InputNumber, Modal, message } from 'antd';
import './style/earlyWarning.scss';
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { getEarlyWarningParams, setEarlyWarningParams, clearErrorProgress } from "./reducer/earlyWarningReducer";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import ReFresh from "../../../components/ReFresh";

const RadioGroup = Radio.Group;

class EarlyWarningReadOnly extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		this.state = {}
	}
	
	componentDidMount()
	{
		this.props.getEarlyWarningParams();
	}
	
	reFreshFn()
	{
		this.props.getEarlyWarningParams();
	}
	
	get warningData()
	{
		let {warningData} = this.props;
		
		return warningData.getIn(["warningData"]);
	}
	
	get progress()
	{
		let {warningData} = this.props;
		
		return warningData.getIn(["progress"]);
	}
	
	get errorMsg()
	{
		let {warningData} = this.props;
		
		return warningData.getIn(["errorMsg"]);
	}
	
	getDealedData()
	{
		if(!this.warningData)
			return [];
		let dataArr = [
			/*{
				rank: 1,
				dataSource:"vipAdviceEnabled",
				Scenes: "vip咨询预警",
				value: "",
				instruction: "转接人工",
				status: ""
			},*/{
				rank: 1,
				dataSource: "picEnabled",
				Scenes: getLangTxt("setting_early_warning_image"),
				value: "",
				instruction: getLangTxt("setting_early_warning_transfer"),
				status: ""
			}, {
				rank: 2,
				dataSource: "voiceEnabled",
				Scenes: getLangTxt("setting_early_warning_audio"),
				value: "",
				instruction: getLangTxt("setting_early_warning_transfer"),
				status: ""
			}, {
				rank: 3,
				dataSource: "fileEnabled",
				Scenes: getLangTxt("setting_early_warning_file"),
				value: "",
				instruction: getLangTxt("setting_early_warning_transfer"),
				status: ""
			}, {
				rank: 4,
				dataSource: "noAnswerEnabled",
				Scenes: getLangTxt("setting_early_warning_no_answer"),
				value: "",
				instruction: getLangTxt("setting_early_warning_transfer"),
				status: ""
			}/*,{
                rank: 6,
                dataSource:"evaluateEnabled",
                Scenes: "差评预警",
                value: "",
                instruction: "转接人工",
                status: ""
            }*/, {
				rank: 5,
				dataSource: "chatTimeoutEnabled",
				Scenes: getLangTxt("setting_early_warning_conver_time"),
				value: "",
				instruction: getLangTxt("setting_early_warning_transfer"),
				status: ""
			}, {
				rank: 6,
				dataSource: "chatCountEnabled",
				Scenes: getLangTxt("setting_early_warning_conver_count"),
				value: "",
				instruction: getLangTxt("setting_early_warning_transfer"),
				status: ""
			}, {
				rank: 7,
				dataSource: "keywordEnabled",
				Scenes: getLangTxt("setting_early_warning_keys"),
				value: "",
				instruction: getLangTxt("setting_early_warning_transfer"),
				status: ""
			}
		];
		
		dataArr.forEach(item => {
			item.status = this.warningData[item.dataSource];
			switch(item.dataSource)
			{
				case "noAnswerEnabled":
					item.value = [/*<RadioGroup value={this.warningData["noAnswerType"]} onChange={this.getRadioGroupValue.bind(this, "noAnswerType")}>
                            <Radio value={0}>连续</Radio>
                            <Radio value={1}>累计</Radio>
                        </RadioGroup>,*/
						<span>{getLangTxt("accumulative")}</span>,
						<InputNumber disabled className="noAnswerTime" value={this.warningData["noAnswerValue"]}
						             style={{width: "50px"}}/>, <span>{getLangTxt("frequency")}</span>];
					break;
				case "evaluateEnabled":
					item.value = <RadioGroup disabled value={this.warningData["evaluateValue"]}>
						<Radio value={1}>1星</Radio>
						<Radio value={2}>2星</Radio>
						<Radio value={3}>3星</Radio>
						<Radio value={4}>4星</Radio>
						<Radio value={5}>5星</Radio>
					</RadioGroup>;
					break;
				case "chatTimeoutEnabled":
					item.value = <div>
						<InputNumber disabled className="chatTimeStyle" value={this.warningData["chatTimeoutMinValue"]}
						             style={{width: "50px"}}
						             min={1}/><span className="chatTimeStyle">{getLangTxt("minute")}</span>
						<InputNumber disabled className="chatTimeStyle" value={this.warningData["chatTimeoutSecValue"]}
						             style={{width: "50px"}}
						             min={1}/><span className="chatTimeStyle">{getLangTxt("second")}</span>
					</div>;
					break;
				case "chatCountEnabled":
					item.value = <div>
						<InputNumber disabled className="chatTimeStyle" value={this.warningData["chatCountValue"]}
						             style={{width: "50px"}}
						             min={1}/>{getLangTxt("page")}
					</div>;
					break;
				case "keywordEnabled":
					item.value = <Input disabled className='keyWordIpt' value={this.warningData["keywordValue"]}/>;
					break;
				default:
					item.value = <div>{getLangTxt("noData3")}</div>
			}
		});
		
		return dataArr;
	}
	
	render()
	{
		let dataArr = this.getDealedData();
		if(this.progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
		
		return (
			<div className="early-warning">
				<Table pagination={false} columns={this.getColumns()} dataSource={dataArr}/>
				<div className="company-footer">
					<Button disabled className="primary" type="primary">{getLangTxt("sure")}</Button>
				</div>
				{
					_getProgressComp(this.progress)
				}
			</div>
		)
	}
	
	getColumns()
	{
		return [
			{
				dataIndex: "rank",
				title: getLangTxt("serial_number"),
				className: "rankStyle"
			}, {
				dataIndex: "Scenes",
				title: getLangTxt("setting_early_warning_scene")
			}, {
				dataIndex: "value",
				title: getLangTxt("setting_early_warning_value")
			}, {
				dataIndex: "instruction",
				title: getLangTxt("setting_early_warning_instructions")
			}, {
				dataIndex: "status",
				title: getLangTxt("setting_early_warning_state"),
				render: (text, record) => <Switch disabled className="warningSwitch" checked={text == 1}/>
			}
		]
	}
}

function mapStateToProps(state)
{
	return {warningData: state.earlyWarningReducer}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		getEarlyWarningParams, setEarlyWarningParams, clearErrorProgress
	}, dispatch)
	
}

export default connect(mapStateToProps, mapDispatchToProps)(EarlyWarningReadOnly)

