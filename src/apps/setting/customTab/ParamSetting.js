import React, { PropTypes } from 'react'
import { Radio, Form, Input, Tooltip } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import {getCustomerTabParams} from "./tabReducer/customerTabReducer";
import { getLangTxt } from "../../../utils/MyUtil";
import Select from "../../public/Select";

const RadioButton = Radio.Button, Option = Select.Option, FormItem = Form.Item;

let uuid = 0;

class ParamSetting extends React.Component {

    constructor(props)
    {
        super(props);

        this.state = {
            paramOptionArray: []
        };
        this.paramOptionArray = null;
    }

    componentDidMount()
    {
        let {setFieldsValue} = this.props.form,
            {editParamData = []} = this.props;


        if (editParamData.length > 0)
        {
            editParamData.forEach((item, index) => {
                item.data = index;
            })
        }else
        {
            editParamData.push({"data": 0, "tabKey": "", "tabValue": ""})
        }

        setFieldsValue({
            allParamData: editParamData
        })
    }

    //页面卸载释放内存
    componentWillUnmount() {
        this.paramOptionArray = null;
    }

    //获取参数选择下拉框选项
    getParamOption(allParamData)
    {
        let {customerTabData} = this.props,
            paramsData = customerTabData.getIn(["paramsData"]),
            paramItem = {};

        this.paramOptionArray = [];

        paramsData.forEach(item => {
            paramItem = {value: item, disabled: false};
            this.paramOptionArray.push(paramItem);
        });

        this.paramOptionArray.forEach(paramItem =>
        {
            paramItem.disabled = false;
            allParamData.forEach(item =>
            {
                if(item.tabKey === paramItem.value)
                {
                    paramItem.disabled = true
                }
            })
        });

        return this.paramOptionArray.map((item) =>
        {
            return (
                <Option key={item.value} value={item.value} disabled={item.disabled}>
                    {item.value}
                </Option>
            )
        })
    }

    //参数选择
    handleChange(currentParamData, value)
    {
        let {form} = this.props,
            allParamData = form.getFieldValue("allParamData");

        this.paramOptionArray.find(item =>
        {
            if(item.value == currentParamData.tabKey)
            {
                item.disabled = false
            }
        });

        allParamData.forEach(item =>
        {
            if(item.data == currentParamData.data)
            {
                item.tabValue = "";
                item.tabKey = value;
            }
        });

        form.setFieldsValue({allParamData});
        this.props.isParamCompleteWarned(false);
        this.props.getParamsData(allParamData);
        this.setState({changeFilterData: true});
    }

    //参数填写错误只提示一次，页面内容变动则重新提示
    changeWarnedStatus()
    {
        this.props.isParamCompleteWarned(false);
    }

    getIptComponent(currentParamData)
    {
        return (
            <Input
                className="filterValueIpt"
                defaultValue={currentParamData.tabValue}
                placeholder={getLangTxt("setting_custom_tab_placeholder")}
                onKeyUp={this.onIptValueChange.bind(this, currentParamData)}
                onBlur={this.changeWarnedStatus.bind(this)}
            />
        )
    }

    // 输入框值发生变化
    onIptValueChange(currentParamData, e)
    {
        let value = e.target.value,
            {form} = this.props,
            allParamData = form.getFieldValue("allParamData");

        allParamData.forEach(item =>
        {
            if(item.data == currentParamData.data)
            {
                item.tabValue = value;
            }
        });

        form.setFieldsValue({allParamData});
        this.props.getParamsData(allParamData);
    }

    // 移除筛选条件
    remove(currentParamData)
    {
        let {form} = this.props,
            allParamData = form.getFieldValue('allParamData'),
            afterRemoveData = allParamData.filter(key => key.data !== currentParamData.data);

        if(afterRemoveData.length < 1)
        {
            let lastIpt = document.getElementsByClassName("filterValueIpt")[0];

            afterRemoveData = [{"data": 0, "tabKey": "", "tabValue": ""}];

            if (lastIpt)
                lastIpt.value = "";

        }

        form.setFieldsValue({
            allParamData: afterRemoveData
        });

        this.paramOptionArray.forEach(item =>
        {
            if(item.value === currentParamData.tabKey)
            {
                item.disabled = false
            }
        });

        this.props.getParamsData(afterRemoveData);
    }

    // 添加筛选条件
    add()
    {
        uuid++;
        const {form} = this.props,
            allParamData = form.getFieldValue('allParamData'),
            newAllParamData = allParamData.concat({"data": uuid, "tabKey": "", "tabValue": ""});

        if(allParamData.length > 13)
            return;
        form.setFieldsValue({
            allParamData: newAllParamData
        });
        this.props.getParamsData(newAllParamData);
    }

    render()
    {
        let {getFieldValue, getFieldDecorator} = this.props.form,
            allParamData = getFieldValue('allParamData'),
            form = allParamData && allParamData.map((currentParamData, index) =>
                {
                    return (
                        <div key={currentParamData.data} style={{position: "inherit"}}>
                            <svg style={{
                                width: "8px", height: "8px", position: "absolute", left: "-4px", top: "14px",
                                zIndex: "10"
                            }}>
                                <circle cx="4" cy="4" r="4"/>
                            </svg>
                            {
                                index == 0 ?
                                    <div className="dimensionsOptions">
                                        <span className='queueList-border'/>
                                        <RadioButton style={{marginTop: "3px", borderRadius: "6px"}}>And</RadioButton>
                                    </div>
                                    : null
                            }
                            <div className="dimensionsOptions">
                                <span className='queueList-border'/>
                                <Select size="large" style={{width: 226}}
                                    value={currentParamData.tabKey || getLangTxt("setting_custom_tab_params")}
                                    getPopupContainer={() => document.getElementsByClassName('dimensionsOptions')[0]}
                                    onChange={this.handleChange.bind(this, currentParamData)}
                                    option={this.getParamOption(allParamData)}
                                />
                                <span style={{margin:'0 10px'}}>=</span>
                                {this.getIptComponent(currentParamData)}
                                <Tooltip placement="bottom" title={getLangTxt("del")}>
                                    <i className="iconfont icon-006jianxiao delFilter"
                                        onClick={this.remove.bind(this, currentParamData)}
                                        style={{color:'red'}}/>
                                </Tooltip>

                            </div>
                        </div>
                    );
                });

        return (
            <div className="customScreen">
                <div className="content">
                    <div className="mask"></div>
                    <div className="main">
                        <Form>
                            {
                                form
                            }
                        </Form>

                        <div className="add" onClick={this.add.bind(this)}>
                            <i className="iconfont icon icon-tianjia1"/>
                            <span>{getLangTxt("add_dimension")}</span>
                        </div>
                        <Form>
                            <FormItem>
                                {getFieldDecorator('allParamData')(
                                    <div></div>
                                )}
                            </FormItem>
                        </Form>
                    </div>
                </div>
            </div>
        )
    }
}

ParamSetting = Form.create()(ParamSetting);
function mapStateToProps(state)
{
    return {
        customerTabData: state.customerTabReducer
    };
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({getCustomerTabParams}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ParamSetting);
