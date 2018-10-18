import React, { Component } from 'react';
import { Form, Input, Upload, Tree } from 'antd';
import { getLangTxt, upload, UPLOAD_IMAGE_ACTION } from "../../../utils/MyUtil";
import Modal from "../../../components/xn/modal/Modal";
import TreeSelect from "../../public/TreeSelect";
import TreeNode from "../../../components/antd2/tree/TreeNode";
const FormItem = Form.Item;

class NewSourse extends React.PureComponent {

	static NEW_SOURCE = getLangTxt("setting_source_add");
	static EDIT_SOURCE = getLangTxt("setting_source_edit");

	constructor(props)
	{
		super(props);
		this.state = {
			fileListWebUrl: null,
			fileListWapUrl: null,
			display: false,
			label: null,
			changeFaGroup: false
		};
		this.web = "web";
		this.wap = "wap";
	}

	onSelect(info, e)
	{
		let data = info ? info[0] : [];
		if(data.length > 3)
		{
			this.setState({value: e.selectedNodes})
		}
	}

	selectFather(int, value)
	{
		if(value)
		{
			this.setState({changeFaGroup: true})
		}
		let valueToString = int && int.toString() || "";

		this.props.newGroupItem(valueToString);
	}

	reg = /^[\u0391-\uFFE5]+$/g;
	judgeSpace(bool, rule, value, callback)
	{
		let isChina = bool || this.reg.test(value.trim());

		//只允许输入中文且不为空
		if(value && value.trim() !== ""/* && isChina*/)
		{
			callback();
		}

		callback(" ");
	}

	judgeDomainSpace(rule, value, callback)
	{
		let domainRex = /^(?=^.{3,255}$)[a-zA-Z0-9][-a-zA-Z0-9]{0,62}(\.[a-zA-Z0-9][-a-zA-Z0-9]{0,62})+$/;
		if(value && value.trim() !== "" && domainRex.test(value))
		{
			callback();
		}
		callback(" ");
	}

	//点击确认
	sourseOk()
	{

		let {fileListWebUrl, fileListWapUrl, changeFaGroup} = this.state,
			{editorData = {}, form} = this.props,
			{getFieldValue} = this.props.form,
			obj = {
				cname: getFieldValue("cname") || "",
				ename: getFieldValue("ename") || "",
				domain: getFieldValue("domain") || "",
				ref_word_rex: getFieldValue("ref_word_rex") || "",
				encode: getFieldValue("encode") || "",
				url_reg: getFieldValue("url_reg") || "",
				sourceexplain: getFieldValue("sourceexplain") || "",
				source_type_id: getFieldValue("pk_sourcetype") || "",
				wap_logo: fileListWapUrl ? fileListWapUrl : "",
				source_logo: fileListWebUrl ? fileListWebUrl : ""
			};
		form.validateFields((errors) => {
			if(errors)
				return false;

			if(this.props.sourceName == NewSourse.NEW_SOURCE)
			{
				this.props.newVisitor(obj);
				this.props.changeNewSourse();
			}
			else if(this.props.sourceName == NewSourse.EDIT_SOURCE)
			{
				obj.source_type_id = changeFaGroup ? getFieldValue("pk_sourcetype") : this.props.editorData.source_type_id;
				obj.pk_config_source = editorData.pk_config_source;
				obj.wap_logo = fileListWapUrl ? fileListWapUrl : editorData.wap_logo;
				obj.source_logo = fileListWebUrl ? fileListWebUrl : editorData.source_logo;
				obj.sys = editorData.sys;
				this.props.editorVisitor(obj);
				this.props.changeNewSourse();
			}
		});
	}

