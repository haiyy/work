import React, {PropTypes} from 'react';
import './style/modifyPassword.scss';
import {Form, Switch, Input, Button, Modal} from 'antd';
import {connect} from 'react-redux';
import {bindActionCreators} from 'redux';
import Model from "../../../utils/Model";
import LoginUserProxy from "../../../model/proxy/LoginUserProxy";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import {editPassWord, clearPasswordErrorMsg} from '../account/accountAction/sessionLabel';
import { _getProgressComp, getLangTxt } from "../../../utils/MyUtil";
const FormItem = Form.Item;

class Password extends React.Component {
    constructor(props) {
        super(props);
        this.state = {passwordDirty: null}
    }

    onCancel() {
        this.props.onCancel(false);
    }

    componentWillReceiveProps(nextProps) {
        let {progress: nextProgress = {password: 2}, password, isIgnoreEdit} = nextProps,
            {progress: thisProgress = {password: 2}, password: passwordThis, isIgnoreEdit: isIgnoreEditThis} = this.props,
            {password: nextPassword = 2} = nextProgress,
            {password: thisPassword = 2} = thisProgress;

        if (password && !passwordThis)
            this.handleSubmit();

        if (isIgnoreEdit && !isIgnoreEditThis)
        {
            this.props.form.resetFields();
        }

        if(thisPassword === LoadProgressConst.SAVING_SUCCESS)
        {
            // this.editComplete();
            this.props.clearPasswordErrorMsg();
        }

        if (nextPassword != thisPassword)
        {
            if (nextPassword === LoadProgressConst.SAVING_FAILED || nextPassword === LoadProgressConst.ERROR_PASSWORD)
            {
                this.getSavingErrorMsg(nextPassword)
            }
        }
    }

    handleSubmit(e) {
        if (e)
            e.preventDefault();

        this.props.form.validateFields((errors) => {
            if (errors)
            {
                this.props.afterSavingData("password");
                return;
            }

            let obj = this.props.form.getFieldsValue(["password", "newpassword", "confirmpassword"]),
                loginUserProxy = Model.retrieveProxy("LoginUserProxy"),
                {userId:userid} = loginUserProxy;
            obj.userid = userid;
            this.props.editPassWord(obj);
            this.props.afterSavingData("password", true);
        });
    }

    editComplete()
    {
        this.props.onCancel(false);
        this.props.clearPasswordErrorMsg();
    }

    passwordDirtyClick(e) {
        this.setState({passwordDirty: e.target.value})
    }

    checkPassword(rule, value, callback) {
        const form = this.props.form;
        if (value && value !== form.getFieldValue('newpassword')) {
            callback('Two passwords that you enter is inconsistent!');
        } else {
            callback();
        }
    }

    checkConfirm(rule, value, callback) {
        const form = this.props.form;
        if (value && this.state.passwordDirty) {
            form.validateFields(['confirmpassword'], {force: true});
        }
        callback();
    }

    clearErrorMsg()
    {
        this.props.clearPasswordErrorMsg();
    }

    getSavingErrorMsg(progress)
    {
        let content = progress === LoadProgressConst.ERROR_PASSWORD ? getLangTxt("personalset_pwd1_note1") : getLangTxt("20034");
        Modal.error({
            title: getLangTxt("tip1"),
            iconType: 'exclamation-circle',
            className: 'errorTip',
            okText: getLangTxt("sure"),
            content: <div>{content}</div>,
            width: '320px',
            onOk:()=>{
                this.clearErrorMsg();
            }
        });
    }

    judgeSpace(rule, value, callback)
    {
        if(value && value.trim() !== "")
        {
            callback();
        }
        callback(" ");
    }

    render() {
        let {getFieldDecorator} = this.props.form,
            formItemLayout = {
                labelCol: {span: 7},
                wrapperCol: {span: 12}
            },
            {progress} = this.props;

        return (
            <div className="password personalise">
                <Form hideRequiredMark={true} onSubmit={this.handleSubmit.bind(this)}>
                    <FormItem
                        {...formItemLayout}
                        className="currentPassword"
                        label={getLangTxt("personalset_modifypwd_old")}>
                        {getFieldDecorator('password', {
                            rules: [{ required: true, message: " "},
                            {validator: this.judgeSpace.bind(this)}]
                        })(
                            <Input type="password"/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label={getLangTxt("personalset_pwd")}
                        help={getLangTxt("personalset_pwd_note")}>
                        {getFieldDecorator('newpassword', {
                            rules: [{
                                required: true, message: "",max: 20, min: 6
                            }, {
                                validator: this.checkConfirm.bind(this)
                            }]
                        })(
                            <Input type="password" onBlur={this.passwordDirtyClick.bind(this)}/>
                        )}
                    </FormItem>

                    <FormItem
                        {...formItemLayout}
                        label={getLangTxt("personalset_pwd1")}
                        help={getLangTxt("personalset_pwd1")}>
                        {getFieldDecorator('confirmpassword', {
                            rules: [{
                                required: true, message: getLangTxt("personalset_pwd1_note")
                            }, {
                                validator: this.checkPassword.bind(this)
                            }]
                        })(
                            <Input type="password"/>
                        )}
                    </FormItem>

                    <FormItem className="footer">
                        <Button type="ghost" onClick={this.onCancel.bind(this)}>{getLangTxt("cancel")}</Button>
                        <Button type="primary" htmlType="submit">{getLangTxt("sure")}</Button>
                    </FormItem>

                </Form>
                {
                    _getProgressComp(progress && progress.password, "submitStatus userSaveStatus")
                }
            </div>
        )
    }
}

Password = Form.create({
    onValuesChange(props, values) {
        props.isValueChange(true, "password");
    }
})(Password);

function mapStateToProps(state) {
    return {
        progress: state.getAccountList.progress
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({editPassWord, clearPasswordErrorMsg}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Password);
