import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Form, Button, Input, Checkbox, Radio, Switch } from 'antd';
import './style/queueManage.scss';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
import {getQueueWord, setQueueWord} from "./reducer/queueManageReducer";

const FormItem = Form.Item, RadioGroup = Radio.Group,
	queneArr1 = [
		{
			label: getLangTxt("setting_queue_option1"),
			value: "showNums",
			flg: "{$queue}"
		},
		{
			label: getLangTxt("setting_queue_option2"),
			value: "leaveMessage",
			flg: "{$leaveMessage}"
		},
		{
			label: getLangTxt("setting_queue_option3"),
			value: "giveupQueue",
			flg: "{$giveUp}"
		}];

class QueueManageWord extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
			arrWeb: null,
			arrWx: null,
            terminalValue: 1
		};
	}

    _queueConfig = [];
    webContent = {};
    wxContent = {};

	componentDidMount()
	{
		this.props.getQueueWord()
	}

    componentWillUnmount()
    {
        this._queueConfig = null;
        this.webContent = null;
        this.wxContent = null;
    }

	setQueneClick()
	{
		this.props.setQueueWord(this._queueConfig);
	}

	getWebCheck(checkedValue)
	{
		let str = this.props.form.getFieldValue("Signature");

		if(this._queueConfig && this._queueConfig.length > 0)
		{
			queneArr1.forEach(item =>
			{
				if(checkedValue.includes(item.value))
				{
                    this.webContent[item.value] = 1;

					if(str.indexOf(item.flg) <= -1)
						str += item.flg;
				}
				else
				{
                    this.webContent[item.value] = 0;

					if(str.indexOf(item.flg) > -1)
						str = str.replace(item.flg, "");
				}
			});

			this.props.form.setFieldsValue({Signature: str});
            this.webContent.content = str;
		}
	}

	getWxCheck(checkedValue)
	{
		let str = this.props.form.getFieldValue("text");

		if(this._queueConfig && this._queueConfig.length > 0)
		{
			queneArr1.forEach(item =>
			{
				if(checkedValue.includes(item.value))
				{
                    this.wxContent[item.value] = 1;

					if(str.indexOf(item.flg) <= -1)
						str += item.flg;
				}
				else
				{
                    this.wxContent[item.value] = 0;

					if(str.indexOf(item.flg) > -1)
						str = str.replace(item.flg, "");
				}
			});
			this.props.form.setFieldsValue({text: str});
            this.wxContent.content = str;
		}
	}

    reFreshFn()
    {
        this.props.getQueueWord();
    }

    handleTerminalChange(e)
    {
        this.setState({terminalValue: e.target.value})
    }

    //将排队话术类型数据修改
    editQueueWordType(queueWordType)
    {
        if (this._queueConfig.length > 0)
        {
            this._queueConfig.forEach(item => {
                item.type = queueWordType;
            })
        }
        this.setState({isDefaultWord:!this.state.isDefaultWord})
    }

    //是否选择默认话术
    isDefaultWord(checked)
    {
        let queueWordType = checked ? 0 : 1;

        this.editQueueWordType(queueWordType)

    }

    //是否选择默认话术
    isDefaultWord2(checked)
    {
        let queueWordType = checked ? 1 : 0;

        this.editQueueWordType(queueWordType)
    }

    //输入框值发生变化
    onIptValueChange(type, e)
    {
        let {form} = this.props,
            word = e.target.value,
            terminalContent = type === 1 ? this.webContent : this.wxContent,
            defaultChecked = [];

        queneArr1.forEach(item =>
        {
            if(word.indexOf(item.flg) <= -1)
            {
                terminalContent[item.value] = 0;
            }else
            {
                terminalContent[item.value] = 1;
            }
        });

        defaultChecked = queneArr1.filter(item => terminalContent[item.value] === 1)
            .map(item => item.value);

        if (type === 1)
        {
            form.setFieldsValue({CheckboxWeb: defaultChecked})
        }else
        {
            form.setFieldsValue({CheckboxWx: defaultChecked})
        }

        switch(type)
       {
           case 1:
               this.webContent.content = e.target.value;
               break;

           case 2:
               this.wxContent.content = e.target.value;
               break;
       }
    }

	render()
	{
		let {getFieldDecorator} = this.props.form,
			{queueMangeData} = this.props,
            progress = queueMangeData.getIn(["progress"]);

        this._queueConfig = queueMangeData.getIn(["queueWord"]);

        if (this._queueConfig.length > 0)
        {
            this.webContent = this._queueConfig.find(item => item.terminal === 1);
            this.wxContent = this._queueConfig.find(item => item.terminal === 2);
        }

		let	{content = "", type} = this.webContent,
			{content: wxContent = ""} = this.wxContent,

			defaultWeb = queneArr1.filter(item => this.webContent[item.value] === 1)
			.map(item => item.value),

			defaultWX = queneArr1.filter(item => this.wxContent[item.value] === 1)
			.map(item => item.value),

            {terminalValue} = this.state,
            defaultWordClass = type === 0 ? "defaultWord" : "defaultWord disabledDefault";

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
			<div className='queueManage queueWord'>
				<div className="queue-body">
					<div className='queue-body-right'>
                        <Switch checked={type === 0} onChange={this.isDefaultWord.bind(this)}/>
                        <span>{getLangTxt("setting_queue_default")}</span>
                        <div className={defaultWordClass}>
                           {getLangTxt("setting_queue_default_word")}
                        </div>
                        <Switch checked={type === 1} onChange={this.isDefaultWord2.bind(this)}/>
                        <span>{getLangTxt("setting_queue_custom")}</span>
						<Form>
                            <RadioGroup disabled={type === 0} defaultValue={1} onChange={this.handleTerminalChange.bind(this)}>
                                <Radio.Button value={1}>web/wap/sdk</Radio.Button>
                                <Radio.Button value={2}>{getLangTxt("setting_queue_weChat")}</Radio.Button>
                            </RadioGroup>
                            {
                                terminalValue === 1 ?
                                <div>
                                    <FormItem className="checkBoxStyle">
                                        {
                                            getFieldDecorator('CheckboxWeb', {
                                                initialValue: defaultWeb
                                            })(
                                                <Checkbox.Group disabled={type === 0} onChange={this.getWebCheck.bind(this)}
                                                    options={queneArr1}/>
                                            )
                                        }
                                    </FormItem>

                                    <FormItem>
                                        {
                                            getFieldDecorator('Signature', {
                                                initialValue: content
                                            })(
                                                <Input className="queueWordIptStyle" disabled={type === 0} type="textarea" onChange={this.onIptValueChange.bind(this, 1)}/>
                                            )
                                        }
                                    </FormItem>
                                </div>
                                    :
                                <div>
                                <FormItem className="checkBoxStyle">
                                {
                                    getFieldDecorator('CheckboxWx', {
                                        initialValue: defaultWX
                                    })(
                                        <Checkbox.Group disabled={type === 0} onChange={this.getWxCheck.bind(this)}
                                            options={queneArr1}/>
                                    )
                                }
                                </FormItem>

                                <FormItem>
                                {
                                    getFieldDecorator('text', {
                                        initialValue: wxContent
                                    })(
                                        <Input className="queueWordIptStyle" disabled={type === 0} type="textarea" onChange={this.onIptValueChange.bind(this, 2)}/>
                                    )
                                }
                                </FormItem>
                                </div>
                            }
						</Form>
					</div>
				</div>
                <div className="queue-footer">
					<Button className="primary" type="primary" onClick={this.setQueneClick.bind(this)}>{getLangTxt("save")}</Button>
				</div>
                {
                    _getProgressComp(progress, "submitStatus queueStatus")
                }
			</div>
		)
	}
}

QueueManageWord = Form.create()(QueueManageWord);

function mapStateToProps(state)
{
	return {
        queueMangeData: state.queueManageReducer
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getQueueWord, setQueueWord}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QueueManageWord);
