import React from 'react';
import {render} from 'react-dom';
import {Form, Input, TreeSelect, Tree} from 'antd';
import {connect} from "react-redux";
import {bindActionCreators} from 'redux';
import {stringLen} from "../../../utils/StringUtils";
import {Map, fromJS} from 'immutable';
import {getGroupList}  from "../redux/reducers/receptiongroupReducer";
import "../view/style/formContent.less";
import Modal from "../../../components/xn/modal/Modal";
const FormItem = Form.Item;
const {TextArea} = Input;
const TreeNode = Tree.TreeNode;
class ReceptiongroupComponent extends React.Component { //子组件
    constructor(props) {
        super(props);
        console.log(props)
        this.state = {
            modalShow: props.modalShow,
            visible: props.visible,
            confirmDirty: false,
            ruleNumLength: 0,
            value: '',
        }

    }

    componentDidMount()
    {
        this.groupData()
    }

    groupData() {
        let {actions} = this.props;

        actions.getGroupList();
    }

    handleSubmit = (e) => {
        var that = this;
        e.preventDefault();
        this.props.form.validateFieldsAndScroll((err, formData) => {
            if (!err) {
                that.props.onformData(formData);
            }
        });
    }

    onDescribe(e) {
        this.setState({
            ruleNumLength: e.target.value
        })
    }

    renderTreeNodes(data) {
        return data.map(((item)=> {
            item.value = item.groupName;
            if (item.users) {
                let disableCheckbox = item.users.length <= 0;
                return <TreeNode title={item.groupName} key={item.groupId} dataRef={item} value={item.groupName} disableCheckbox={disableCheckbox}>
                    {item.users.map((i)=> {
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

    get initGroupName() {
        let {ctiGroupList} = this.props,
            {list = [], templateName} = ctiGroupList,
            arr = [],
            recordGroup=[];

        list.map((item)=> {
            recordGroup.push(item.groupId);
            arr.push(item.attendantAccount);
        })
        return arr;
    }


    validatorTemplateName(rule,value,callback){
        if(stringLen(value)>30){
            callback(" ")
        }
        callback()
    }

    render() {
        let {ruleNumLength, value}=this.state,
            {modalShow, visible, treeGroupList, ctiGroupList, actionsType,form} = this.props,
            {templateName} = ctiGroupList,
            {getFieldDecorator} = this.props.form,
            formItemLayout = {
                labelCol: {span: 5},
                wrapperCol: {span: 15},
            },
            tProps = {
                value: value,
                onChange: this.onGroupChange.bind(this),
                treeCheckable: true,
                multiple: true,
                autoClearSearchValue:true,
                placeholder: '请选择',
                treeDefaultExpandAll: false,
                dropdownMatchSelectWidth: true,
                treeNodeFilterProp:"title",
         
                style: {
                    width: 447,
                    minHeight: 30,
                    maxHeight: 100,
                },
                dropdownStyle: {maxHeight: 400, overflow: 'auto'}
            },
            tempName=form.getFieldValue("templateName") ||"";


        return (
            <div>
                {
                    modalShow ?
                        <Modal visible={visible} id="ModalBox" title={actionsType == 'edit' ? "编辑接待组" : "新建接待组"} okText="保存"   width="600px"  style={{maxWidth:600, top:300}} onOk={this.handleSubmit.bind(this)} onCancel={this.props.handleCancel.bind(this)}>
                            <Form onSubmit={this.handleSubmit.bind(this)}> <FormItem{...formItemLayout} label="接待组名称" >
                                {
                                    getFieldDecorator('templateName', {
                                        initialValue: actionsType == 'edit' ? templateName : '' ,
                                        rules: [{
                                            required: true,
            
                                            message:" "
                                        },{
                                            validator:this.validatorTemplateName.bind(this)
                                        }],
                                    })(<Input style={{width:'85%'}}  onChange={this.onDescribe.bind(this)}/>)}
                                <span className="CallOut-num">{stringLen(tempName)}/30</span> </FormItem>
                                <FormItem{...formItemLayout} label="负责坐席">
                                    {getFieldDecorator('userIds', {
                                        initialValue: actionsType == 'edit' ? this.initGroupName : '',
                                        rules: [{
                                            required: true,
                                            message:" "
                                        }],
                                    })(
             
                                       <TreeSelect {...tProps} >
                                            {this.renderTreeNodes(treeGroupList)}
                                       </TreeSelect>
                                    )}
                                </FormItem>
                            </Form>
                        </Modal>
                        : null
                }
            </div>
        )
    }
}

const mapStateToProps = (state) => {
    let {receptiongroupReducer} = state;
    return {
        ctiGroupList: receptiongroupReducer.get("ctiGroupList") || {},
        treeGroupList: receptiongroupReducer.get("treeGroupList") || [],
    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({getGroupList}, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(ReceptiongroupComponent));
