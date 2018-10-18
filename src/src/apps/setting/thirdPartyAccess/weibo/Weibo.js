import React from 'react';
import { connect } from 'react-redux';
import { Button, Table, Tooltip, Modal, TreeSelect, Form } from 'antd';
import {
	getCompanyWeiBoList,
	deleteWeiBoInfo,
    editWeiBoGroup,
    getWeiBoInfo
} from "./../reducer/weiboReducer";
import { bindActionCreators } from 'redux';
import WeiBoModel from "./WeiBoModel";
import ScrollArea from 'react-scrollbar';
import { formatTimestamp, getLangTxt, getProgressComp } from "../../../../utils/MyUtil";
import { distribute } from "../../distribution/action/distribute";
import NTModal from "../../../../components/NTModal";

const confirm = Modal.confirm,
    warning = Modal.warning,
    TreeNode = TreeSelect.TreeNode,
    FormItem = Form.Item;

class Weibo extends React.Component {

	constructor(props)
	{
		super(props);
		this.state = {
			isClickBtn: false,
			deleteModalIsShow: false,
			isNew: true,
			openId: '',
            isModify: false
		}
	}

	columns = [{
		title: getLangTxt("setting_weibo_count"),
		dataIndex: 'name',
		key: 'name'
	}, {
		title: getLangTxt("setting_wechat_butt_time"),
		dataIndex: 'time',
		key: 'time',
		render: (text) => {
			return (
				<span> {formatTimestamp(text, true)} </span>
			)
		}
	}, {
		title: getLangTxt("operation"),
		dataIndex: 'operate',
		key: 'operate',
		render: (text, record) => {
			return (
				<div className="thirdPartyAccessOperateBox">
                    <Tooltip placement="bottom" title={getLangTxt("setting_wechat_change_group")}>
                        <i className="iconfont icon-zu" onClick={this.editWeiboGroup.bind(this, record)}/>
                    </Tooltip>
                    <Tooltip placement="bottom" title={getLangTxt("edit")}>
						<i className="iconfont icon-bianji" onClick={this.editList.bind(this, record)}/>
					</Tooltip>
					<Tooltip placement="bottom" title={getLangTxt("del")}>
						<i className="iconfont icon-shanchu" onClick={this.delList.bind(this, record)}/>
					</Tooltip>
				</div>
			)
		}
	}];

	componentDidMount()
	{
		this.props.getCompanyWeiBoList();
		this.props.distribute("template");
	}

    /*修改接待组*/
    editWeiboGroup(editItem)
    {
        this.setState({isModify: true, editItem});
        this.props.getWeiBoInfo(editItem.openid)
    }

    handleModifyOK()
    {
        let {editItem} = this.state;

        let {form} = this.props;

        form.validateFields((errors) => {
            if (errors || !editItem)
                return false;

            let obj = {
                openid: editItem.openid,
                groupid: form.getFieldValue("groupId")
            };
            this.props.editWeiBoGroup(obj).then(result =>
            {
                if (result.code != 200)
                    warning({
                        title: getLangTxt("err_tip"),
                        width: '320px',
                        iconType: 'exclamation-circle',
                        className: 'errorTip',
                        okText: getLangTxt("sure"),
                        content: result.msg || getLangTxt("20034")
                    });
            });
            this.setState({isModify: false});
        });
    }

    handleModifyCancel()
    {
        this.setState({isModify: false})
    }

    _getWeiBoGroupTreeNode(treeData)
    {
        if(treeData)
            return treeData.map(item => {
                let {templateid, name} = item;
                templateid = String(templateid);

                if(item.children && item.children.length > 0)
                {
                    return (
                        <TreeNode value={templateid} title={name} key={templateid}>
                            {
                                this._getWeiBoGroupTreeNode(item.children)
                            }
                        </TreeNode>
                    );
                }
                return <TreeNode value={templateid} title={name} key={templateid}/>;
            });
        return <TreeNode value="groupid" title={getLangTxt("setting_wechat_admin_group_change")} disabled/>;
    }

	selectModel()
	{
		this.setState({
			isClickBtn: true,
			isNew: true
		})
	}

