import React, { Component } from 'react';
import { InputNumber, Tabs, Slider, Row, Col, Select, TreeSelect } from 'antd';
import { getLangTxt } from "../../../utils/MyUtil";

const TabPane = Tabs.TabPane;
const Option = Select.Option;
const SHOW_PARENT = TreeSelect.SHOW_PARENT;

class EditorAccount extends Component {

	constructor(props)
	{
		super(props);
		this.state = {
			passwordDirty: false,
			inputValue: null,
			selectValue: null,
			treeValue: null
		};
	}

	changeValue(value)
	{
		this.setState({
			inputValue: value
		});

	}

    changeValueIpt(value){
        let that = this.props._this;
        if (!value || typeof value != 'number')
        {
            value = 1;
        }
        this.setState({
            inputValue: value
        });
        that.props.form.setFieldsValue({maxConcurrentConversationNum:value})
    }

	handleChange(value)
	{
		this.setState({
			selectValue: value
		});
	}

	treeChange(value, label, extra)
	{
		this.setState({
			treeValue: extra
		});
	}

	componentDidUpdate()
	{
		let tree = {}, obj = {}, timestamp = new Date().getTime(), value = this.state.treeValue, that = this.props._this;

		value ? value.allCheckedNodes.map((item, index) =>
		{
			tree[index + timestamp] = {"id": index + timestamp, "value": item.node.key, "label": item.node.key}
		}) : [];

		obj.inputValue = that.props.form.getFieldValue("maxConcurrentConversationNum");
		/*obj.selectValue = that.props.form.getFieldValue("maxConversationNum");*/
		obj.treeValue = tree;

        if(this.props.getDate)
		{
			this.props.getDate(obj)
		}
	}

	render()
	{
		const {title=""} = this.props,
            isEdit = title === getLangTxt("setting_account_edit"),
            {userMsg = []} = this.props,
			treeData =  [],
			FormItem = this.props.FormItem,
			getFieldDecorator = this.props.getFieldDecorator;

        let /*maxConversationNum = 2000,
            */maxConcurrentConversationNum = 8;
        if (isEdit && userMsg.length > 0)
        {
            let { attribute = {} } = userMsg[0],
                attributeJson = attribute;

            /*maxConversationNum = attributeJson.maxConversationNum;*/
            maxConcurrentConversationNum = attributeJson.maxConcurrentConversationNum;
        }

		const formItemLayout = {labelCol: {span: 4}, wrapperCol: {span: 9}};

        return (
                <div className="conversationStyle">
                    <p className="createAccountHeader">{getLangTxt("setting_account_reception_set")}</p>
                    <FormItem {...formItemLayout} label={getLangTxt("setting_account_reception_sametime_set")}>
                        {
                            getFieldDecorator('maxConcurrentConversationNum', {
                                initialValue: maxConcurrentConversationNum
                            })(
                                <Slider className="conversationSlider" min={1} max={100} onChange={this.changeValue.bind(this)}/>
                            )
                        }
                            <InputNumber
                                className="conversationIptNum"
                                min={1}
                                max={100}
                                onChange={this.changeValueIpt.bind(this)}
                                value={this.state.inputValue || maxConcurrentConversationNum}
                            />
                            <span>
	                            {getLangTxt("setting_account_reception_sametime_set_note")}
                            </span>
                    </FormItem>
            </div>
		)
	}
}

export default EditorAccount;
