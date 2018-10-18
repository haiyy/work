import React from 'react'
import './style/essentialPages.scss'
import { Table, Button,  Form, Input, message, Tooltip, Popover } from 'antd';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { fetchRules, delKeyPage, editKeyPage, addKeyPage } from './action/essentialPages';
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import {truncateToPop} from "../../../utils/StringUtils";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

const FormItem = Form.Item;
//const confirm = Modal.confirm;
let keylevel;
class KeyPage extends React.Component {

	constructor(props)
	{
		super(props);

		this.state = {
			isAddKeyPageShow: false,
			isTestUrlRegShow: false,
            testResult: '',
			inputDisabled: true,
			currentRecord: {},
			currentKey: '',
            editType: ''

		};
	}

    //页面渲染完成获取关键页面数据
	componentWillMount()
	{
		this.props.fetchRules();
    }
    
    //点击弹出新增关键页面框
    showAddKeyPage(record, e)
	{
        e.stopPropagation();
		keylevel = record.pagelevel;
		this.setState({
            isAddKeyPageShow: true
		})
	}

    //弹处测试配置规则框
    testUrlReg(record)
    {
        this.setState({
            currentRecord: record,
            isTestUrlRegShow: true
        })
    }

    //测试配置规则
    _testConfigUrl(value, urlreg)
    {
	    if(!value || !urlreg)
		    return false;

	    let regexObj = new RegExp(urlreg, "gi"),
		    matcher = value.match(regexObj);

	    return matcher && matcher.length > 0;
    }

    //确认校验配置规则
	handleOk()
	{
		let url = this.props.form.getFieldValue("test"),
			{urlreg} = this.state.currentRecord;

		if(this._testConfigUrl(url, urlreg))
		{
			this.setState({
				testResult: getLangTxt("setting_keypage_note1")
			});
			//通过
		}
		else
		{
			this.setState({
				testResult: getLangTxt("setting_keypage_note2")
			})
		}
	}

    //取消校验配置规则
	handleCancel(e)
	{
		this.setState({
            isAddKeyPageShow: false,
            isTestUrlRegShow: false,
			testResult: ""
		});
	}

    //弹处删除关键页面框
	showConfirm(record, records)
	{
		let delKeyPage = this.props.delKeyPage;
		confirm({
            title: getLangTxt("del_tip"),
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip',
			content: getLangTxt("del_content"),
			onOk() {
				delKeyPage(record.keyid, records.key)
			},
			onCancel() {
			}
		});
	}

    //双击修改关键页面
	doubleClick(index, name)
	{
		this.setState({
            currentKey: index,
            editType: name
		})
	}

    //input框失去焦点保存修改数据
	onBlur(name, record, e)
	{
		// let text = e.target.value;
        // if (record[name] != text)
        // {
        //     record[name] = text;
        //     this.props.editKeyPage(record);
        // }
		// this.setState({
        //     currentKey : ''
		// })
	}

    updateIptValue(fieldValue, e)
    {
        this.props.form.setFieldsValue({[fieldValue]: e.target.value});
    }

    //提交新增关键页面数据
	handleSubmit(e)
	{
		e.preventDefault();

		this.props.form.validateFields((err, values) =>
		{
			if(!err)
			{
				this.props.addKeyPage(keylevel, values);
				this.setState({
                    isAddKeyPageShow: false,
                    isTestUrlRegShow: false
				});
			}
		});
	}

    //从新加载关键页面列表数据
    reFreshFn()
    {
        this.props.fetchRules();
    }
    //判断是否输入为空
    judgeSpace(rule, value, callback)
    {
        if(value && value.trim() !== "")
        {
            callback();
        }
        callback(" ");
    }

