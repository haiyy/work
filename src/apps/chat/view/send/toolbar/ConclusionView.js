import React from 'react'
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Map } from "immutable";
import { Button, Icon, Checkbox, Tree, Input, Row, Col, Popover, Select, Tag } from 'antd';
import HistoryList from "../../../../../components/HistoryList";
//import '../../../../../public/styles/enterpriseSetting/summary.scss';
import { formatTimestamp, getDataFromResult, getLoadData } from "../../../../../utils/MyUtil";
import { getConverHistory, getConverList, clearData } from "../../../../record/redux/historyListReducer";
import { substr, truncateToPop, bglen } from "../../../../../utils/StringUtils";
import Settings from "../../../../../utils/Settings";
import TreeNode from "../../../../../components/antd2/tree/TreeNode";

const CheckboxGroup = Checkbox.Group,
	Option = Select.Option;

let lastMenuNodes = {};

const scrollConfig = {
	speed: 1,
	className: "chatsummary_tree_wrapper",
	contentClassName: "content",
	smoothScrolling: true,
	horizontal: false
};

class ConclusionView extends React.PureComponent {

	constructor(props)
	{
		super(props);

		this.clear();//初始化state

		this.state.userName = "";

		this.onExpand = this.onExpand.bind(this);

		let {converId, rosterUser = {}} = props;

		/*if(!this.state.selectedKeys.length)
		{*/
		this.getSummariesData(converId);

		this.loadData(rosterUser.userId, converId);
		/*}*/
	}

	componentWillReceiveProps(nextProps)
	{
		let {converId, rosterUser} = nextProps;

		if(rosterUser && this.props.rosterUser && rosterUser.userId !== this.props.rosterUser.userId)
		{
			this.clear();

			this.loadData(rosterUser.userId, converId);
		}

		if(converId !== this.props.converId)
		{
			this.getSummariesData(converId);
		}

	}

    componentDidUpdate()
    {
        let {summaryHeight} = this.state,
            summaryComp = this.refs.conclusionSelected,
            sumHei = summaryComp && summaryComp.clientHeight;

        if (summaryHeight != sumHei)
            this.setState({summaryHeight: sumHei});
    }

	getSummariesData(converId)
	{
		if(this.props.getSummariesData)
		{
			this.props.getSummariesData.call(this, converId);
			return;
		}

		if(!converId)
			return;

		getLoadData(Settings.getSummariesUrl(converId))
		.then(getDataFromResult)
		.then(info => {
			if(info && info.summarizes && info.summarizes.length > 0)
			{
				info.summarizes.length && this.setState({selectedKeys: info.summarizes});
			}
		})
	}

	loadData(userId, sessionId)
	{
		if(userId)
		{
			this.props.getConverHistory(sessionId);
			this.props.getConverList(userId);
		}
		else
		{
			//this.props.clearData();
		}
	}

	getUserListOptions()
	{
		let {rosterUser} = this.props,
			{userId, userName} = rosterUser || {};

		if(!userId)
			return null;

		return <Option key={userId}>
			{
				userName
			}
		</Option>;
	}

	getConverList()
	{
		let {history = Map()} = this.props,
			converList = history.get("converList") || [];

		if(Array.isArray(converList))
			return converList.map(converData => {
				let {converid, type, starttime} = converData,
					title = type === 1 ? "会话" : "留言",
					startTimeStr = formatTimestamp(starttime * 1000, true);

				return (
					<Option key={converid}>
						{title + " " + startTimeStr}
					</Option>
				);
			});
	}

	getContainerWidth()
	{
		if(!getComputedStyle(window.document.documentElement)['font-size'])
			return;

		let htmlFontSizepx = getComputedStyle(window.document.documentElement)['font-size'],
			htmlFontSize = htmlFontSizepx.substring(0, htmlFontSizepx.length - 2),
			maxWidth = 6.48 * htmlFontSize;

		return maxWidth * 0.573;
	}

