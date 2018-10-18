import React from 'react';
import {Form, Input} from 'antd';
import Modal from "../../../components/xn/modal/Modal";
import { bglen } from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";
import TreeSelect from "../../public/TreeSelect";
import TreeNode from "../../../components/antd2/tree/TreeNode";

const FormItem = Form.Item;

class NewSourseType extends React.PureComponent {

    constructor(props) {
        super(props);

        this.state = {display: false}
    }

    _getPid(value, label, extra) {
        this.props.newGroupItem(value || "0");
    }

    judgeSpace(rule, value, callback)
    {
        if(value && value.trim() !== "" && bglen(value) <= 200)
        {
            callback();
        }
        callback(" ");
    }

    typeOk()
    {
        let {form} = this.props;
        form.validateFields((errors) => {
            let obj = {
                typename: this.props.form.getFieldValue("name") || "",
                pid: this.props.form.getFieldValue("pid") || 0,
                typeexplain: this.props.form.getFieldValue("info") || ""
            };
            if (errors)
                return false;
            if (this.props.newTypeName == getLangTxt("setting_source_add_type"))
            {
                this.props.newVisitorType(obj);
                this.props.changeNewType();
            }

            if (this.props.newTypeName == getLangTxt("setting_source_edit_type"))
            {
                let editorData = this.props.editorData, ownId = editorData.pid;

                obj.pid = this.props.form.getFieldValue("pid") || editorData.pid;
                obj.source_type_id = editorData.source_type_id;

                this.props.editorVisitorType(obj, ownId);
                this.props.changeNewType();
            }
        })
    }

    _createTreeNodes(states, editSorceId)
    {
        if (!states || states.length <= 0)
            return null;

        return states.map(item =>
        {
            item.disabled = item.source_type_id === editSorceId;
             return (
                <TreeNode key={item.source_type_id} label={item.typename} value={item.source_type_id.toString()} title={item.typename} disabled={item.disabled}>
                    {item.children ? this._createTreeNodes(item.children, editSorceId) : null}
                </TreeNode>
            );
        });
    };

    render()
    {
        const {getFieldDecorator} = this.props.form, newTypeName = this.props.newTypeName != getLangTxt("setting_source_add_type"),
            formItemLayout = {
                labelCol: {span: 6},
                wrapperCol: {span: 14}
            }, {editorData = {}, visitorTreeData=[]} = this.props,
            currentGroup = this.props.selectedKey[0] || "",
            treeNodes = this._createTreeNodes(visitorTreeData,editorData && newTypeName && editorData.source_type_id),
            treeNodesAndEmpty = treeNodes.concat(<TreeNode value="0" title={<div>空</div>}/>);

        return (
            <Modal className='newsourses-type' title={this.props.newTypeName} visible={true} okText={getLangTxt("save")}
                onOk={this.typeOk.bind(this)} onCancel={this.props.changeNewType.bind(this)}>
                <div style={{marginTop:'14px'}}>
                    <Form horizontal>
                        <FormItem {...formItemLayout} label={getLangTxt("setting_source_type_add")} hasFeedback>
                            {getFieldDecorator('name', {
                                rules: [{required: true, validator: this.judgeSpace.bind(this)}],
                                initialValue: editorData && newTypeName ? editorData.typename : ""
                            })(
                                <Input/>
                            )}
                        </FormItem>

                        <FormItem {...formItemLayout} label={getLangTxt("setting_source_group")}>
                            {getFieldDecorator('pid',
                                {
                                    initialValue: editorData && newTypeName ? editorData.pid.toString() : currentGroup && currentGroup
                                })(
                                <TreeSelect style={{ width: "100%" }}
                                    onChange={this._getPid.bind(this)}
                                    treeNode={treeNodesAndEmpty}
                                />
                            )
                            }
                        </FormItem>

                        <FormItem {...formItemLayout} label={getLangTxt("setting_source_type_instruction")} hasFeedback>
                            {getFieldDecorator('info', {initialValue: editorData && newTypeName ? editorData.typeexplain : ""})(
                                <Input type="textarea" style={{height:'100px', resize:'none'}}/>
                            )}
                        </FormItem>
                    </Form>
                </div>
            </Modal>
        )
    }
}

NewSourseType = Form.create()(NewSourseType);

export default NewSourseType;
