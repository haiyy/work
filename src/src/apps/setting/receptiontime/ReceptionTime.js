	import React from "react";
import { Button, Radio, Input, Checkbox, Icon, Switch, Modal, message } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import './style/receptiontime.scss'
import { getReceptionTime, setReceptionTime, sureCooperate } from "./reducer/receptionTimeReducer";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import ScrollArea from 'react-scrollbar';
import ReceptionTimeTable from "./ReceptionTimeTable";
import { bglen, stringLen } from "../../../utils/StringUtils";

const RadioButton = Radio.Button,
	RadioGroup = Radio.Group,
	{TextArea} = Input;

/**
 * 接待时间文档
 * http://confluence.xiaoneng.cn/pages/viewpage.action?pageId=79659087
 * */
class ReceptionTime extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
			canSave: false,
			announceLen: null
		};
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
        try
        {
            message.destroy();
        }
        catch(e) {}

		let {announceLen} = this.state;
		if(announceLen <= 500)
		{
			this.props.setReceptionTime(this.data);
		}
		else
		{
			message.error(getLangTxt("setting_notice_note"));
		}
	}

	judgeAnnounceLen({target: {value}})
	{
		let announceLen = stringLen(value);

		this.data.receptionTime.content = value ? value : "";
		this.setState({announceLen});
	}

	getReceptionTable(itemlist, content, disabled, contentUseable)
	{
		let announceNum = stringLen(content),
			{announceLen} = this.state,
			textIllegalStatus = announceLen > 500 ? "announceText illegalStatus" : "announceText",
			textLenStatus = announceLen > 500 ? "textLenStatus illegalTextLenStatus" : "textLenStatus";

		if(announceLen != announceNum)
			this.setState({
				announceLen: announceNum
			});

		return [
			<ReceptionTimeTable itemList={itemlist} disabled={disabled} isNew={this.onCanSave.bind(this)}
			                    cansave={this.cansave}/>,
			<Checkbox className="announceIO" defaultChecked={contentUseable == 1} disabled={disabled}
			          onChange={this.onContentCheckBoxChange.bind(this)}>{getLangTxt("notice")}</Checkbox>,
            <div className="receptionTimeTextArea">
                <TextArea className={textIllegalStatus} value={content} disabled={disabled || contentUseable == 0}
                    onChange={this.judgeAnnounceLen.bind(this)}/>
                <span className={textLenStatus}>{announceLen + "/500"}</span>
            </div>

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
		let path = [{"title": getLangTxt("setting_web_set"), "key": "visitorservicesetting"},
			{
				"title": getLangTxt("setting_users_set"), "key": "basictemplateinfo", "fns": ["basictemplateinfo"],
				"custom": true
			}];
		this.props.route(path);
	}

	onLevelChange({target: {value}})
	{
		this.data.receptionTime.level = parseInt(value);
		this.forceUpdate();
	}

	get errorMessage()
	{
		if(this.progress === LoadProgressConst.SAVING_FAILED)
		{
			let modal = Modal.error({
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

	get cansave()
	{
		try
		{
			let index = this.data.receptionTime.items.findIndex(value => (!value.itemid || value.isEdit));

			return index > 0;
		}
		catch(e)
		{

		}

		return false;
	}

	onCanSave()
	{
		this.forceUpdate();
	}

	render()
	{
		if(!this.data || !this.data.receptionTime)
			return null;

		let {useable, content, contentUseable, items, level} = this.data.receptionTime,
			disabled = useable != 1;

		if(!items)
		{
			this.data.receptionTime.items = items = [];
		}

		content = content ? content : "";

		return (
			<div className="receptionComp">
				<div className="receptionScrollArea">
					<div className="receptionIO">
						<span>{getLangTxt("setting_recept_time")}</span>
						<Switch checked={useable == 1} onChange={this.onChange.bind(this)}/>
					</div>
					<RadioGroup value={level.toString()} size="large"
					            onChange={this.onLevelChange.bind(this)}>
						<Radio value="0">{getLangTxt("company_setting")}</Radio>
						<Radio value="1">{getLangTxt("users_setting")}</Radio>
					</RadioGroup>
					{
						level === 0 ? this.getReceptionTable(items, content, disabled, contentUseable) : this.getUsersComp()
					}
				</div>
				<div className="footer">
					<Button className="receptionSaveBtn" type="primary" onClick={this.onSubmit.bind(this)}
							disabled={this.cansave}>
						{getLangTxt("save")}
					</Button>
				</div>
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

export default connect(mapStateToProps, mapDispatchToProps)(ReceptionTime);