	editList(record)
	{
		let {openid: openId} = record;

		this.setState({
			isClickBtn: true,
			isNew: false,
			openId
		})
	}

	delList(record)
	{
		this.setState({
			deleteModalIsShow: true,
			openId: record.openid
		})
	}

	showDeleteModal()
	{
		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip skillWarnTip',
			content: <p style={{textAlign: 'center'}}>{getLangTxt("del_content")}</p>,
			cancelText: getLangTxt("cancel"),
			okText: getLangTxt("sure"),
			onOk: this.removeOk.bind(this),
			onCancel: this.removeCancel.bind(this)
		});
	}

	removeOk()
	{
		let {openId} = this.state;

		this.setState({
			deleteModalIsShow: false
		});

		this.props.deleteWeiBoInfo({openid: openId});
	}

	removeCancel()
	{
		this.setState({
			deleteModalIsShow: false
		})
	}

	backToMain(isPrev)
	{
		this.setState({isClickBtn: isPrev, mode: null})
	}

	render()
	{
		let {weiboReducer, groupData, form} = this.props,
            {getFieldDecorator} = form,
			developerWXList = weiboReducer.getIn(['developerWXList']) || [],
			progress = weiboReducer.getIn(['progress']) || [],
            weiboData = weiboReducer.getIn(['weiboData']) || {},
            {groupid = ""} = weiboData,
			{deleteModalIsShow, isNew, isClickBtn, openId, isModify} = this.state,
            formItemLayout = {
                labelCol: {span: 8},
                wrapperCol: {span: 14}
            };

		return (
			<div className="weiboWrapper thirdPartyAccessWrapper">
				{
					!isClickBtn ?
						<div className="weiboBox">
							<div className="weiboHeader">
                                <span className="weiboHeaderText">
                                    <i className="iconfont icon-weibo1"></i>
                                    <span>{getLangTxt("setting_weibo_butt")}</span>
                                </span>
								<Button type="primary" onClick={this.selectModel.bind(this)}>+{getLangTxt("setting_weibo_access")}</Button>
							</div>

							<div className="weiboContent">
								<p>{getLangTxt("setting_weibo_note1")}</p>
								<p>{getLangTxt("setting_weibo_note2")}</p>
                                <ScrollArea speed={1} horizontal={false} smoothScrolling
                                    style={{height: 'calc(100% - 60px)'}}>
									<Table dataSource={developerWXList} columns={this.columns} pagination={false}/>
								</ScrollArea>
							</div>
						</div>
						:
						<WeiBoModel isNew={isNew} openId={openId} closePage={this.backToMain.bind(this)}/>
				}

				{
					deleteModalIsShow ? this.showDeleteModal() : null
				}

                {
                    isModify ?
                        <NTModal visible
                            title={getLangTxt("setting_wechat_group_change")} onOk={this.handleModifyOK.bind(this)}
                            onCancel={this.handleModifyCancel.bind(this)}
                            width={400} wrapClassName="weChatGroupModal"
                        >
                            <Form hideRequiredMark={true}>
                                <FormItem label={getLangTxt("setting_wechat_group")} {...formItemLayout} hasFeedback className="weChatGroupFormItem">
                                    {
                                        getFieldDecorator('groupId', {
                                            initialValue: groupid ? groupid : undefined,
                                            rules: [{required: true}]
                                        })(
                                            <TreeSelect placeholder={getLangTxt("setting_wechat_group")} dropdownStyle={{
										maxHeight: 230, overflowX: 'hidden', overflowY: 'auto'
									}}>
                                                {
                                                    this._getWeiBoGroupTreeNode(groupData)
                                                }
                                            </TreeSelect>
                                        )
                                    }
                                </FormItem>
                            </Form>

                        </NTModal> : null
                }

				{
					getProgressComp(progress)
				}
			</div>
		)
	}
}
Weibo = Form.create()(Weibo);

function mapStateToProps(state)
{
	const weiboReducer = state.weiboReducer;

	return {
		weiboReducer,
        groupData: state.distributeReducer.data || []
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
        getCompanyWeiBoList,
        deleteWeiBoInfo,
        distribute,
        editWeiBoGroup,
        getWeiBoInfo
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Weibo);