	handleChange(filename, info)
	{
		let file = info.file, type = UPLOAD_IMAGE_ACTION, originFileObj = file.originFileObj, web = this.web,
			wap = this.wap;

		upload(originFileObj, type)
		.then((res) => {
			let {jsonResult} = res,
				{data = {}, success} = jsonResult;

			if(!success) return;
			if(success)
			{
				let {
					thumbnailImage = {fileName: "", url: "", fileSize: 0, path: "", key: "", playTime: ""},
					srcFile = {fileName: "", url: "", fileSize: 0, path: "", key: "", playTime: ""}
				} = data;

				if(filename == web)
				{
					this.setState({fileListWebUrl: srcFile.url, fileListWebThumbUrl: thumbnailImage.url})
				}
				else if(filename == wap)
				{
					this.setState({fileListWapUrl: srcFile.url, fileListWapThumbUrl: thumbnailImage.url})
				}
			}
		});
	};

	_createTreeNodes(states)
	{

		if(states) return states.map(function(item) {
			return (
				<TreeNode key={item.source_type_id} label={item.typename} value={item.source_type_id} title={
					<div className="sourceTree" style={{
						position: "relative", width: "100%", padding: "0 90px 0 0", overflow: "hidden",
						textOverflow: "ellipsis", whiteSpace: "nowrap"
					}}>
						{item.typename}
					</div>}>
					{item.children ? _this._createTreeNodes(item.children) : null}
				</TreeNode>
			);
		});

	}

    getSourceTypeGroupTree(groupData)
    {
        if(groupData)
            return groupData.map(item =>
            {
                let {key, label, value, children} = item;
                return (
                    <TreeNode
                        key={key} title={label}
                        value={value}
                    >
                        {children && children.length ? this.getSourceTypeGroupTree(children) : null}
                    </TreeNode>
                );
            });
        return null;
    }

