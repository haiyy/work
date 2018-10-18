import React  from 'react';
import { Form, Input, TreeSelect } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import ShopGroup from "./ShopGroup";
import Modal from "../../../components/xn/modal/Modal";
import { bglen, stringLen } from "../../../utils/StringUtils";

const TreeNode = TreeSelect.TreeNode, FormItem = Form.Item;

class CreateShopGroup extends React.PureComponent {

	constructor(props)
	{
		super(props);
        this.fatherId = null;
	}

	_getTreeNode(treeData, editGroupId)
	{
		if(treeData)
			return treeData.map(item =>
			{
				let {groupid, groupname} = item;
				groupid = String(groupid);

                item.disabled = item.groupid === editGroupId;

				if(item.children && item.children.length>0)
				{
					return (
						<TreeNode value={groupid} title={groupname} key={groupid} disabled={item.disabled}>
							{
								this._getTreeNode(item.children, editGroupId)
							}
						</TreeNode>
					);
				}
				return <TreeNode value={groupid} title={groupname} key={groupid} disabled={item.disabled}/>;
			});
	}

	_onTreeChange(value)
	{
		this.fatherId = value;
        if (!value)
            this.fatherId = "null";
        this.props.getCurrentGroup(value);
	}

	_onInputChange(e)
	{
		this.groupname = e.target.value;
	}

    groupDataOk()
    {
        let {form} = this.props;
        form.validateFields((errors) => {
            if (errors)
                return false;

            if(!this.groupname && !this.fatherId)
                return false;

            let {info, model} = this.props,
                groupInfo = {...info},
                groupname = this.groupname;  //groupName

            if(model === ShopGroup.EDIT_GROUP)
            {
                groupInfo.oldParentid = info.parentid;
                groupInfo.groupname = groupname || info.groupname;
                groupInfo.parentid = this.fatherId ? this.fatherId : info.parentid;
            }
            else
            {
                groupInfo = {
                    description: groupname,
                    parentid: this.fatherId,
                    groupname
                };
            }

            if (this.fatherId == "null")
            {
                groupInfo.parentid = null;
            }

            this.props.typeOk();
            this.props.getAddGroup(groupInfo);
        })
    }
    groupDataCancel()
    {
        this.props.typeCancel()
    }

    judgeSpace(rule, value, callback)
    {
        if (value && typeof value !== "string")
            return callback();

        if(value && value.trim() !== "" && bglen(value) <= 32)
        {
            callback();
        }
        callback(" ");
    }

	render()
	{
		let {groupInfo, info, model, form} = this.props,
			treeData = groupInfo || [],
			title = "新增商户分组名称",
			selectTree = null,
            groupName = "",
            groupNameLen = 0,
            {getFieldDecorator} = this.props.form,
            formItemLayout = {
            labelCol: {span: 6},
            wrapperCol: {span: 15}
        };

		if(model === ShopGroup.EDIT_GROUP)
		{
			title = "编辑商户分组名称";

			if(info)
				groupName = info.groupname;
		}
        if (this.groupname || this.groupname === "")
            groupName = form.getFieldValue("accountGroupName") || "";

        groupNameLen = groupName && stringLen(groupName) || 0;

        selectTree = (
            <div className="accountGroupFather">
                <FormItem
                    {...formItemLayout}
                    label="上级分组"
                    hasFeedback>
                    {getFieldDecorator('accountGroupParent', {
                        initialValue:model === ShopGroup.EDIT_GROUP ? info.parentid : ""
                    })(
                        <TreeSelect className="myCls"
                                    treeDefaultExpandAll
                                    dropdownStyle={{ maxHeight: 300, overflowY: 'auto', overflowX: 'hidden' }}
                                    onChange={this._onTreeChange.bind(this)}>
                            {
                                this._getTreeNode(treeData,  title === "编辑商户分组名称" && info.groupid)
                            }
                            <TreeNode title={<div>空</div>} value="null"/>
                        </TreeSelect>
                    )}
                </FormItem>
            </div>
        );

		return (
            <Modal className='newsourses-type createShopGroupModal' visible={true} okText="保存"
                   onOk={this.groupDataOk.bind(this)} onCancel={this.groupDataCancel.bind(this)}>
                <div className="CreateGroup">
                    <Form horizontal>
                        <FormItem
                            {...formItemLayout}
                            label={title || ""}
                            hasFeedback>
                            {getFieldDecorator('accountGroupName', {
                                initialValue: groupName,
                                rules: [{required: true, validator: this.judgeSpace.bind(this)}]
                            })(
                                <Input onChange={this._onInputChange.bind(this)}/>
                            )}
                            <span className="groupNameLen">{groupNameLen}/16</span>
                        </FormItem>
                        {
                            selectTree
                        }
                    </Form>
                </div>
            </Modal>
        )
	}
}

CreateShopGroup = Form.create()(CreateShopGroup);
function mapStateToProps(state)
{
    return {
        shopData: state.shopAccountReducer
    };
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(CreateShopGroup);