	//您已选择标签项
	getSelectedItemLabel()
	{
		let selectedItems = null,
			{selectedKeys, leafs = []} = this.state,
			containMaxWidth,
			contentInfo;

		if(selectedKeys && selectedKeys.length > 0)
		{
			selectedItems = selectedKeys.map(key => {
				const item = leafs.find(value => value.summaryid === key);

				if(!item)
					return null;

				let content = item.allName || item.content,
					isTooLong = bglen(content) > 64,
					tagProps = {
						"data-index": key
					};

				containMaxWidth = this.getContainerWidth();
				contentInfo = truncateToPop(content, containMaxWidth) || {};

				if(contentInfo.show)
				{
					let popContent = (
						<div style={{
							maxWidth: '360px', height: 'auto', wordWrap: 'break-word'
						}}>{content}</div>
					);

					return (
						<Popover content={popContent} placement="topLeft">
							<Tag closable {...tagProps} onClose={this.deleteSelectedKeys.bind(this)} key={key}>
								{contentInfo.content}
							</Tag>
						</Popover>
					);
				}

				return (
					<Tag closable {...tagProps} onClose={this.deleteSelectedKeys.bind(this)} key={key}>
						{content}
					</Tag>
				);
			})
		}

        return (
            <div ref="conclusionSelected" className="chatsummary_tree_selected_items_wrapper">
                {
                    selectedItems
                }
            </div>
        );
	}

	deleteSelectedKeys(e)
	{
		let id = e.target.parentNode.getAttribute('data-index'),
			selectedKeys = [...this.state.selectedKeys];

		for(let i = 0, l = selectedKeys.length; i < l; i++)
		{
			if(selectedKeys[i] === id)
			{
				selectedKeys.splice(i, 1);
				break;
			}
		}

		this.setState({selectedKeys});
	}

	getSummaryLeafs()
	{
		let formatLeafs = [], summaryLeafs = null, defaultValues = [];

		let {leafs: propleafs, selectedKeys} = this.state,
			len = selectedKeys.length;

		if(propleafs && propleafs.length > 0)
		{
			propleafs.forEach(leaf => {
				let formatLeaf = {},
					id = leaf.summaryid,
					selected = this.isLeafSelected(id),
					style = {};

				if(leaf.search === 1)
				{
					style.color = '#f50';
				}

				formatLeaf.label = bglen(leaf.content) > 12 ?
					<Popover content={<div
						style={{
							maxWidth: '200px', height: 'auto', wordWrap: 'break-word'
						}}>{leaf.content}</div>}
					         placement="topLeft">
						<span style={style}>{substr(leaf.content, 6) + '...'}</span>
					</Popover>
					:
					<span style={style}>{leaf.content}</span>;

				formatLeaf.value = id;
				//formatLeaf.disabled = len >= 3 && !selected;

				formatLeafs.push(formatLeaf);

				if(this.isLeafSelected(id))
				{
					defaultValues.push(id);
				}
			});

			summaryLeafs = <CheckboxGroup onChange={this.changeSelectedKeys.bind(this)} options={formatLeafs}
			                              value={defaultValues}/>;
		}

		return (
			<div className="chatsummary_tree_leafs_wrapper">
				{
					summaryLeafs
				}
			</div>
		);
	}

	changeSelectedKeys(checkedValues)
	{
		this.setState({selectedKeys: checkedValues});
	}

	//左侧组树状列表
	getSummaryGroupNode(data, parentName)
	{
		if(!data)
			return null;

		let {expandedKeys, groupSelectedKeys, selectedKeys} = this.state,
			nodes = data.map(item => {
				let {summaryid: id, content: title, type} = item,
					searchCount = 0,
					allName = title;

				if(type !== 1) //type === 1 为组
					return null;

				if(parentName)
					allName = parentName + "-" + allName;

				if(item.children && item.children.length > 0)
				{
					//-------------------------update lastMenuNodes------------------------
					lastMenuNodes[item.summaryid] = item.children.filter(value => {
						//搜索结果处理
						if(this.state.searchValue && value.content.search(this.state.searchValue) > -1)
						{
							searchCount++;

							if(value.search !== 1)
							{
								let path = parentPath(this.props.summaryAll, item.summaryid);

								path.forEach(id => !expandedKeys.includes(id) && expandedKeys.push(id))
							}

							value.search = 1;
						}
						else
						{
							value.search = 0;
						}

						if(selectedKeys.includes(value.summaryid))
						{
							if(!groupSelectedKeys.includes(id))
							{
								groupSelectedKeys.push(id)
							}

							this.dealSelect(groupSelectedKeys, id, true);
						}

						if(value.type === 0)
						{
							value.parentid = id;
							value.allName = `${allName}-${value.content}`;

							return true;
						}

						return false;
					});

					//-------------------------update lastMenuNodes END------------------------

					let parentNodes = item.children.filter(value => value.type === 1);

					if(searchCount)
					{
						title = <span style={{color: '#f50'}}>{title}</span>;
					}

					if(parentNodes.length > 0)
					{
						return (
							<TreeNode key={id}
							          title={<span className="chatSummaryTreeNodeTitle"> {title} </span>}
							          summaryId={id}>
								{
									this.getSummaryGroupNode(parentNodes, allName)
								}
							</TreeNode>
						);
					}
				}

				return (
					<TreeNode key={id} title={<span className="chatSummaryTreeNodeTitle"> {title} </span>}
					          summaryId={id}/>
				);
			});

		return nodes.filter(item => Boolean(item));
	}