	render()
	{

		let {editorData, state = []} = this.props,
			sourceName = this.props.sourceName != getLangTxt("setting_source_add"),
			{fileListWebUrl, fileListWapUrl, fileListWebThumbUrl, fileListWapThumbUrl} = this.state,
			currentGroup = this.props.selectedKey[0] || "",
			isEdit = this.props.sourceName == NewSourse.EDIT_SOURCE;

		const {getFieldDecorator} = this.props.form,
			formItemLayout = {
				labelCol: {span: 6},
				wrapperCol: {span: 14}
			}, uploadButton = (
				<span className="avatar">
				<i className="icon-tianjia1 iconfont"/>
				<p>上传</p>
			</span>
			), props = {
				accept: '.JPG,.JPEG,.PNG,.BMP',
				showUploadList: false
			};

		return (
			<Modal className='newsourses' title={this.props.sourceName} visible={true} okText={getLangTxt("save")}
			         width="5.7rem" height="5.66rem" onOk={this.sourseOk.bind(this)}
			         onCancel={this.props.changeNewSourse.bind(this)}
					 wrapClassName="accountRight scrollAreaStyle">
				<div className="accountListScroll" > 
					<Form className="newsoursesForm">
						<FormItem {...formItemLayout} label={getLangTxt("setting_source_type")}>
							{getFieldDecorator('pk_sourcetype', {
								initialValue: editorData && editorData.source_type_id && sourceName ? editorData.source_type_id : currentGroup && parseInt(currentGroup),
								rules: [{required: true, message: " "}]
							})(
								<TreeSelect
									style={{width: "100%"}}
									onChange={this.selectFather.bind(this)}
									treeDefaultExpandAll
									treeNode={this.getSourceTypeGroupTree(state)}
								/>
							)}
						</FormItem>

						<FormItem {...formItemLayout} label={getLangTxt("setting_source_cname")} hasFeedback>
							{getFieldDecorator('cname', {
								initialValue: editorData && sourceName ? editorData.cname : null,
								rules: [{required: true, message: " "},
									{validator: this.judgeSpace.bind(this, false)}]
							})(
								<Input/>
							)}
						</FormItem>

						<FormItem {...formItemLayout} label={getLangTxt("setting_source_ename")} hasFeedback>
							{getFieldDecorator('ename', {
								initialValue: editorData && sourceName ? editorData.ename : null,
								rules: [{required: true, message: " "},
									{validator: this.judgeSpace.bind(this, true)}]
							})(
								<Input/>
							)}
						</FormItem>

						<FormItem className="imgHelpStyle" {...formItemLayout} label="web logo" hasFeedback>
							{getFieldDecorator('webLogo', {
								initialValue: isEdit ? editorData && editorData.source_logo : "",
								rules: [{required: true, message: " "}]
							})(
								<div className="clearfix">
									{
										fileListWebUrl || sourceName ?
											<span className="fileList" style={{border: "1px solid #ccc"}}>
										{fileListWebUrl ?
											<img src={fileListWebThumbUrl}/> :
											(
												editorData.sourceHttp == 1 ?
													<img src={editorData.source_logo}/> :
													<i className={"icon iconfont icon-" + editorData.source_logo} style={{
														fontSize: "60px", color: "#3a7dda", position: "absolute",
														top: "12px"
													}}/>
											)}
												<span className="change-image">
											<Upload {...props}
													onChange={this.handleChange.bind(this, this.web)}>{getLangTxt("modify")}</Upload>
										</span>
									</span> :
											<Upload {...props} className="avatar" style={{cursor: "pointer"}}
													onChange={this.handleChange.bind(this, this.web)}>
												{uploadButton}
											</Upload>
									}
									<span className="img-size">{getLangTxt("setting_source_word1")}</span>
								</div>
							)}

						</FormItem>

						<FormItem {...formItemLayout} className="logoItem" label="wap logo" hasFeedback>
							{getFieldDecorator('wapLogo', {
								initialValue: isEdit ? editorData && editorData.wap_logo : "",
								rules: [{required: true, message: " "}]
							})(
								<div className="clearfix">
									{
										fileListWapUrl || sourceName ?
											<span className="fileList" style={{border: "1px solid #ccc"}}>
										{
											fileListWapUrl ?
												<img src={fileListWapThumbUrl}/> :
												(editorData.wapHttp == 1 ?
														<img src={editorData.wap_logo}/> :
														<i className={"icon iconfont icon-" + editorData.wap_logo} style={{
															fontSize: "60px", color: "#3a7dda", position: "absolute",
															top: "12px"
														}}/>
												)
										}
												<span className="change-image">
											<Upload {...props}
													onChange={this.handleChange.bind(this, this.wap)}>{getLangTxt("modify")}</Upload>
										</span>
									</span>
											:
											<Upload {...props} className="avatar" style={{cursor: "pointer"}}
													onChange={this.handleChange.bind(this, this.wap)}>
												{uploadButton}
											</Upload>
									}
									<span className="img-size">{getLangTxt("setting_source_word1")}</span>
								</div>
							)}
						</FormItem>

						<FormItem {...formItemLayout} label={getLangTxt("setting_source_domain")} hasFeedback>
							{getFieldDecorator('domain', {
								initialValue: editorData && sourceName ? editorData.domain : null,
								rules: [{required: true, message: " "},
									{validator: this.judgeDomainSpace.bind(this)}]
							})(
								<Input/>
							)}
						</FormItem>

						<FormItem {...formItemLayout} label={getLangTxt("setting_source_keyword_rule")} hasFeedback>
							{getFieldDecorator('ref_word_rex', {initialValue: editorData && sourceName ? editorData.ref_word_rex : null})(
								<Input type="textarea"/>
							)}
						</FormItem>

						<FormItem {...formItemLayout} label={getLangTxt("setting_source_encode")} hasFeedback>
							{getFieldDecorator('encode', {
								initialValue: editorData && sourceName ? editorData.encode : null
							})(
								<Input/>
							)}
						</FormItem>

						<FormItem {...formItemLayout} label={getLangTxt("setting_source_rule_set")} hasFeedback>
							{getFieldDecorator('url_reg', {initialValue: editorData && sourceName ? editorData.url_reg : null})(
								<Input type="textarea"/>
							)}
						</FormItem>

						<FormItem {...formItemLayout} label={getLangTxt("setting_source_instruction")} hasFeedback>
							{getFieldDecorator('sourceexplain', {initialValue: editorData && sourceName ? editorData.sourceexplain : null})(
								<Input type="textarea"/>
							)}
						</FormItem>
					</Form>
				</div>
			</Modal>
		)
	}
}

NewSourse = Form.create()(NewSourse);

export default NewSourse;