    //获取二级关键页面渲染
    expandedRowRender = (records, index) =>
    {
        let {getFieldDecorator} = this.props.form,
            keyPageContainer = document.getElementsByClassName("keyPageScrollArea")[0],
            keyPageWidth = keyPageContainer&&keyPageContainer.clientWidth || 0;

        const columns = [
            {
                dataIndex: 'keyname',
                key: 'keyname',
                width: '28%',
                render: (text, record) =>
                {
                    let key = record.keyid,
                        name = 'keyname',
                        keyNameWidth = keyPageWidth * 0.23,
                        keyNameInfo = truncateToPop(text, keyNameWidth) || {};

                    return <div className="formIptStyle">
                                {
                                    key == this.state.currentKey && name === this.state.editType ?

                                            <FormItem hasFeedback>
                                                {getFieldDecorator('keyname', {
                                                    initialValue: text
                                                })(
                                                    <Input autoFocus
                                                        onKeyUp={this.updateIptValue.bind(this, 'keyname')}
                                                        onBlur={this.onBlur.bind(this, name, record)}
                                                        disabled={false}/>
                                                )}
                                            </FormItem>
                                         :
                                         keyNameInfo.show ?
                                            <Popover
                                                content={
                                                    <div style={{maxWidth: keyNameWidth+"px", height: "auto", wordBreak: "break-word"}}>
                                                        {text}
                                                    </div>
                                                }
                                                placement="top"
                                            >
                                                <Input value={keyNameInfo.content} disabled={this.state.inputDisabled} />
                                            </Popover>
                                            :
                                            <Input value={text} disabled={this.state.inputDisabled} ref="formIptStyle"/>
                                }
                                <i  className="iconfont icon-shouqi1" onClick={this.doubleClick.bind(this, key, name, record)}></i>
                            </div>
                }
            },
            {
                dataIndex: 'urlreg',
                key: 'urlreg',
                width: '55%',
                render: (text, record) =>
                {
                    let key = record.keyid,
                        name = 'urlreg',
                        urlregWidth = keyPageWidth * 0.47,
                        urlregInfo = truncateToPop(text, urlregWidth) || {};

                    return <div className="formIptStyle">
                        {
                            key == this.state.currentKey && name === this.state.editType ?
                                <FormItem hasFeedback>
                                    {getFieldDecorator('urlreg', {
                                        initialValue: text
                                    })(
                                        <Input autoFocus onKeyUp={this.updateIptValue.bind(this, "urlreg")} onBlur={this.onBlur.bind(this, name, record)}
                                               disabled={false}/>
                                    )}
                                </FormItem>
                                :
                                urlregInfo.show ?
                                    <Popover
                                        content={
                                                    <div style={{maxWidth: urlregWidth + "px", height: "auto", wordBreak: "break-word"}}>
                                                        {text}
                                                    </div>
                                                }
                                        placement="top"
                                    >
                                        <Input value={urlregInfo.content} disabled={this.state.inputDisabled}/>
                                    </Popover>
                                    :
                                <Input value={text} disabled={this.state.inputDisabled}/>
                        }
                        <i className="iconfont icon-shouqi1" onClick={this.doubleClick.bind(this, key, name)}></i>
                    </div>
                }
            },
            {
                dataIndex: 'operation',
                key: 'operation',
                width: '17%',
                render: (text, record) =>
                    <div>
                        <Tooltip placement="bottom" title={getLangTxt("setting_keypage_test")}>
                            <i className="icon-cesu iconfont" onClick={this.testUrlReg.bind(this, record)}/>
                        </Tooltip>
                        <Tooltip placement="bottom" title={getLangTxt("del")}>
                            <i className="icon-shanchu iconfont" style={{padding: "0 15px"}}
                                onClick={this.showConfirm.bind(this, record, records)}/>
                        </Tooltip>
                    </div>
            }
        ];
        return (
            <Table columns={columns} dataSource={records.subset} pagination={false}/>
        )
    };

    //新增关键页面组件渲染
    getNewPageComponent()
    {
        let {getFieldDecorator} = this.props.form;
        return <Form onSubmit={this.handleSubmit.bind(this)}>
            <FormItem label={getLangTxt("setting_keypage")}>
                {getFieldDecorator('keyname', {
                    rules: [{required: true},
                    {validator: this.judgeSpace.bind(this)}]
                })(
                    <Input />
                )}
            </FormItem>
            <FormItem label={getLangTxt("setting_keypage_rule")}>
                {
                    getFieldDecorator('urlreg', {
                        rules: [{required: true},
                        {validator: this.judgeSpace.bind(this)}]
                    })(
                        <Input />
                    )
                }
            </FormItem>
            <FormItem>
                <Button type="primary" htmlType="submit">
	                {getLangTxt("sure")}
                </Button>
                <Button type="ghost" onClick={this.handleCancel.bind(this)}>
	                {getLangTxt("cancel")}
                </Button>
            </FormItem>
        </Form>
    }

