import React from 'react';
import { Form, Input } from 'antd';
import NTModal from "../../../components/NTModal";
import { bglen } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const FormItem = Form.Item;

class NewTipsGroup extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		this.state = {
			display: false,
			value: null,
			pid: null,
			typeValue: null
		};
	}
	
	//获取分组名称并判断是否为空
	nameClick(e)
	{
		let groupValue = e.target.value.trim();
		this.setState({value: groupValue})
	}
	
	judgeSpace(rule, value, callback)
	{
		if(value && value.trim() !== "" && bglen(value) <= 200)
		{
			callback();
		}
		callback(" ");
	}
	
	//点击保存新建或修改分组
	newTypeOk()
	{
		let {form} = this.props;
		form.validateFields((errors) => {
			if(errors)
				return false;
			if(this.props.newGroupName === 1)
			{
				let groupValue = this.props.form.getFieldValue("input");
				if(groupValue !== "")
				{
					let obj = {
						groupName: groupValue
					};
					this.props.newTipsGroup(obj);
					this.props.changeNewGroup();
				}
			}
			
			if(this.props.newGroupName === 2)
			{
				let editorData = this.props.editorData;
				let obj = {
					groupName: this.state.value || editorData.groupName,
					groupId: this.state.groupId || editorData.groupId
				};
				this.props.editorTipsGroup(obj);
				this.props.changeNewGroup();
			}
			
		});
	}
	
	render()
	{
		const {getFieldDecorator} = this.props.form,
			formItemLayout = {
				labelCol: {span: 6},
				wrapperCol: {span: 14}
			},
			{editorData, newGroupName} = this.props,
			modalTitle = newGroupName === 1 ? getLangTxt("add_group1") : getLangTxt("edit_group"),
			operateType = newGroupName !== 1;
		
		return (
			<NTModal className='newTipsTypeStyle' title={modalTitle} visible={true} okText={getLangTxt("save")}
			         onOk={this.newTypeOk.bind(this)} onCancel={this.props.changeNewGroup.bind(this)}>
				<div>
					<Form>
						<FormItem
							{...formItemLayout}
							label={getLangTxt("setting_faq_group_name")}
                            help={getLangTxt("setting_common_word_title_note")}
							hasFeedback>
							{getFieldDecorator('input', {
								rules: [{validator: this.judgeSpace.bind(this)}],
								initialValue: editorData && operateType ? editorData.groupName : ""
							})(
								<Input onBlur={this.nameClick.bind(this)}/>
							)}
						</FormItem>
					</Form>
				</div>
			</NTModal>
		)
	}
}

NewTipsGroup = Form.create()(NewTipsGroup);

export default NewTipsGroup;
