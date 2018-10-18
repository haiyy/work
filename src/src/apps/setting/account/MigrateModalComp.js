import React, { Component } from 'react';
import { TreeSelect, Form } from 'antd';
import NTModal from "../../../components/NTModal";
import { getLangTxt } from "../../../utils/MyUtil";

const TreeNode = TreeSelect.TreeNode,
    FormItem = Form.Item;

class MigrateModalComp extends Component {

	constructor(props)
	{
		super(props);
		this.state = {
		};
	}

    //获取迁移账户行政组选择树
    _getTreeNode(treeData)
    {
        if(treeData)
            return treeData.map(item =>
            {
                let {groupid, groupname} = item;
                groupid = String(groupid);

                if(item.children && item.children.length > 0)
                {
                    return (
                        <TreeNode disabled={groupid === this.props.currentID} value={groupid} title={groupname} key={groupid}>
                            {
                                this._getTreeNode(item.children)
                            }
                        </TreeNode>
                    );
                }
                return <TreeNode disabled={groupid === this.props.currentID} value={groupid} title={groupname} key={groupid}/>;
            });
    }
    //点击选择迁移行政组
    _onTreeChange(groupId)
    {

    }

    //取消迁移账户
    handleMigrateCancel()
    {
        this.props.isOpenMigrateModal(false);
    }

    //确定迁移账户
    handleMigrateOk()
    {
        this.props.form.validateFieldsAndScroll((err, values) => {
            if (!err) {
                this.props.isOpenMigrateModal(false, values['migrateGroup']);
            } else {

            }
        });

    }


	render()
	{
        const {form: {getFieldDecorator}} = this.props;
        let {accountGroupList = []} = this.props,
            formItemLayout = {labelCol: {span: 4}, wrapperCol: {span: 8}};
        return (
            <NTModal title={getLangTxt("setting_account_multiple_move")} visible={true} width={570} okText={getLangTxt("save")} cancelText={getLangTxt("cancel")}
                wrapClassName="migrateModal"
                onCancel={this.handleMigrateCancel.bind(this)}
                onOk={this.handleMigrateOk.bind(this)}>
                <Form>
                    <FormItem {...formItemLayout} label={getLangTxt("setting_account_multiple_move_group")}>
                        {
                            getFieldDecorator('migrateGroup', {
                                initialValue: "",
                                rules: [{required: true, message: getLangTxt("setting_account_note15")}]
                            })(
                                <TreeSelect
                                    style={{width: "440px"}}
                                    dropdownStyle={{maxHeight: 230, overflowX: 'hidden', overflowY: 'auto'}}
                                    onChange={this._onTreeChange.bind(this)}
                                >
                                    {
                                        this._getTreeNode(accountGroupList)
                                    }
                                </TreeSelect>
                            )
                        }
                    </FormItem>
                </Form>
            </NTModal>
		)
	}
}
MigrateModalComp = Form.create()(MigrateModalComp);
export default MigrateModalComp;
