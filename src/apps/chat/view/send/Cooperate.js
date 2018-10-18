import React, { Component } from 'react'
import { Tabs, Tree, Select, Tooltip, Button, Input } from 'antd'
import { getAdminGroup, getUsersByGroupId, getShopGroupByGroupId } from '../../redux/reducers/cooperateReducer'
import ScrollArea from 'react-scrollbar'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { requestCooperate } from "../../redux/reducers/eventsReducer";
import CooperateData from "../../../../model/vo/CooperateData";
import { List, is, fromJS } from "immutable";
import { shallowEqual, loginUser, getLangTxt } from "../../../../utils/MyUtil";
import { getUserName } from "../../../../utils/ConverUtils";
import TreeNode from "../../../../components/antd2/tree/TreeNode";
import { distribute } from "../../../setting/distribution/action/distribute"
import "../style/cooperrate.scss";
import {getBindingShopGroup} from "../../../setting/consultBinding/reducer/consultBindingReducer";
import {loginUserProxy} from "../../../../utils/MyUtil";
import Modal from "../../../../components/xn/modal/Modal";

const TabPane = Tabs.TabPane,
    Option = Select.Option,
    Search = Input.Search;

class Cooperate extends Component {

	constructor(props)
	{
		super(props);

		this.state = {
			data: [{value: 'a1', text: 'a1'}, {value: 'a2', text: 'a2'}],
			value: '',
			visible: false,
			toUsers: [],
			checkedKeys: [],
			selectedKeys: [],
			tagInputInitVal: '行政组名称关键词搜索/ID'
		};
	}

	componentDidMount()
	{
        let {siteId} = loginUserProxy(),
            siteIdArr = siteId.split("_"),
            isShopUser = siteIdArr[0] !== "kf" && siteIdArr[1] !== "1000";

        if (isShopUser)
        {
            this.props.getShopGroupByGroupId(siteId);
        }else
        {
            this.props.getBindingShopGroup(4);
        }

		this.props.distribute("template");
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		return !is(nextProps.cooperate, this.props.cooperate) ||
			!shallowEqual(nextState, this.state) ||
			!shallowEqual(nextProps, this.props);
	}

	//弹出弹窗
	synergy(title)
	{
		this.props.getAdminGroup();

		this.setState({
			visible: true,
		});
	}

	//确定按钮
	transferOk()
	{
		this.setState({visible: false, checkedKeys: []});

		let toUsers = this.state.toUsers;

		if(toUsers.length <= 0)
			return;

		let labelData = this.props.item,
			coopType = labelData.get("name") === "transfer" ? CooperateData.TRANSFER_TYPE : CooperateData.INVITE_TYPE;

		this.props.requestCooperate(["", coopType, toUsers]);
	}

	//取消按钮
	transferCancel()
	{
		this.setState({visible: false, checkedKeys: []});
	}

	onCheck(checkedKeys, {checkedNodes})
	{
		let toUsers = checkedNodes.filter(node =>
		{
			return node.props.user;
		})
		.map(node => node.props.user.toObject());

		this.setState({toUsers, checkedKeys});
	}

	onSelect(selectedKeys, {selected, node})
	{
		let {user} = node.props;
		if(!user)
			return;

		if(selected)
		{
			if(typeof user.toJS === "function")
			{
				let value = user.toJS();
				value.type = 1;

				this.setState({selectedKeys, toUsers: [value]});
			}
		}
	}

	onBBCSelect(selectedKeys, {selected, node})
	{
		let {item} = node.props;

		if(!item)
			return;

		if(selected)
		{
			item.type = 2;
			item.siteId = item.siteid;

			this.setState({selectedKeys, toUsers: [item]});
		}
	}

    onShopSelect(selectedKeys, {selected, node})
    {
        let {item} = node.props;

        if(!item)
            return;

        if(selected)
        {
            item.type = 2;

            item.templateid = item.get("templateId");
            item.siteId = item.get("siteid");

            this.setState({selectedKeys, toUsers: [item]});
        }
    }

	//点击节点时触发
	_onExpand(expandedKeys, {expanded, node})
	{
		if(expanded && node)
		{
			this.props.getUsersByGroupId(node.props.eventKey);
		}
	}

    _onShopExpand(expandedKeys, {expanded, node})
    {
        let {shopDataRef, eventKey} = node.props;

        if(!shopDataRef)
            return;

        if(eventKey)
        {
            this.props.getShopGroupByGroupId(eventKey);
        }
    }

	//搜索
	_getSearch(value)
	{
		let cooperate = this.props.cooperate,
			groups = cooperate.get("groups") || List(),
			result = List();

		this.searchLoop(groups, value, result);

		this.setState({value, searchResult: result});
	}

