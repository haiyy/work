import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Button, Form, Radio, Input } from 'antd';
import { getInfomation, setInfomation, clearInformationProgress } from './action/personalSetting';
import Upload from "./Upload";
import { getLangTxt, upload, UPLOAD_IMAGE_ACTION } from "../../../utils/MyUtil";
import "./style/personalInformation.scss";
import { Map } from "immutable";
import { getProgressComp, _getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

const FormItem = Form.Item, RadioGroup = Radio.Group;

class Information extends Component {

	constructor(props)
	{
		super(props);
		this.state = {
			visible: false,
			imagesInfo: {
				cropResult: null,
				thumbImage: null,
				style: null,
				src: null
			},
			signature_help: null
		}
	}

	componentDidMount()
	{
		this.props.getInfomation();
	}

	componentWillReceiveProps(nextProps)
	{

		let {state, progress: nextProgress, information, isIgnoreEdit} = nextProps,
            {progress: thisProgress, information: informationThis, isIgnoreEdit: isIgnoreEditThis} = this.props;

        if (information && !informationThis)
        {
            this.handleSubmit();
        }

        if (isIgnoreEdit && !isIgnoreEditThis)
        {
            this.props.form.resetFields();
        }

        if (thisProgress === LoadProgressConst.SAVING_SUCCESS)
        {
            // this.props.onCancel();
            this.props.clearInformationProgress()
        }

        if (nextProgress !== thisProgress)
        {
            if (nextProgress === LoadProgressConst.SAVING_FAILED)
            {
                this.getSavingErrorMsg();
            }
        }
		if(state)
		{
			let cropResult = state.usericon;
			if(cropResult)
			{
				this.setState({imagesInfo: cropResult})
			}
		}
	}

    getSavingErrorMsg()
    {
        error({
            title: getLangTxt("tip1"),
            iconType: 'exclamation-circle',
            className: 'errorTip',
            okText: getLangTxt("sure"),
            content: <div>{getLangTxt("20034")}</div>,
            width: '320px',
            onOk:()=>{
                this.props.clearInformationProgress()
            }
        });
    }

	uploadClick()
	{
		this.setState({visible: true})
	}

	onCancel()
	{
		this.props.onCancel();
	}

    getCroperImage(srcData)
	{
        let cropResult = srcData.cropResult,
            type = UPLOAD_IMAGE_ACTION, imagesInfo = this.state.imagesInfo;

		upload(cropResult, type, true)
		.then((res) =>
		{
			let jsonResult = res.jsonResult,
				{data = {srcFile: {}, thumbnailImage: {}}, success} = jsonResult,
				{srcFile = {}, thumbnailImage = {}} = data;
			if(!success) return;

			imagesInfo.cropResult = srcFile.url;
			imagesInfo.thumbImage = thumbnailImage.url;
			imagesInfo.style = srcData.style;
			this.setState({imagesInfo: {...imagesInfo}});
		});
	}

	handleOk()
	{
		this.setState({visible: false})
	}

	handleCancel()
	{
		this.setState({visible: false})
	}

	imageModify()
	{
		this.setState({visible: true})
	}

	_checkPhone(rule, value, callback)
	{
		if(value == "")
		{
			callback()
		}
		let call = (/^1\d{10}$/.test(value));
		if(!call)
		{
			callback("telphone error");
		}
		else
		{
			callback();
		}
	}

	judgeEmptyValue(information)
	{
		if(information.mobile == "")
		{
			information.mobile = " "
		}
		if(information.phone == "")
		{
			information.phone = " "
		}
		if(information.signature == "")
		{
			information.signature = " "
		}
		return information;
	}

    getRoleId(selectedRole)
    {
        let roleId = [];
        selectedRole && selectedRole.map(item => {
            roleId.push(item.roleid);
        });

        return roleId;
    }

    getTagId(selectedTag)
    {
        let tagId = [];
        selectedTag && selectedTag.map(item=>{
            tagId.push(item.tagid);
        });

        return tagId;
    }

	handleSubmit(e)
	{
        if (e)
            e.preventDefault();
		this.props.form.validateFields((errors) =>
		{
			if(errors)
            {
                this.props.afterSavingData("information");
                return;
            }

			let {userData = {}} = this.props,
                information = this.props.form.getFieldsValue(["nickname", "externalname", "gender", "mobile", "phone", "signature"]);

			this.judgeEmptyValue(information);
			if(this.state.imagesInfo.cropResult)
			{
				information.portrait = this.state.imagesInfo.cropResult;
			}

			Object.assign(userData, information);
            userData.groupid = userData.group && userData.group.groupid;
            userData.roleid = this.getRoleId(userData.role);
            userData.tagid = this.getTagId(userData.tag);

            delete userData.group;
            delete userData.role;
            delete userData.tag;
            delete userData.password;

			this.props.setInfomation(userData);
            this.props.afterSavingData("information", true);
        });
	}

	judgeEditDataEmptyValue(information)
	{
		if(information.mobile == " ")
		{
			information.mobile = ""
		}
		if(information.phone == " ")
		{
			information.phone = ""
		}
		if(information.signature == " ")
		{
			information.signature = ""
		}
		return information;
	}

	handelSignatureValueFun({target: {value}})
	{
		let signature_help = value ? value.length : 0;

		this.setState({signature_help: signature_help + '/30'});
	}

    reFreshFn()
    {
        this.props.getInfomation();
    }

    judgeSpace(rule, value, callback)
    {
        if (value && typeof value !== "string")
            return callback();

        if(value && value.trim() !== "")
        {
            callback();
        }
        callback(" ");
    }

    savingErrorTips()
    {
        warning({
            title:getLangTxt("err_tip"),
            iconType: 'exclamation-circle',
            className: 'errorTip',
            content: getLangTxt("personalset_note1"),
            width: '320px',
            okText: getLangTxt("sure")
        });
    }

	render()
	{
		let {
			userData = {
				nickname: "", externalname: "", gender: 0, mobile: "", phone: "", signature: "", portrait: ""
			},progress
		} = this.props;

		if(userData)
		{
			this.judgeEditDataEmptyValue(userData);
		}

		let {nickname = '', externalname = '', gender = 1, mobile, phone, signature = "", portrait} = userData,
			{getFieldDecorator} = this.props.form,
			formItemLayout = {
				labelCol: {span: 7},
				wrapperCol: {span: 12},
				hasFeedback: true
			},
			formItemLayout2 = {
				labelCol: {span: 7},
				wrapperCol: {span: 12}
			},
			title = (
				<span>
					<i style={{position: "relative", top: "2px", paddingRight: "5px"}}
					   className="icon iconfont icon-ren"/> {getLangTxt("setting_change_avatar")}
				</span>
			),
            minCropBoxSize={width: 150, height: 150};

		if(mobile == " ")
		{
			mobile = ""
		}

		let signature_help = this.state.signature_help || signature.length + "/30";

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        if (progress === LoadProgressConst.SAVING_FAILED)
            this.savingErrorTips();

		return (
			<div className="information personalise">
				<Form onSubmit={this.handleSubmit.bind(this)}>
					<FormItem {...formItemLayout} label="头像">
						<div style={{height: "0.45rem"}}>
							{
								this.state.imagesInfo.cropResult || portrait ?
									<span className="images-croper">
                                        <img style={{width: "0.45rem", height: "0.45rem"}}
                                             src={this.state.imagesInfo.thumbImage || portrait}
                                             alt="cropped image"/>
                                        <span className="modify" onClick={this.imageModify.bind(this)}>{getLangTxt("edit")}</span>
                                     </span>
									:
									<span className="image-upload" onClick={this.uploadClick.bind(this)}>
                                        <i className="icon-tianjia1 iconfont"/>
                                        <span className="upload">{getLangTxt("personalset_upload")}</span>
                                    </span>
							}
						</div>

					</FormItem>

					{
						this.state.visible ?
							<Modal title={title} style={{height: "550px"}} footer={null} okText={getLangTxt("save")}
							       className="model-upload" width={820} visible={true}
							       onCancel={this.handleCancel.bind(this)}>
								<Upload getCroperImage={this.getCroperImage.bind(this)}
                                        onOk={this.handleOk.bind(this)}
								        onCancel={this.handleCancel.bind(this)}
								        imagesInfo={ this.state.imagesInfo }
                                        minCropBoxSize={minCropBoxSize}
                                />
							</Modal> : null
					}

					<FormItem className="userInfoFormItem" {...formItemLayout} label={getLangTxt("personalset_internal_name")} help={getLangTxt("personalset_internal_name_note")}>
						{
							getFieldDecorator('nickname', {
								initialValue: nickname, rules: [{required: true, max: 16, message: ' '},
                                {validator: this.judgeSpace.bind(this)}]
							})(
								<Input />
							)
						}
					</FormItem>

					<FormItem className="userInfoFormItem" {...formItemLayout} label={getLangTxt("personalset_external_name")} help={getLangTxt("personalset_external_name_note")}>
						{
							getFieldDecorator('externalname', {
								initialValue: externalname, rules: [{required: true, max: 16, message: ' '},
                                    {validator: this.judgeSpace.bind(this)}]
							})(
								<Input/>
							)
						}
					</FormItem>

					<FormItem {...formItemLayout2} label={getLangTxt("personalset_sex")}>
						{
							getFieldDecorator('gender', {initialValue: gender})(
								<RadioGroup>
									<Radio value={1}>男</Radio>
									<Radio value={0}>女</Radio>
								</RadioGroup>
							)
						}
					</FormItem>

					<FormItem className="userInfoFormItem" {...formItemLayout} label={getLangTxt("personalset_phone")} help={getLangTxt("personalset_phone_note")}>
						{
							getFieldDecorator('mobile', {
								initialValue: mobile, rules: [{validator: this._checkPhone}]
							})(
								<Input/>
							)
						}
					</FormItem>

					<FormItem className="userInfoFormItem" {...formItemLayout} label={getLangTxt("personalset_phone1")} help={getLangTxt("personalset_phone1_note")}>
						{getFieldDecorator('phone', {initialValue: phone, rules: [{pattern: /^(\(\d{3,4}\)|\d{3,4}-|\s)?\d{7,14}$/}]})(
							<Input/>
						)}
					</FormItem>

					<FormItem {...formItemLayout2} label={getLangTxt("personalset_signature")} help={signature_help} className="signatureFormItem">
						{
							getFieldDecorator('signature', {initialValue: signature, rules: [{max: 30, message: ' '}]})(
                                <Input type="textarea" style={{height: '0.47rem', resize: 'none'}}
								       onKeyUp={this.handelSignatureValueFun.bind(this)}/>
							)
						}
					</FormItem>

					<FormItem className="footer">
						<Button type="ghost" onClick={this.onCancel.bind(this)}>{getLangTxt("cancel")}</Button>
						<Button type="primary" htmlType="submit">{getLangTxt("sure")}</Button>
					</FormItem>
				</Form>
                {
                    _getProgressComp(progress, "submitStatus userSaveStatus")
                }
			</div>
		)
	}

}

Information = Form.create({
    onValuesChange(props, values) {
        props.isValueChange(true, "information");
    }
})(Information);

function mapStateToProps(state)
{
	let {personalReducer} = state,
		infomation = personalReducer.get("infomation") || Map(),
		userData = infomation.get("data") || {},
		progress = infomation.get("progress");

	return {userData, progress};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getInfomation, setInfomation, clearInformationProgress}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Information);
