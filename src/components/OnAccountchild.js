import React from 'react';
import {  TreeSelect,Row, Col } from 'antd';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import { getGroupNameBinding,getGroupCustomerUnbindList } from "../apps/callcenter/redux/reducers/bindOnAccoutReducer"
import Modal from "../components/xn/modal/Modal";

const TreeNode = TreeSelect.TreeNode;

class OnAccountchild extends React.Component{ //子组件
    constructor(props){
        super(props);
        this.state = {
            Modalshow: props.ModalShow,
            visible: props.visible,
            userData:""//所选客服信息
        }
        
        this.onLoadData = this.onLoadData.bind(this);
        this.onChange = this.onChange.bind(this);
        this.clickOK = this.clickOK.bind(this);
        this.clickCancle = this.clickCancle.bind(this);
    }

    //数据请求
    componentDidMount(){
        this.props.actions.getGroupNameBinding();
    }

    //选择客服动作
    onChange(value, label, extra) {
        let userData = (extra && extra.triggerNode && extra.triggerNode.props && extra.triggerNode.props.dataRef)?extra.triggerNode.props.dataRef:"";
        this.setState({
            value: value,
            userData:userData
        });
    }

    //点击确定动作
    clickOK() {
        const {userData} = this.state;
        if (userData == "") return;
        this.props.handleOk(this.state.userData);
        //清除数据
        this.setState({value:"", userData:""});
    }

    //点击取消
    clickCancle() {
        //清除数据
        this.setState({value:"", userData:""});
        this.props.handleCancel();
    }

    //加载子节点
    renderTreeNodes(data) {
        return data.map(((item)=>{
            item.value = item.groupName;
            if (item.children) {
                item.disabled = false;
               return <TreeNode className="bindAccountTreeNode" title={item.groupName} key={item.groupId} dataRef={item} value={item.groupName} disabled>
                        {item.children.map((i)=>{
                            i.groupName = item.groupName;
                            return <TreeNode title={i.nickName} key={i.userId} dataRef={i} isLeaf value={i.nickName}/>;
                        })}
                       </TreeNode>
            }
            return (<div>出错</div>);
        }));
    }

    //点击加载子数据时的操作
    onLoadData(treeNode) {
        return new Promise((resolve)=>{
            // if(treeNode.props.dataRef.children.length > 0)
            // {
            //     resolve();
            //     return;
            // }
            let groupId = (treeNode && treeNode.props && treeNode.props.dataRef)?treeNode.props.dataRef.groupId:"";
            this.props.actions.getGroupCustomerUnbindList(groupId,resolve);
        })
    }

    render()
    {
        const  { Modalshow, Visible}=this.props,
                tProps = {
                loadData:this.onLoadData,
                value: this.state.value,
                onChange: this.onChange,
                // treeCheckable: true,
                // multiple: false,
                placeholder:'',
                treeDefaultExpandAll: false,
                dropdownMatchSelectWidth:true,
                style: {
                    width: 240,
                    minHeight:30,
                    maxHeight:100,
                },
                dropdownStyle:{maxHeight:400,overflow:'auto'}

        };
        const {dataList,extensionNumber} = this.props;
        return(
        <div>
            {
        Modalshow?
                    <Modal
                        visible={Visible}
                        width="380px"
                        style={{width: '100%', maxWidth:380,top:280}}
                        bodyStyle={{padding:'16px 0.17rem'}}
                        onOk={this.clickOK}
                        onCancel={this.clickCancle}
                        title={(<p style={{color:'#333', fontSize:12}}>新建绑定关系</p>)}
                        okText="保存"
                    >
                        <Row style={{fontSize:"14px !important",lineHeight:"30px"}}>
                            <Col span={4}>分机号</Col>
                            <Col span={8}>{extensionNumber}</Col>
                        </Row>
                        <Row style={{marginTop:15,fontSize:"14px !important",lineHeight:"30px"}} className="kefu_BindAccount">
                            <Col span={4}>客服</Col>
                            <Col span={8}>
                                <TreeSelect {...tProps} checkable>
                                    {this.renderTreeNodes(dataList)}
                                </TreeSelect>
                            </Col>
                        </Row>
                    </Modal>
                :''
            }
        </div>
    )
    }
}

const mapStateToProps = (state) => {
    let {bindOnAccoutReducer} = state;
    return {
        dataList: bindOnAccoutReducer.get("groupnameList") || {},
        progress: bindOnAccoutReducer.get("progress") || {},

    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({getGroupNameBinding,getGroupCustomerUnbindList}, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(OnAccountchild);