	searchLoop(data, searchValue, result)
	{
		data.forEach(item => {
			let children = item.get("children"),
				hasGroupChildren = Boolean(children);

			if(hasGroupChildren)
			{
				this.searchLoop(item.get("children"), searchValue, result);
			}
			else
			{
				if(item.get("showname")
					.indexOf(searchValue) > -1)
				{
					result.push(item);
				}
			}
		});
	}

	getSelectOpts()
	{
		let {searchResult = []} = this.state;

		return searchResult.map(user => <Option key={user.get("userid")}>{user.get("username")}</Option>);
	}

	//生成组节点
	_loop(data)
	{
		if(data.size <= 0)
			return <TreeNode key="0" title={getLangTxt("noData1")} disabled/>;

		return data.map(item =>
			{
				let children = item.get("children") || List(),
					leafs = [],
					cooperate = this.props.cooperate,
					groupId = item.get("groupId"),
					users = cooperate.get(groupId) || fromJS([]);

				if(children.size <= 0)
				{
					leafs = this._loopUsers(groupId, users);
				}
				else if(users.size <= 0)
				{
					leafs = this._loop(item.get("children"));
				}
				else
				{
					leafs = this._loop(item.get("children"))
					.concat(this._loopUsers(groupId, users));
				}

				return <TreeNode key={item.get("groupId")} title={item.get("groupName")}>
					{
						leafs
					}
				</TreeNode>;
			}
		);
	}

	//生成客服子节点
	_loopUsers(groupId, users)
	{
		if(!users)
		{
			return <TreeNode key={groupId + "loading"} title={getLangTxt("loading")} disableCheckbox disabled/>;
		}

		users = users.filter(user => loginUser().userId !== user.get("userid"));  //过滤掉自己

		if(users.size > 0)
		{
			return users.map(user =>
			{
				let nickname = user.get("nickname"),
					showname = user.get("showname");

				return <TreeNode key={user.get("userid")} title={getUserName(nickname, showname)} user={user}/>;
			});
		}

		return <TreeNode key={groupId + "noData"} title={getLangTxt("user_offline")} disabled/>;
	}

