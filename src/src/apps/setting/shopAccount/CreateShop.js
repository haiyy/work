import React  from 'react';
import { Form, Input, TreeSelect, Select } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ScrollArea from 'react-scrollbar';
import { bglen } from "../../../utils/StringUtils";
import './style/createShop.less';
import ShopAccount from "./ShopAccount";
import NTModal from "../../../components/NTModal";
import {addShopItem, editShopItem, getShopAccountList, getShopAccountListEmpty} from "./reducer/shopAccountReducer";
import {getNewUserInfo} from "../account/accountAction/sessionLabel";
import {_getProgressComp} from "../../../utils/MyUtil";

const FormItem = Form.Item, TreeNode = TreeSelect.TreeNode;

class CreateShop extends React.PureComponent {

	constructor(props)
	{
		super(props);
	}

    componentDidMount() {
        let {modalType, editGroupInfo = {siteid: ""}} = this.props,
            { siteid } = editGroupInfo;

        if (modalType === 2)
        {
            this.props.getShopAccountList(siteid);
            this.props.getNewUserInfo(siteid);
        }else
        {
            this.props.getShopAccountListEmpty();
        }

        
    }

    judgeShowNameSpace(rule, value, callback)
    {
        let accountNameRe = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/;

        if(value && value.trim() !== "" && accountNameRe.test(value) && bglen(value) <= 200)
        {
            callback();
        }
        callback(" ");
    }

    judgeSeatsNum(rule, value, callback)
    {
        let parseVal = parseInt(value);
        if(parseVal || parseVal === 0)
        {
            callback();
        }
        callback(" ");
    }

    handleSaveNewShop()
    {
        let {form, modalType, selectedGroupId, pageData} = this.props;

        form.validateFields((errors, values) => {
            if (errors)
                return;

            let groupid = values["selectGroup"],
                newGroupData = {
                name: values["shop-name"],
                groupid,
                grade: values["select-level"],
                usernum: parseInt(values["shop-seats"]),
                siteid: values["account-ID"]
            };

            if (modalType === 1) //新建商户
            {
                this.props.addShopItem(newGroupData, pageData, groupid);
            }else
            {
                this.props.editShopItem(newGroupData, pageData, selectedGroupId);
            }

            this.props.handleCancel();
        })
    }

    handleCancel()
    {
        this.props.handleCancel();
    }

    get shopGroupList()
    {
        let {shopData} = this.props;

        return shopData.get("shopGroupList")
    }

    get progress()
    {
        let {shopData} = this.props;

        return shopData.get("shopAccountProgress")
    }

    _getTreeNode(groupList)
    {
        if(groupList && groupList.length)
            return groupList.map(item =>
            {
                let {groupid, groupname} = item;

                if(item.children && item.children.length > 0)
                {
                    return (
                        <TreeNode value={groupid} title={groupname} key={groupid}>
                            {
                                this._getTreeNode(item.children)
                            }
                        </TreeNode>
                    );
                }
                return <TreeNode value={groupid} title={groupname} key={groupid}/>;
            });
    }

    handleSelectGroup(value)
    {
        this.props.getCurrentGroup(value);
    }

