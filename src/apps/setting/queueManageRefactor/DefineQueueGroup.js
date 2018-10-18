import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Steps, Button, Form, Input, message } from 'antd';
import './style/queueManage.scss';
import UserFilterList from "../distribution/UserFilterList";
import {addQueue, editQueue} from "./reducer/queueManageReducer";
import {bglen} from "../../../utils/StringUtils";
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

const Step = Steps.Step, FormItem = Form.Item;
class DefineQueueGroup extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.state = {
            queueFilterData: [],
            isWarned: false
		};
	}

    commitData = {
        name: "",
        rules: [],
        useable: 0,
        inletType: 1,
        isBusy: 1,
        isOverflow: 1,
        overflow: 0,
        strategyType: 0,
        inletPriority: 1
    };

    //校验筛选条件输入合法性
    validateRuleValue(rules)
    {

        let reUrl01 =  /[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&:/~\+#]*[\w\-\@?^=%&/~\+#])?/,
            keyWordReg = new RegExp("[`~!@#$^&*()=|{}':;',\\[\\].<>/?~！@#￥……&*（）——|{}【】‘；：”“'。，、？]"),
            isNext = true,
            errorTips = "";
        if (rules.length > 0)
        {
            rules.forEach(item => {
                if(item.ruleKey === "referer" || item.ruleKey === "landingpage")
                {
                    if (!reUrl01.test(item.ruleValue))
                        isNext = false
                }else if (item.ruleKey === "keyword")
                {
                    if (!(item.ruleValue[0] && (item.ruleValue[0].trim() != "") && (!keyWordReg.test(item.ruleValue[0]))))
                        isNext = false
                }

                if (item.ruleValue && item.ruleValue.length < 1)
                {
                    isNext = false;
                    errorTips = getLangTxt("setting_queue_note1")
                }
            });
        }else
        {
            isNext = false;
            errorTips = getLangTxt("setting_queue_note2");
        }

        return {isNext, errorTips};
    }

    getErrorMsg(msg)
    {
        message.error(msg);
        this.setState({isWarned: true})
    }

    //点击下一步
    handleNextStep()
    {
        let {form, link, editData} = this.props,
            {isWarned} = this.state,
            obj = {name: form.getFieldValue("queueGroupName")},
            isNextMsg;

        form.validateFields((errors) => {
            if (errors)
                return false;

            if (link == "new")
            {
                isNextMsg = this.validateRuleValue(this.commitData.rules);

                if (!isNextMsg.isNext)
                {
                    if(isNextMsg.errorTips && !isWarned)
                    {
                        this.getErrorMsg(isNextMsg.errorTips)
                    }
                    return false;
                }

                Object.assign(this.commitData, obj);
                this.props.handleNextStep(this.commitData);
            }else
            {
                isNextMsg = this.validateRuleValue(editData.rules);

                if (!isNextMsg.isNext)
                {
                    if(isNextMsg.errorTips && !isWarned)
                    {
                        this.getErrorMsg(isNextMsg.errorTips)
                    }
                    return false;
                }

                Object.assign(editData, obj);

                this.props.handleNextStep(editData);
            }
        })
    }

    getSaveErrorModal(result)
    {
        if (result.success)
        {
            this.props.handleKillCreatePage();
        }else if (result.code === 404)
        {
            warning({
                title: getLangTxt("err_tip"),
                width: '320px',
                iconType: 'exclamation-circle',
                className: 'errorTip',
                okText: getLangTxt("sure"),
                content: result.msg
            });
        }else
        {
            error({
                title: getLangTxt("err_tip"),
                width: '320px',
                iconType: 'exclamation-circle',
                className: 'errorTip',
                okText: getLangTxt("sure"),
                content: getLangTxt("20034")
            })
        }
    }

    //点击保存
    handleSave()
    {
        let {form, editData = {}, link} = this.props,
            {isWarned} = this.state,
            obj = {name: form.getFieldValue("queueGroupName")},
            isNextMsg;

        form.validateFields((errors) => {
            if (errors)
                return false;

            if (link == "new")
            {
                isNextMsg = this.validateRuleValue(this.commitData.rules);

                if (!isNextMsg.isNext)
                {
                    if(isNextMsg.errorTips && !isWarned)
                    {
                        this.getErrorMsg(isNextMsg.errorTips)
                    }
                    return false;
                }

                Object.assign(this.commitData, obj);
                this.props.addQueue(this.commitData).then(result =>
                {
                    this.getSaveErrorModal(result);

                });
            }else
            {
                isNextMsg = this.validateRuleValue(editData.rules);

                if (!isNextMsg.isNext)
                {
                    if(isNextMsg.errorTips && !isWarned)
                    {
                        this.getErrorMsg(isNextMsg.errorTips)
                    }
                    return false;
                }

                Object.assign(editData, obj);
                this.props.editQueue(editData).then(result =>
                {
                    this.getSaveErrorModal(result);
                })
            }
        });
    }

    getUserFilterList(queueFilterData)
    {
        let {editData = {}, link} = this.props,
            newFilterData = queueFilterData.filter(item => item.type != ""),
            rules = [],
            singleRule = {},
            obj = {rules: []};

        this.setState({isWarned: false});
        if (newFilterData.length > 0)
        {
            newFilterData.forEach(item => {
                singleRule = {
                    "ruleKey": item.type,
                    "ruleValue": item.value,
                    "ruleChar": item.include
                };
                rules.push(singleRule)
            });
            obj.rules = rules;
        }
        if (link == "new")
        {
            Object.assign(this.commitData, obj);
        }else
        {
            Object.assign(editData, obj);
        }
    }

    //点击取消
    handleCancel()
    {
        this.props.handleKillCreatePage();
    }

    judgeSpace(rule, value, callback)
    {
        if(value && value.trim() !== "" && bglen(value) <= 20)
        {
            callback();
        }
        callback(getLangTxt("setting_queue_name_note"));
    }

    componentWillUnmount()
    {
        this.commitData = null;
    }

	render()
	{
        const {getFieldDecorator} = this.props.form,
            {link, editData = {}, queueMangeData} = this.props,
            progress = queueMangeData.getIn(["progress"]),
            users = null;

		return (
			<div className="makeusers-content makeusers queueGroupBox">
                <Steps current={0} className="queueStep">
                    <Step title={getLangTxt("setting_queue_definition")}/>
                    <Step title={getLangTxt("setting_queue_definition_plan")}/>
                </Steps>
                <div className="queueGroupScroll">
                    <div className='makeusers-body'>
                        <div className="clearFix queueGroupName">
                            <span className="queueNameTitle">{getLangTxt("setting_queue_name")}</span>
                            <Form style={{float: "left"}}>
                                <FormItem help={getLangTxt("setting_queue_name_note")}>
                                    {
                                        getFieldDecorator("queueGroupName",
                                            {
                                                initialValue: link === "editor" ? editData.name : "",
                                                rules: [{validator: this.judgeSpace.bind(this)}]
                                            }
                                        )
                                        (
                                            <Input style={{width: '335px'}}/>
                                        )
                                    }
                                </FormItem>
                            </Form>
                        </div>
                        <span className='queueUserFilter'>{getLangTxt("screening_users")}</span>
                        <UserFilterList link={this.props.link} editData={editData} users={users} getUserFilterList={this.getUserFilterList.bind(this)}/>
                    </div>
                </div>
                <div className="queueGroupFooter">
                    <Button className="ghost next" type="ghost" onClick={this.handleNextStep.bind(this)}>{getLangTxt("next_step")}</Button>
                    <Button className="primary" type="primary" onClick={this.handleSave.bind(this)}>{getLangTxt("save")}</Button>
                    <Button className="ghost" type="ghost" onClick={this.handleCancel.bind(this)}>{getLangTxt("cancel")}</Button>
                </div>
                {
                    getProgressComp(progress)
                }
			</div>
		)
	}
}

DefineQueueGroup = Form.create()(DefineQueueGroup);

function mapStateToProps(state)
{
	return {
        queueMangeData: state.queueManageReducer
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({addQueue, editQueue}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(DefineQueueGroup);