	//生成行政组
	_getWeChatGroupTreeNode(treeData)
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
								this._getWeChatGroupTreeNode(item.children)
							}
						</TreeNode>
					);
				}

				return <TreeNode value={templateid} title={name} key={templateid} item={item}/>;
			});
		return <TreeNode value="groupid" title="未获取到行政组" disabled/>;
	}

	onTabChange(value)
	{
		let Name = '';
		switch(value)
		{
			case '1':
				Name = '行政组名称关键词搜索/ID'
				break;
			case '2':
				Name = '客服组名称关键词搜索/ID'
				break;
			case '3':
				Name = '商户名称关键词搜索/ID'
				break;
			default :
				return Name
		}
		this.setState({
			tagInputInitVal: Name,
            isSearch: false,
		})
	}

    getShopUserNode(shopUserArr, siteid)
    {
        if (shopUserArr.size > 0)
            return shopUserArr.map(item => {
                return (
                    <TreeNode title={item.get("templateName")}
                        key={item.get("templateId")} value={item.get("templateId")}
                        item={item} isLeaf={true}
                    >
                    </TreeNode>
                );
            });

        return <TreeNode key={siteid + "noData"} title={getLangTxt("user_offline")} disabled/>;
    }

    getTreeUserNodes(userArray = [])
    {
        let {cooperate} = this.props,
            shopUser;

        return userArray.map(item => {
            item.children = [];

            let{name, siteid, children} = item;

            shopUser = cooperate.get(siteid) || fromJS([]);

            return (
                <TreeNode title={name}
                    key={siteid} value={siteid}
                    shopDataRef={item} isLeaf={false}
                >
                    {
                        this.getTreeUserNodes(children)
                    }
                    {
                        this.getShopUserNode(shopUser, siteid)
                    }
                </TreeNode>
            );
        });
    }

    //获取分组下商铺
    renderTreeNodes(dataArray)
    {
        return dataArray.map(item => {
            return (
                <TreeNode title={item.groupname}
                    key={item.groupid} value={item.groupid}
                    dataRef={item}
                >
                    {
                        this.renderTreeNodes(item.children)
                    }
                    {
                        this.getTreeUserNodes(item.merchants)
                    }
                </TreeNode>
            );
        });
    }

    renderShopUserNodes()
    {
        let {siteId} = loginUserProxy(),
            {cooperate} = this.props,
            shopUsers = cooperate.get(siteId) || fromJS([]);
            return this.getShopUserNode(shopUsers, siteId);
    }

    //获取分组下商铺
    renderSearchTreeNodes(dataArray)
    {
        return this.getTreeUserNodes(this.shopSearchList);
    }

    get shopGroupTreeData()
    {
        let {consultBinding} = this.props;

        return consultBinding.get("consultBindingShop") || [];
    }

    get shopSearchList()
    {
        let {shopData} = this.props;

        return shopData.get("shopItemList") || []
    }

	render()
	{
		let {flag, groupData} = this.props,
			{tagInputInitVal, isSearch} = this.state,
			labelData = this.props.item,
			cooperate = this.props.cooperate,
			groups = cooperate.get("groups") || List(),
			disabled = !this.state.selectedKeys || this.state.selectedKeys.length <= 0,
			transferFlag = flag == 'transfer', //转接
			inviteFlag = flag == 'invite',  //邀请
            {siteId} = loginUserProxy(),
            siteIdArr = siteId.split("_"),
            isShopUser = siteIdArr[0] !== "kf" && siteIdArr[1] !== "1000",
            transTitle = isShopUser ? "平台" : "商户";

		return (
			<div>
				<div onClick={this.synergy.bind(this)}>
					<Tooltip placement="bottom" title={labelData.get("title")}
                        overlayStyle={{lineHeight: '0.16rem'}}
					         arrowPointAtCenter>
						<i className={ this.props.propsClassName }/>
					</Tooltip>
				</div>
				{
					this.state.visible ? (
						<Modal title={labelData.get("title")} visible onCancel={this.transferCancel.bind(this)}
						         width={524} okText={getLangTxt("sure")} cancelText={getLangTxt("cancel")} wrapClassName="modalCommonStyle cooperateModal"
						         footer={[
							         <Button key="cancel" size="large" onClick={this.transferCancel.bind(this)}>
								         {getLangTxt("cancel")}
							         </Button>,
							         <Button key="ok" type="primary" size="large" disabled={disabled}
							                 onClick={this.transferOk.bind(this)}>
								         {getLangTxt("sure")}
							         </Button>
						         ]}>

								<Tabs onChange={this.onTabChange.bind(this)} className="cooperateTabs">
									<TabPane tab="行政组" key="1">
										{
											transferFlag ?
												<Search
													placeholder={tagInputInitVal}
													onSearch={value => console.log(value)}
													enterButton
												/>
												: null
										}
                                        <ScrollArea className="cooperateScroll" speed={1} style={{height: '3.44rem'}} smoothScrolling>
                                            <Tree selectedKeys={this.state.selectedKeys}
                                                  onExpand={this._onExpand.bind(this)}
                                                  onSelect={this.onSelect.bind(this)}>
                                                {
                                                    this._loop(groups)
                                                }
                                            </Tree>
                                        </ScrollArea>

                                    </TabPane>
									<TabPane tab="客服组" key="2">
										{
											transferFlag ?
												<Search
													placeholder={tagInputInitVal}
													onSearch={value => console.log(value)}
													enterButton
												/>
												: null
										}
                                        <ScrollArea className="cooperateScroll" speed={1} style={{height: '3.44rem'}} smoothScrolling>
                                            <Tree selectedKeys={this.state.selectedKeys}
                                                  onSelect={this.onBBCSelect.bind(this)}>
                                                {
                                                    this._getWeChatGroupTreeNode(groupData)
                                                }
                                            </Tree>
                                        </ScrollArea>
									</TabPane>
                                    {
                                        /*<TabPane tab={transTitle} key="3">
                                         <ScrollArea className="cooperateScroll" speed={1} style={{height: '3.44rem'}} smoothScrolling>
                                         <Tree
                                         onExpand={this._onShopExpand.bind(this)}
                                         onSelect={this.onShopSelect.bind(this)}
                                         selectedKeys={this.state.selectedKeys}
                                         >
                                         {
                                         !isShopUser ?
                                         this.renderTreeNodes(this.shopGroupTreeData) :
                                         this.renderShopUserNodes()
                                         }
                                         </Tree>
                                         </ScrollArea>
                                         </TabPane>*/
                                    }

								</Tabs>
						</Modal>
					) : null
				}
			</div>
		)
	}
}

function mapStateToProps(state)
{
	let {distributeReducer} = state;
	return {
		cooperate: state.cooperateReducer,
		groupData: distributeReducer.data || [],
        consultBinding: state.consultBindingReducer,
        shopData: state.shopAccountReducer

	};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getAdminGroup, getUsersByGroupId, requestCooperate, distribute, getBindingShopGroup, getShopGroupByGroupId}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(Cooperate);
