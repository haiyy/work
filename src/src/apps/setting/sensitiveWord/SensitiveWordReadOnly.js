import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Switch, Table, Form, Tooltip } from 'antd';
import { getSensitive } from './action/sensitiveWord';
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";

const FormItem = Form.Item;

class SensitiveWordReadOnly extends Component {
    constructor(props)
    {
        super(props);
        this.state = {
            visible1: false,
            warning: false
        };
    }

    componentDidMount()
    {
        this.props.getSensitive();
    }

    reFreshFn()
    {
        this.props.getSensitive();
    }

    render()
    {
        let {state, progress} = this.props, name = null, {getFieldDecorator} = this.props.form, supplier, words;

        if(state)
        {
            name = state.words && state.words.join("，");
            supplier = state.filterSupplier == 1;
            words = state.words
        }

        const columns = [{
            title: getLangTxt("setting_word_library"),
            dataIndex: 'name',
            key: 'name',
            render: text => <div>{text}</div>
        }, {
            title: getLangTxt("operation"),
            key: 'action',
            width: 100,
            render: (text, record) =>
            {
                let _style;
                if(record.name == "")
                {
                    _style = {color: "#9a9a9a"}
                }
                return (
                    <span>
                      <a>
                          <Tooltip placement="bottom" title={getLangTxt("edit")}>
                            <i className="iconfont icon-bianji"/>
                          </Tooltip>
                      </a>

                      <a style={{marginLeft: "0.15rem"}}>
                          <Tooltip placement="bottom" title={getLangTxt("clear")}>
                            <i style={_style}
                                className="iconfont icon-ziyuan"/>
                          </Tooltip>
                      </a>
                    </span>
                )
            }
        }], data = [{key: '1', name: name ? name : ""}];

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        return (
            <div className="sensitiveWord">
                <div className="sensitiveTop">
                    <FormItem>
                        {getFieldDecorator('filterSupplier', {
                            valuePropName: 'checked',
                            initialValue: supplier
                        })(
                            <Switch disabled/>
                        )}
                        <span>{getLangTxt("setting_shield_sensitive_words")}</span>
                    </FormItem>
                </div>

                <div className="sensitiveBottom">
                    {/*<span>屏蔽方式</span>
                     <Checkbox  checked={this.state.checked} onChange={this.onCheckChange.bind(this)}>不允许发送敏感词</Checkbox>*/}
                    <Table columns={columns} dataSource={data} pagination={false}/>
                    {
                        getProgressComp(progress)
                    }
                </div>

            </div>
        )
    }

}

SensitiveWordReadOnly = Form.create()(SensitiveWordReadOnly);

function mapStateToProps(state)
{
    return {
        state: state.sensitiveWord.data,
        progress: state.sensitiveWord.progress
    }
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({getSensitive}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SensitiveWordReadOnly);