	dealSelect(selectedKeys, summaryId, selected)
	{
		let summaryLeafs = [],
			nodes = lastMenuNodes[summaryId];

		//咨询总结取消组时， 已选中项被取消
		if(!selected && nodes)
		{
			let keys = this.state.selectedKeys || [];

			nodes.forEach(value => {
				let index = keys.findIndex(id => id === value.summaryid);
				index > -1 && keys.splice(index, 1);
			});
		}

		if(selectedKeys && selectedKeys.length > 0)
		{
			selectedKeys.forEach((key) => {
				if(lastMenuNodes[key])
				{
					summaryLeafs = summaryLeafs.concat(lastMenuNodes[key]);
				}
			});
		}

		this.state.leafs = summaryLeafs;
	}

	isLeafSelected(id)
	{
		let {selectedKeys = []} = this.state;

		for(let i = 0, l = selectedKeys.length; i < l; i++)
		{
			if(id === this.state.selectedKeys[i])
			{
				return true;
			}
		}

		return false;
	}

	onGroupSelected(selectedKeys, {node, selected})
	{
		let// {leafs} = this.state,
			{summaryId} = node.props;

		this.dealSelect(selectedKeys, summaryId, selected);
		this.setState({groupSelectedKeys: selectedKeys});

		/*if(Array.isArray(leafs) && leafs.length > 0)
		{
			this.setState({groupSelectedKeys: selectedKeys});
		}
		else
		{


			this.setState({groupSelectedKeys: selectedKeys});
		}*/
	}

	onChange(e)
	{
		this.setState({
			searchValue: e.target.value
		});
	}

	getSelectedDefaultValue()
	{
		let {history = Map(), converId} = this.props,
			converList = history.get("converList") || [];

		if(!converId || !converList || converList.length <= 0 || !Array.isArray(converList))
			return "";

		let index = converList.findIndex(data => data.converid === converId);

		if(index > 0)
			return converId;

		return converList[0].converid;
	}

	getSubmitInfo()
	{
		var summaryData = [];
		for(var i = 0, l = this.state.selectedKeys.length; i < l; i++)
		{
			var key = this.state.selectedKeys[i];
			for(var m = 0, n = this.state.leafs.length; m < n; m++)
			{
				if(this.state.leafs[m].summaryid === key)
				{
					summaryData.push({id: key, content: this.state.leafs[m].content});
					break;
				}
			}
		}

		return {summary: summaryData, remark: this.state.remark};
	}

	onSelect(value)
	{
		if(value)
			this.props.getConverHistory(value);
	}

	onExpand(expandedKeys)
	{
		this.setState({
			expandedKeys,
			autoExpandParent: false
		});
	}

	clear(forceUpdate = false)
	{
		if(forceUpdate)
		{
			this.setState({
				selectedKeys: [],
				leafs: [],
				searchValue: "",
				groupSelectedKeys: [],
				expandedKeys: [],
				remark: ""
			});
		}
		else
		{
			this.state = {
				selectedKeys: [],
				leafs: [],
				searchValue: "",
				groupSelectedKeys: [],
				expandedKeys: [],
				remark: ""
			}
		}
	}

	onRemarkChange({target: {value}})
	{
		let remark = this.state.remark;
		if(bglen(value) <= 140)
		{
			remark = value;
		}
		this.setState({remark});
	}

