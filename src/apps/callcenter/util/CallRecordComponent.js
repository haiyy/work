import React from 'react';
import { Modal, Form, Input,DatePicker,TreeSelect ,Tree} from 'antd';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import {bglen} from "../../../utils/StringUtils"
import {getBindGroupList}  from "../redux/reducers/receptiongroupReducer"
import "../view/style/formContent.less"
const FormItem = Form.Item;
const {TextArea} = Input;
import moment from 'moment';
const RangePicker = DatePicker.RangePicker;
const TreeNode = Tree.TreeNode;
class CallRecordComponent extends React.Component { //子组件
    constructor(props)
    {
        super(props);
        console.log(props)
        this.state = {
            modalShow: props.modalShow,
            visible: props.visible,
            confirmDirty: false,
            ruleNumLength:0,
            value:'',

        }
    }

    componentDidMount()
    {
        this.groupData()
    }

    groupData(){
        let {actions} = this.props;

        actions.getBindGroupList();
    }

    handleSubmit = (e) => {
        var that = this;
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, formData) => {
            if(!err)
            {
                that.props.onformData(formData);
            }
        });
    }

    onDescribe(e){
        this.setState({
            ruleNumLength:e.target.value
        })
    }

    onTaskTime(dates){
        console.log("onTaskTime",dates)
    }

    renderTreeNodes(data) {
        return data.map(((item)=> {
            item.value = item.groupName;
            if (item.users) {
                item.disabled = false;
                return <TreeNode title={item.groupName} key={item.groupId} dataRef={item}>
                    {item.users.map((i)=> {
                        console.log(i);
                        i.groupName = item.groupName;
                        return <TreeNode title={i.nickName} key={i.userId} dataRef={i} isLeaf value={i.attendantAccount}/>;
                    })}
                </TreeNode>
            }
            return (<div>出错</div>);
        }))
    }

    onGroupChange(value, label, extra) {
        if (value == "false") {
            return;
        }
        this.setState({
            value: value,
        });
    }

    render()
    {
        let {ruleNumLength,GroupId,value}=this.state;
        const {modalShow, visible, treeGroupList} = this.props,
            {getFieldDecorator} = this.props.form,
            formItemLayout = {
                labelCol: {span: 5},
                wrapperCol: {span: 19},
            },

            tProps = {
                value: value,
                onChange: this.onGroupChange.bind(this),
                treeCheckable: true,
                multiple: true,
                placeholder:'请选择',
                treeDefaultExpandAll: false,
                dropdownMatchSelectWidth:true,
                treeNodeFilterProp:"title",
                style: {
                    width: 403,
                    minHeight:30,
                    maxHeight:100,
                },
                dropdownStyle:{height:"320px"},
            };

        return (
            <div>
                {
                    modalShow ?
                        <Modal
                            visible={visible}
                            title="新建外呼任务"
                            okText="保存"
                            width="543px"
                            id="recordModal"
                            style={{top:"200px"}}
                            onOk={this.handleSubmit.bind(this)}
                            onCancel={this.props.handleCancel.bind(this)}
                            zIndex={1000}
                        >
                            <Form onSubmit={this.handleSubmit.bind(this)}>
                                <FormItem {...formItemLayout} label="任务名称">
                                    {
                                        getFieldDecorator('taskName', {
                                            rules: [{
                                                required: true,
                                                message:" ",
                                            }],
                                        })(<Input maxlength={50}/>)
                                    }
                                </FormItem>
                                <FormItem {...formItemLayout} label="任务执行时间">
                                    {
                                        getFieldDecorator('startTime', {
                                            rules: [{
                                                required: true,
                                                message:" ",
                                            }],
                                            initialValue:[moment(),moment().add('hours',2)],
                                        })
                                        (<RangePicker
                                                ranges={{ Today: [moment(), moment()], 'This Month': [moment(), moment().endOf('month')] }}
                                                showTime
                                                disabledDate={current => {
                                                    return current&&current.isBefore(moment(Date.now()).add(-1, 'days'));
                                                  }}
                                                format="YYYY/MM/DD HH:mm:ss"
                                                onChange={this.onTaskTime.bind(this)}
                                                style={{width:404}}
                                            />
                                        )
                                    }
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="任务描述"
                                >
                                    {getFieldDecorator('describe', {

                                    })(
                                        <TextArea style={{height:"200px",resize:"none"}} maxlength={140} onChange={this.onDescribe.bind(this)}/>
                                    )}
                                </FormItem>
                                <FormItem
                                    {...formItemLayout}
                                    label="负责坐席"
                                >
                                    {getFieldDecorator('userIds', {
                                        initialValue:GroupId,
                                        rules:[{
                                            required:true,
                                            message:" "
                                        }]
                                    })(
                                        <TreeSelect {...tProps}  >
                                            {this.renderTreeNodes(treeGroupList)}

                                        </TreeSelect>
                                    )}
                                </FormItem>
                            </Form>
                        </Modal>
                        : ''
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    let {receptiongroupReducer} = state;
    return {
        treeGroupList: receptiongroupReducer.get("bindgroupList") || [],
    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({getBindGroupList}, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(CallRecordComponent));
