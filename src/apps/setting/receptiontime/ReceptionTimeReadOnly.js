import React from "react";
import { Button, Radio, Input, Checkbox, Icon, Switch } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './style/receptiontime.scss'
import { getReceptionTime, setReceptionTime, sureCooperate } from "./reducer/receptionTimeReducer";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import ScrollArea from 'react-scrollbar';
import ReceptionTimeTable from "./ReceptionTimeTable";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

const RadioButton = Radio.Button,
	RadioGroup = Radio.Group,
	{TextArea} = Input;

/**
 * 接待时间文档
 * http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=79659087
 * */
class ReceptionTimeReadOnly extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {canSave: false};
	}

	componentDidMount()
	{
		this.props.getReceptionTime();
	}

	get data()
	{
		let {receptionTimeData} = this.props;
		if(!receptionTimeData)
			return null;

		return receptionTimeData.get("data");
	}

	get progress()
	{
		let {receptionTimeData} = this.props;
		if(!receptionTimeData)
			return LoadProgressConst.LOAD_COMPLETE;

		return receptionTimeData.get("progress");
	}

	get error()
	{
		let {receptionTimeData} = this.props;
		if(!receptionTimeData)
			return LoadProgressConst.LOAD_COMPLETE;

		return receptionTimeData.get("msg");
	}

	onChange(checked)
	{
		this.data.receptionTime.useable = checked ? 1 : 0;

		this.forceUpdate();
	}

	onContentCheckBoxChange({target: {checked}})
	{
		this.data.receptionTime.contentUseable = checked ? 1 : 0;
		this.forceUpdate();
	}

	onSubmit()
	{
		this.props.setReceptionTime(this.data);
	}

	onContentChange({target: {value}})
	{
		this.data.receptionTime.content = value ? value : "";
	}

	getReceptionTable(itemlist, content, disabled, contentUseable)
	{
		return [
			<ReceptionTimeTable itemList={itemlist} disabled={disabled} isNew={this.onCanSave.bind(this)}/>,
			<Checkbox className="announceIO" defaultChecked={contentUseable == 1} disabled={disabled}>{getLangTxt("notice")}</Checkbox>,
			<TextArea className="announceText" defaultValue={content} disabled={disabled || contentUseable == 0}/>
		];
	}

	getUsersComp()
	{
		return (
			<p className="usersPWrapper">
				<Icon type="exclamation-circle-o"
				      style={{fontSize: '0.18rem', marginRight: 11, position: 'relative', top: '6'}}/>
				<span>{getLangTxt("note1")}</span>
				<span className="autoAnswerConfigure" style={{cursor: "pointer"}}
				      onClick={this.goToUserGroup.bind(this)}>{getLangTxt("note2")}</span>
				<span>{getLangTxt("note3")}</span>
			</p>
		);
	}

	goToUserGroup()
	{
		let path = [{"title": getLangTxt("setting_web_set"), "key": "visitorservicesetting"}, {
			"title": getLangTxt("setting_users_set"), "key": "basictemplateinfo"
		}];
		this.props.route(path);
	}

	get errorMessage()
	{
		if(this.progress === LoadProgressConst.LOAD_FAILED)
		{
			let modal = error({
				title: getLangTxt("tip1"),
				iconType: 'exclamation-circle',
				className: 'errorTip',
				content: <div>{this.error ? this.error : getLangTxt("20034")}!</div>,
				width: '320px',
				okText: getLangTxt("sure"),
				onOk: () => {
					modal.destroy();
					this.props.sureCooperate();
				}
			});
		}

		return null;
	}

	onCanSave(bool)
	{
		this.setState({canSave: bool});
	}

	render()
	{
		if(!this.data || !this.data.receptionTime)
			return null;

		let {useable, content, contentUseable, items, level} = this.data.receptionTime,
			disabled = useable != 1,
			canSave = this.state.canSave;

		if(!items)
		{
			this.data.receptionTime.items = items = [];
		}

		content = content ? content : "";

		return (
			<div className="receptionComp">
				<ScrollArea
					speed={1}
					horizontal={false}
					className="receptionScrollArea">
					<div className="receptionIO">
						<span>{getLangTxt("setting_recept_time")}</span>
						<Switch disabled={true} defaultChecked={useable == 1}/>
					</div>
					<RadioGroup disabled value={level.toString()} size="large">
						<Radio value="0">{getLangTxt("company_setting")}</Radio>
						<Radio value="1">{getLangTxt("users_setting")}</Radio>
					</RadioGroup>
					{
						level === 0 ? this.getReceptionTable(items, content, true, contentUseable) : this.getUsersComp()
					}
				</ScrollArea>
				<Button className="receptionSaveBtn" type="primary" disabled>
					{getLangTxt("sure")}
				</Button>
				{
					_getProgressComp(this.progress, 'submitStatus')
				}
				{
					this.errorMessage
				}
			</div>
		);
	}

}

function mapStateToProps(state)
{
	let {receptionTimeReducer} = state;

	return {receptionTimeData: receptionTimeReducer};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getReceptionTime, setReceptionTime, sureCooperate}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ReceptionTimeReadOnly);