	getHistoryView(historyHide, userId, historyArr)
	{
		if(historyHide)
			return null;

		return (
			<Col span={10} style={{paddingRight: '0.14rem'}}>
				<div className="leftSelectedDiv">您已选择</div>
				<Select style={{width: '2.32rem'}} value={userId}>
					{
						this.getUserListOptions()
					}
				</Select>

				<div className="leftDialogDiv">会话列表</div>
				<Select style={{width: '2.32rem', marginBottom: '0.169rem'}} onSelect={this.onSelect.bind(this)}
				        value={this.getSelectedDefaultValue()}>
					{
						this.getConverList()
					}
				</Select>

				<ScrollArea speed={1} horizontal={false} className="chatSummaryScrollArea"
				            style={{height: '2.25rem'}} smoothScrolling>
					<HistoryList historyArr={historyArr}/>
				</ScrollArea>
			</Col>
		);
	}

    isExpandSummaryList()
    {
        let {isExpand} = this.state;

        this.setState({isExpand: !isExpand})
    }

	render()
	{
		let summaryGroupNode = this.getSummaryGroupNode(this.props.summaryAll, ""),
			{expandedKeys, groupSelectedKeys, isExpand, selectedKeys = [], summaryHeight} = this.state,
			{history = Map(), historyHide} = this.props,
			historyArr = history.get("history") || [],
			{rosterUser} = this.props,
			{userId} = rosterUser || {},
            expandName = isExpand ? "收起" : "展开",
            selectedSummaryCls = isExpand ? "conclusionSelected selectedSummaryPage" : "conclusionSelected unExpandPage",
            isShowExBtn = summaryHeight > 30 ;

		this.props.getResult(this.getSubmitInfo());

		return (
			<div className="chatsummary">
				<Row>
					{
						this.getHistoryView(historyHide, userId, historyArr)
					}
					<Col span={14}>
						<Row>
                            <div className="summaryCheckedTitle">您已选择</div>
                            {
                                isShowExBtn ? <div className="isExpandSummary" onClick={this.isExpandSummaryList.bind(this)}>{expandName}</div> : null
                            }

                        </Row>
                        {
                            selectedKeys.length ? <Row className={selectedSummaryCls}>
                                {
                                    this.getSelectedItemLabel()
                                }
                            </Row> : null
                        }


						<Row className="searchInput">
							<Input placeholder="请输入关键字" onChange={this.onChange.bind(this)}/>
							<i className="icon-sousuo iconfont"/>
						</Row>

						<Row className="chatsummaryContent">
							<Col span={9}>
								<ScrollArea className="chatsummary_tree_wrapper" {...scrollConfig} smoothScrolling>
									<Tree multiple onSelect={this.onGroupSelected.bind(this)}
									      expandedKeys={expandedKeys}
									      selectedKeys={groupSelectedKeys}
									      onExpand={this.onExpand}
									      autoExpandParent={this.state.autoExpandParent}>
										{
											summaryGroupNode
										}
									</Tree>
								</ScrollArea>
							</Col>
							<Col span={15}>
								<ScrollArea className="chatsummary_tree_wrapper" {...scrollConfig} smoothScrolling>
									{
										this.getSummaryLeafs()
									}
								</ScrollArea>
							</Col>
						</Row>

						<Row className="chatSummaryRemark">
							<Input ref="remark" type="textarea" placeholder="备注" rows={6}
							       onChange={this.onRemarkChange.bind(this)} value={this.state.remark}/>
							<span className="CallOut-num">{bglen(this.state.remark)}/140</span>
						</Row>
					</Col>
				</Row>
			</div>
		);
	}
}

function parentPath(group, id)
{
	let item = findItem(group, id), path = [id];

	if(item && item.parentid)
	{
		path.push(...parentPath(group, item.parentid));
	}

	return path;
}

function findItem(group, id)
{
	let titem;

	for(let i = 0; i < group.length; i++)
	{
		if(group[i].summaryid === id)
		{
			return group[i];
		}
		else
		{
			if(group[i].children && group[i].children.length > 0)
			{
				titem = findItem(group[i].children, id);
			}
		}
	}

	return titem;
}

function mapStateToProps(state)
{
	let {summaryReducer = {}} = state,
		{chatSummaryAll} = summaryReducer;

	return {history: state.historyListReducer || Map(), summaryAll: chatSummaryAll};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getConverHistory, getConverList, clearData}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps, null, {withRef: true})(ConclusionView);