	render()
	{
        let {
            form: {getFieldDecorator},
            formItemLayout = {labelCol: {span: 3}, wrapperCol: {span: 14}},
            modalType,
            editGroupInfo,
            selectedGroupId = ""
        } = this.props,
            modalTitle = modalType === 1 ? "新建商户": "编辑商户",
            modalClass = modalType === 1 ? "modalCommonStyle newShopModal" : "modalCommonStyle createShopModal",
            bindClass = modalType === 1 ? ".shopInfo" : ".levelSelected";

		return (
            <NTModal className={modalClass} id="scrollArea" width={640} title={modalTitle} visible={true} okText="保存"
                onOk={this.handleSaveNewShop.bind(this)} onCancel={this.handleCancel.bind(this)}>
                <div className="createShop">
                    <Form className="shopInfo" hideRequiredMark={true}>
                        <FormItem {...formItemLayout} label="选择分组" className="selectedGroupNm">
                            {
                                getFieldDecorator('selectGroup', {
                                    initialValue: modalType === 2 ? editGroupInfo.groupid : selectedGroupId ,
                                    rules: [{required: true, message: ' '}]
                                })(
                                    <TreeSelect
                                        dropdownStyle={{maxHeight: 230, overflowX: 'hidden', overflowY: 'auto'}}
                                        onChange={this.handleSelectGroup.bind(this)}
                                        getPopupContainer={() => document.querySelector('.selectedGroupNm')}
                                    >
                                        {
                                            this._getTreeNode(this.shopGroupList)
                                        }
                                    </TreeSelect>
                                )
                            }
                        </FormItem>

                        <FormItem className="shopNameItem" {...formItemLayout} label="商户名称" help={'最多不超过100个汉字'}>
                            {
                                getFieldDecorator('shop-name', {
                                    initialValue: modalType === 2 ? editGroupInfo.name : "" ,
                                    rules: [{validator: this.judgeShowNameSpace.bind(this)}]
                                })(
                                    <Input/>
                                )
                            }
                        </FormItem>
                        <FormItem {...formItemLayout} label="商户ID">
                            {
                                getFieldDecorator('account-ID', {
                                    initialValue: modalType === 2 ? editGroupInfo.siteid : "",
                                    rules: [{required: true, message: ' '}]
                                })(
                                    <Input/>
                                )
                            }
                        </FormItem>
                        <FormItem {...formItemLayout} label="选择等级" className="levelSelected">
                            {
                                getFieldDecorator('select-level', {
                                    initialValue: modalType === 2 ? editGroupInfo.grade : ""
                                })(
                                    <TreeSelect
                                        dropdownStyle={{maxHeight: 230, overflowX: 'hidden', overflowY: 'auto'}}
                                        getPopupContainer={() => document.querySelector(bindClass)}
                                    >
                                        <TreeNode key={1} value={1} title={1}/>
                                        <TreeNode key={2} value={2} title={2}/>
                                        <TreeNode key={3} value={3} title={3}/>
                                        <TreeNode key={4} value={4} title={4}/>
                                        <TreeNode key={5} value={5} title={5}/>
                                        <TreeNode key={6} value={6} title={6}/>
                                        <TreeNode key={7} value={7} title={7}/>
                                        <TreeNode key={8} value={8} title={8}/>
                                        <TreeNode key={9} value={9} title={9}/>
                                        <TreeNode key={10} value={10} title={10}/>
                                    </TreeSelect>
                                )
                            }
                        </FormItem>
                        <FormItem {...formItemLayout} label="商户坐席" className="levelSelected">
                            {
                                getFieldDecorator('shop-seats', {
                                    initialValue: modalType === 2 ? editGroupInfo.usernum : "",
                                    rules: [{validator: this.judgeSeatsNum.bind(this)}]
                                })(
                                    <TreeSelect
                                        dropdownStyle={{maxHeight: 230, overflowX: 'hidden', overflowY: 'auto'}}
                                        getPopupContainer={() => document.querySelector(bindClass)}
                                    >
                                        <TreeNode key={1} value={1} title={1}/>
                                        <TreeNode key={2} value={2} title={2}/>
                                        <TreeNode key={3} value={3} title={3}/>
                                        <TreeNode key={4} value={4} title={4}/>
                                        <TreeNode key={5} value={5} title={5}/>
                                        <TreeNode key={6} value={6} title={6}/>
                                        <TreeNode key={7} value={7} title={7}/>
                                        <TreeNode key={8} value={8} title={8}/>
                                        <TreeNode key={9} value={9} title={9}/>
                                        <TreeNode key={10} value={10} title={10}/>
                                    </TreeSelect>
                                )
                            }
                        </FormItem>
                    </Form>
                    {
                        modalType === 2 ? <ShopAccount siteid={editGroupInfo.siteid}/> : null
                    }
                </div>
                {
                    _getProgressComp(this.progress, "submitStatus shopAccountStatus")
                }
            </NTModal>
        )
	}
}

CreateShop = Form.create()(CreateShop);
function mapStateToProps(state)
{
    return {
        shopData: state.shopAccountReducer
    };
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({addShopItem, editShopItem, getShopAccountList, getShopAccountListEmpty, getNewUserInfo}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateShop);