    //测试结果样式设置
    getTestResultStyle(testResult)
    {
        let tipsStyle = {
                color: "#fff",
                icon: ""
            };

        if(testResult == getLangTxt("setting_keypage_note1"))
        {
            tipsStyle.color = "#00c357";
            tipsStyle.icon = "icon-001zhengque";
        }
        else if (testResult == getLangTxt("setting_keypage_note2"))
        {
            tipsStyle.color = "#ff5c5e";
            tipsStyle.icon = "icon-009cuowu";
        }
        return tipsStyle;
    }

    savingErrorTips(errorMsg)
    {
        info({
            title: getLangTxt("err_tip"),
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'errorTip',
            okText: getLangTxt("sure"),
            content: errorMsg,
            onOk: ()=>{
                this.props.fetchRules();
            }
        });
    }
    //关键页面列表渲染
    columns = [
        {
            title: getLangTxt("setting_keypage"), dataIndex: 'name', key: 'name', width: '28%'
        },
        {
            title: getLangTxt("setting_keypage_rule"), dataIndex: 'rules', key: 'rules', width: '55%'
        },
        {
            title: getLangTxt("operation"), dataIndex: 'operation', key: 'operation', width: '17%',
            render: (text, record) =>
                <Button onClick={this.showAddKeyPage.bind(this, record)} type="dashed" size="large">{getLangTxt("setting_keypage_add")}</Button>,
        }
    ];

	render()
	{
		const {getFieldDecorator} = this.props.form,
            essential = this.props.essential && this.props.essential.length ? this.props.essential : [],
            {testResult} = this.state;

		let tipsStyle = this.getTestResultStyle(testResult),
            {color,icon} = tipsStyle,
            { progress } = this.props,
            errorMsg = progress === LoadProgressConst.DUPLICATE ? getLangTxt("setting_keypage_note3") : getLangTxt("20034");

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        if (progress === LoadProgressConst.DUPLICATE || progress === LoadProgressConst.SAVING_FAILED)
        {
            this.savingErrorTips(errorMsg)
        }

		return (
			<div className="essential">
                <p className="pageIntro">{getLangTxt("setting_keypage_note")}</p>
                <Form className="keyPageTable">
                    <ScrollArea className="keyPageScrollArea" speed={ 1 } horizontal={ false } smoothScrolling>
                        {
                            essential ?
                                <Table columns={this.columns} dataSource={essential} pagination={false}
                                       expandedRowRender={this.expandedRowRender} expandRowByClick={true}/>
                                : null
                        }
                    </ScrollArea>
                </Form>
                {
                    getProgressComp(progress)
                }
				<Modal title={getLangTxt("setting_keypage_add")} visible={this.state.isAddKeyPageShow} onCancel={this.handleCancel.bind(this)}
				       wrapClassName="essentialAdd" width={520} footer='' className="essentialAddModal">
					{
						this.state.isAddKeyPageShow ? this.getNewPageComponent() : " "
					}
				</Modal>
				<Modal title={getLangTxt("setting_keypage_test")} visible={this.state.isTestUrlRegShow}
				       onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}
				       wrapClassName="test" width={520} okText={getLangTxt("setting_keypage_test")} className="keyPageTestModal">
					<Form >
						<FormItem label={getLangTxt("setting_keypage_input")}>
							{
								getFieldDecorator('test')(
									<Input />
								)
							}
						</FormItem>
					</Form>
					<span style={{marginLeft: "44px"}}>
                        <i className={"iconfont "+ icon} style={{ color: color, fontSize: "15px", paddingRight: "12px" }}/>
                        {testResult}
                    </span>
				</Modal>
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
        essential: state.rules.data || [],
        progress: state.rules.progress
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({fetchRules, delKeyPage, editKeyPage, addKeyPage}, dispatch);
}

KeyPage = Form.create()(KeyPage);

export default connect(mapStateToProps, mapDispatchToProps)(KeyPage);
