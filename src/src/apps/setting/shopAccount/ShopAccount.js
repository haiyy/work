import React  from 'react';
import { Form, Button, Table, Select, Input, Tooltip, Modal, Popover } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import NTModal from "../../../components/NTModal";
import { bglen, truncateToPop } from "../../../utils/StringUtils";
import './style/createShop.less';
import {addShopAccount, editShopAccount, delShopAccount} from "./reducer/shopAccountReducer";

const FormItem = Form.Item;

class ShopAccount extends React.PureComponent {

	constructor(props)
	{
		super(props);
        this.state = {}
	}

    isShowAccountModal(modalType, record)
    {
        this.setState({modalType, record})
    }

    handleSubmitNewAccount()
    {
        let {form, siteid} = this.props,
            {modalType, record} = this.state;

        form.validateFields((errors, values) => {
            if(errors)
                return;

            let obj = {
                "roleid": values["select-role"].join(","),
                "username":values["admin-account"],
                "password":values["password-confirm"],
                "siteid": siteid
            };
            if (modalType === 'new') //新建账号
            {
                this.props.addShopAccount(obj)
            }else
            {
                obj.userid = record.userid;
                obj.rank = record.rank;
                if (!obj.password)
                    delete obj.password;
                this.props.editShopAccount(obj)
            }
            this.isShowAccountModal(false, false)
        })
    }

    handleDelShopAccount(record)
    {
        let {siteid, userid} = record;

        Modal.confirm({
            title: '删除提示',
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip',
            content: '是否确定删除此项？',
            onOk : () => {
                this.props.delShopAccount({userid, siteid})
            }
        });
    }

    judgeShowNameSpace(rule, value, callback)
    {
        let accountNameRe = /^[a-zA-Z0-9_\u4e00-\u9fa5]+$/,
            ruleLegality = accountNameRe.test(value) && bglen(value) <= 32;

        if(ruleLegality)
        {
            callback();
        }
        callback(" ");
    }

    /*密码验证*/
    checkPasswordRule(rule, value, callback) {

        let {modalType} = this.state;

        if (value && value.length <= 20 && value.length >= 6 || modalType && !value) {
            callback();
        }
        callback(' ');
    }

    /*确认密码验证*/
    checkPasswordSame(rule, value, callback) {
        const {form} = this.props,
            password = form.getFieldValue('password');
        if (value && value === password || !password && !value) {
            callback();
        }
        callback(' ');
    }

    getNewShopAccountModal()
    {
        let {modalType, record} = this.state,
            {roleData} = this.props,
            {getFieldDecorator} = this.props.form,
            formItemLayout = {labelCol: {span: 4}, wrapperCol: {span: 18}},
            isEdit = modalType === 'edit',
            modalTitle = isEdit ? '编辑账号' : '新建账号';


        if (modalType)
            return <NTModal className='modalCommonStyle shopAccountModal'
                        visible={true} okText="保存"
                        title={modalTitle}
                        onOk={this.handleSubmitNewAccount.bind(this)}
                        onCancel={this.isShowAccountModal.bind(this, false, false)}
                    >
                        <Form className="shopInfo" hideRequiredMark={true}>
                            <FormItem {...formItemLayout} label="账号">
                                {
                                    getFieldDecorator('admin-account', {
                                        initialValue: isEdit ? record.username : "" ,
                                        rules: [{validator: this.judgeShowNameSpace.bind(this)}]
                                    })(
                                        <Input/>
                                    )
                                }
                            </FormItem>
                            <FormItem {...formItemLayout} label="密码">
                                {
                                    getFieldDecorator('password', {
                                        initialValue: "",
                                        rules: [{
                                            required: !isEdit, message: '6-20位英文字母/数字或特殊字符组成',max: 20, min: 6
                                        }, {
                                            validator: this.checkPasswordRule.bind(this)
                                        }]
                                    })(
                                        <Input type="password"/>
                                    )
                                }
                            </FormItem>
                            <FormItem {...formItemLayout} label="确认密码">
                                {
                                    getFieldDecorator('password-confirm', {
                                        initialValue: "",
                                        rules: [{validator: this.checkPasswordSame.bind(this)}]
                                    })(
                                        <Input type="password"/>
                                    )
                                }
                            </FormItem>
                            <FormItem {...formItemLayout} label="角色">
                                {
                                    getFieldDecorator('select-role', {
                                        initialValue: isEdit ? record.roleid : [],
                                        rules: [{required: true}]
                                    })(
                                        <Select showSearch optionFilterProp="children" mode="multiple">
                                            {
                                                roleData && roleData.map((item) =>
                                                {
                                                    return (
                                                        <Option key={item.roleid}
                                                            value={item.roleid}>{item.rolename}</Option>
                                                    )
                                                })
                                            }
                                        </Select>
                                    )
                                }
                            </FormItem>
                        </Form>
                    </NTModal>
    }

    get shopAccountList()
    {
        let {shopData} = this.props;

        return shopData.get("shopAccountList")
    }

	render()
	{
        let column = getColumns.call(this);

		return (
            <div className="shopAccountComp">
                <div className="shopAccountHeader clearFix">
                    <div className="headerLabel">账号信息</div>
                    <Button type="primary" icon="plus" onClick={this.isShowAccountModal.bind(this, 'new', false)}>新建账号</Button>
                </div>
                <Table columns={column} dataSource={this.shopAccountList} pagination={false}/>
                {
                    this.getNewShopAccountModal()
                }
            </div>
        )
	}
}

function getColumns()
{
    return [{
        key: 'username',
        dataIndex: 'username',
        title: '账号',
        width: '40%'
    }, {
        key: 'roleid',
        title: '角色',
        dataIndex: 'roleid',
        width: '40%',
        render: record => {
            let {roleData = []} = this.props,
                recordToString = "",
                copyRecord = [...record];

            record.forEach((item, index) => {

                let exitItem = roleData.find(roleItem => roleItem.roleid == item);

                if (exitItem)
                {
                    copyRecord[index] = exitItem.rolename;
                }else
                {
                    copyRecord.splice(index, 1);
                }
            });

            recordToString = copyRecord.join("，");

            let typeEle = document.querySelector(".accountInfoStyle"),
                typeWidth = typeEle && typeEle.clientWidth,
                typeInfo = truncateToPop(recordToString, typeWidth) || {};

            return (
                typeInfo.show ?
                    <Popover content={<div style={{maxWidth: typeWidth + "px", height: "auto", wordWrap: "break-word"}}>{recordToString}</div>} placement="topLeft">
                        <div className="accountInfoStyle">{typeInfo.content}</div>
                    </Popover>
                    :
                    <div className="accountInfoStyle">{recordToString}</div>
            )
        }
    }, {
        key: 'operate',
        title: '操作',
        dataIndex: 'operate',
        width: '20%',
        render: (text, record) =>
            <div className="shopAccountOperate">
                <Tooltip placement="bottom" title="编辑">
                    <i className="iconfont icon-bianji" onClick={this.isShowAccountModal.bind(this, "edit", record)}/>
                </Tooltip>
                <Tooltip placement="bottom" title="删除">
                    <i className="iconfont icon-shanchu" onClick={this.handleDelShopAccount.bind(this, record)}/>
                </Tooltip>
            </div>
    }];
}

ShopAccount = Form.create()(ShopAccount);

function mapStateToProps(state)
{
    return {
        shopData: state.shopAccountReducer,
        roleData: state.getRoleList.data
    };
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({addShopAccount, editShopAccount, delShopAccount}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(ShopAccount);
