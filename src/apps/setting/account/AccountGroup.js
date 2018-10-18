import React from 'react';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Tree,  Popover, Tooltip } from 'antd';
import TreeNode from "../../../components/antd2/tree/TreeNode";
import { addGroup, editorGroup, removeGroup, getAccountGroup, clearErrorNewGroupProgress, editorGroupRank } from './accountAction/sessionLabel';
import CreateGroup from './CreateGroup';
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import { truncateToPop } from "../../../utils/StringUtils"
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

//const confirm = Modal.confirm;

class AccountGroup extends React.PureComponent {
	
	static NEW_GROUP = 0;  //新建行政组
	static EDIT_GROUP = 1;  //编辑行政组
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			display: false,
			info: null,
			link: false,
			selectedKeys: null
		};
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.currentId !== this.props.currentId)
		{
			this.setState({selectedKeys: [nextProps.currentId]})
		}
	}
	
	selectClick(selectedKeys)
	{
		this.setState({selectedKeys})
	}
	
	createGroup()
	{
		this.setState({display: true, model: AccountGroup.NEW_GROUP})
	}
	
	typeOk()
	{
		this.setState({display: false, link: true});
	}
	
	typeCancel()
	{
		this.setState({display: false, link: false})
	}
	
	getAddGroup(data)
	{
		const {model} = this.state;
		
		if(model === AccountGroup.NEW_GROUP)
		{
			this.props.addGroup(data)
		}
		else if(model == AccountGroup.EDIT_GROUP)
		{
			let editOldParentId = data.oldParentid;
			delete data.oldParentid;
			this.props.editorGroup(data, editOldParentId);
		}
	}
	
	removeClick()
	{
		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip',
			content: getLangTxt("del_content"),
			onOk: () => this.props.removeGroup(this.state.selectedKeys)
		});
		
	}
	
	_onGetListData(groupId)
	{
		let obj = {
			groupid: groupId,
			page: 1,
			size: 10
		};
		this.props.getCurrentGroup(groupId);
		this.props.getListData(obj);
		this.setState({selectedKeys: [groupId]});
	}
	
	_onRemoveGroup(groups, e)
	{
		e.stopPropagation();
		
		confirm({
			title: getLangTxt("del_tip"),
			width: '320px',
			iconType: 'exclamation-circle',
			className: 'warnTip',
			okText: getLangTxt("sure"),
			content: getLangTxt("setting_account_note1"),
			onOk: () => this.props.removeGroup(groups)
		});
	}
	
	_onEditGroup(item, e)
	{
		e.stopPropagation();
		
		this.setState({
			display: true,
			model: AccountGroup.EDIT_GROUP,
			info: item
		});
	}
	
	//账号分组排序 type: -1向上; 1向下;
	handleAccountGroupRange(type, groupid = "")
	{
		let {data = []} = this.props,
			rangeGroupIds = [groupid],
			changedItems = [];
		
		let index = data.findIndex(item => item.groupid === groupid);
		
		if(index === 0 && type === -1 || index === data.length - 1 && type === 1)
			return;
		
		let item = data[index],
			target = data[index + type];
		
		data.sort((a, b) => a.rank - b.rank);
		
		if(!changedItems.includes(item))
		{
			changedItems.push(item);
		}
		
		if(!changedItems.includes(target))
		{
			changedItems.push(target);
		}
		if(rangeGroupIds.length < 1)
			return;
		
		if(changedItems.length > 0)
			this.props.editorGroupRank(changedItems);
		
		this.setState({
			rangeDone: !this.state.rangeDone
		});
	}
	
	getContainerWidth(floor)
	{
		if(!getComputedStyle(window.document.documentElement)['font-size'])
			return;
		
		let htmlFontSizepx = getComputedStyle(window.document.documentElement)['font-size'],
			htmlFontSize = htmlFontSizepx.substring(0, htmlFontSizepx.length - 2),
			maxWidth = 1.95 * htmlFontSize;
		
		return floor > 1 ? maxWidth - 18 * floor - 54 : maxWidth - 18 * floor - 100;
	}
	
	_getGroupTile(item, groupid, level)
	{
		let boxWidth = this.getContainerWidth(level),
			contentInfo = truncateToPop(item.groupname, boxWidth) || {},
			className = level > 1 ? "accountGroupName" : "accountGroupName accountGroupPadding";
		
		return (
			<div className={className}>
				{
					contentInfo.show ?
						<Popover content={<div style={{
							maxWidth: "1.5rem", height: "auto", wordBreak: "break-word"
						}}>{item.groupname}</div>} placement="topLeft">
							<div className="accountName"
							     onClick={this._onGetListData.bind(this, groupid)}>{contentInfo.content}</div>
						</Popover>
						:
						<div className="accountName"
						     onClick={this._onGetListData.bind(this, groupid)}>{item.groupname}</div>
				}
				<span className="accountNameOperateBox">
                    <Tooltip placement="bottom" title={getLangTxt("move_up")}>
                        <i className="iconfont icon-shangyi rangeIcon"
                           onClick={this.handleAccountGroupRange.bind(this, -1, groupid)}/>
                    </Tooltip>
                    <Tooltip placement="bottom" title={getLangTxt("move_down")}>
                        <i className="iconfont icon-xiayi rangeIcon"
                           onClick={this.handleAccountGroupRange.bind(this, 1, groupid)}/>
                    </Tooltip>
                    <Tooltip placement="bottom" title={getLangTxt("edit")}>
                        <i className="iconfont icon-bianji"
                           onClick={this._onEditGroup.bind(this, item)}/>
                    </Tooltip>
                    <Tooltip placement="bottom" title={getLangTxt("del")}>
                        <i className="iconfont icon-shanchu"
                           onClick={this._onRemoveGroup.bind(this, groupid)}/>
                    </Tooltip>
				</span>
			</div>
		);
	}
	
	_createTreeNodes(data, level)
	{
		if(!data)
			return null;
		
		return data.map(
			item => {
				const {groupid} = item;
				return (
					<TreeNode key={groupid} title={this._getGroupTile(item, groupid, level + 1)}>
						{
							item.children && item.children.length > 0 ? this._createTreeNodes(item.children, level + 1) : null
						}
					</TreeNode>
				);
			}
		);
	}
	
	_createAccountPanel(data)
	{
		if(this.state.display)
		{
			const {info, model} = this.state;
			
			return (
				<CreateGroup info={info} model={model} groupInfo={data}
				             getAddGroup={this.getAddGroup.bind(this)}
				             typeOk={this.typeOk.bind(this)}
				             typeCancel={this.typeCancel.bind(this)}
				/>
			);
		}
		
		return null;
	}
	
	reFreshFn()
	{
		this.props.getAccountGroup();
	}
	
	_getProgressComp()
	{
		let {groupProgress} = this.props;
		if(groupProgress)
		{
			if(groupProgress.left === LoadProgressConst.LOAD_COMPLETE || groupProgress.left === LoadProgressConst.SAVING_SUCCESS)
				return;
			
			if(groupProgress.left === LoadProgressConst.LOADING || groupProgress.left === LoadProgressConst.SAVING)//正在加载或正在保存
			{
				return getProgressComp(groupProgress.left);
			}
			else if(groupProgress.left === LoadProgressConst.LOAD_FAILED)  //加载失败
			{
				return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;
			}
			else
			{
				let errorMsg = '', classname = '';
				if(groupProgress.left === LoadProgressConst.DUPLICATE)
				{
					errorMsg = getLangTxt("setting_account_note2");
					classname = 'warnTip';
					
				}
				else if(groupProgress.left === LoadProgressConst.SAVING_FAILED)
				{
					errorMsg = getLangTxt("20034");
					classname = 'errorTip';
				}
				else if(groupProgress.left === LoadProgressConst.UNDELETED)
				{
					errorMsg = getLangTxt("setting_account_note5");
					classname = 'errorTip';
				}
				else if(groupProgress.left === LoadProgressConst.LEVEL_EXCEED)
				{
					errorMsg = getLangTxt("setting_account_note3");
					classname = 'errorTip';
				}
				else if(groupProgress.left === LoadProgressConst.ACCOUNT_EXCEED)
				{
					errorMsg = getLangTxt("setting_account_note4");
					classname = 'errorTip';
				}
				
				this.props.clearErrorNewGroupProgress();
				
				warning({
					title: getLangTxt("err_tip"),
					iconType: 'exclamation-circle',
					className: classname,
					content: errorMsg,
					okText: getLangTxt("sure"),
					width: '320px'
				});
			}
		}
		
		return null;
	}
	
	scrollIng(value)
	{
		if(!value.topPosition)
		{
			value.topPosition = 0;
		}
	}
	
	render()
	{
		let {data, groupProgress, currentId} = this.props,
			{selectedKeys = ""} = this.state;
		
		return (
			<div style={{height: "100%"}}>
				<div className='tree-head'>
					<span>{getLangTxt("setting_account_group_info")}</span>
					<span className='tree-icon'>
                        {/*<i style={{cursor: "pointer"}} className="iconfont icon-sousuo"/>*/}
						{/*<i style={{cursor: "pointer"}} className="iconfont icon-shanchu"
                         onClick={this.removeClick.bind(this)}/>*/}
						<Tooltip placement="bottom" title={getLangTxt("add_group")}>
                            <i className="iconfont icon-tianjia1"
                               onClick={this.createGroup.bind(this)}/>
                        </Tooltip>
			        </span>
				</div>
				{
					this._createAccountPanel(data)
				}
				<div className='tree-con'>
					<ScrollArea
						speed={1} smoothScrolling
						horizontal={false}
						style={{height: "100%"}}
						onScroll={this.scrollIng.bind(this)}
					>
						<Tree
							className="myCls"
							selectedKeys={selectedKeys}
							/*checkable onCheck={this.selectClick.bind(this)}*/
						>
							{
								this._createTreeNodes(data, 0)
							}
						</Tree>
					</ScrollArea>
					{
						this._getProgressComp()
					}
				</div>
			</div>
		)
	}
}

function mapStateToProps(state)
{
	return {
		groupProgress: state.accountReducer.progress,
		data: state.accountReducer.data,
		state
	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({
		addGroup, editorGroup, removeGroup, getAccountGroup, clearErrorNewGroupProgress, editorGroupRank
	}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(AccountGroup);
