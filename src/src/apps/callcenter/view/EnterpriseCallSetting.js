import React from "react";
import {Form, Select, InputNumber, Switch, Radio, Input, Button} from 'antd'
import { bindActionCreators} from 'redux';
import { connect } from 'react-redux';
import './style/personalcall.less'
import './style/searchListComp.less'
const FormItem = Form.Item;
const Option = Select.Option;
const RadioButton = Radio.Button;
const RadioGroup = Radio.Group;

class EnterpriseCallSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            Servicemode: 'a',
            Outcrynumber: 'b',
            Finishingtime: 'c',
            AutoAnswer: 'd',
            LoginStatus: 'e',
            ScreenPopUp: 'f',
            Outbound: 'g',
        }
    }

    componentDidMount() {
        // get
    }

    handleSubmit(e) {
        e.preventDefault();
        this.props.form.validateFields((err, values) => {
            if (!err) {
                console.log('Received values of form: ', values);
            }
        });
    }

    normFile  (e) {
        console.log('Upload event:', e);
        if (Array.isArray(e)) {
            return e;
        }
        return e && e.fileList;
    }
    render() {


        const { getFieldDecorator } = this.props.form;
        const formItemLayout = {
            labelCol: { span: 3 },
            wrapperCol: { span: 9 },
        };

        return (
            <div class="personalcall">
                <Form onSubmit={this.handleSubmit}>
                    <FormItem
                        {...formItemLayout}
                        label="自动接听"
                    >
                        {getFieldDecorator(this.state.AutoAnswer)(
                            <Switch />
                        )}
                        <span>开启</span>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="登陆默认状态"
                    >
                        <Button htmlType="submit" className="sonalcalllogin_btn">空闲</Button>
                        <Button type="primary" htmlType="submit" className="sonalcalllogin_btn sonalcallbtn-colors">忙碌</Button>
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="外呼号码显示"
                        hasFeedback
                    >
                        {getFieldDecorator(this.state.Outcrynumber)(
                            <Select placeholder="0100-231414124">
                                <Option value="a">0100-231414124</Option>
                                <Option value="b">0100-333232323</Option>
                                <Option value="c">0100-412413123</Option>
                                <Option value="d">0100-213131444</Option>
                                <Option value="e">0100-442132112</Option>
                            </Select>
                        )}
                    </FormItem>
                    <FormItem
                        {...formItemLayout}
                        label="整理时间设置"
                    >
                        {getFieldDecorator(this.state.Finishingtime,{ initialValue: 5})(
                            <InputNumber className="PersonalCall-timer" min={1} max={1000000} />
                        )}

                        <span className="ant-form-text"> 秒</span>
                        <p>tip：客服通话结束后n秒不分配客户，客服可以利用此时间整理上一通话工作</p>
                    </FormItem>
                    <FormItem
                        wrapperCol={{ span: 12, offset: 8 }}
                    >
                        <Button htmlType="submit" className="sonalcallphone_btn">取消</Button>
                        <Button htmlType="submit" className="sonalcallphone_btn">保存</Button>
                    </FormItem>
                </Form>
            </div>
        );
    }

}

export default EnterpriseCallSetting =Form.create()(EnterpriseCallSetting)
