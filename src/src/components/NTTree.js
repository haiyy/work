import React from 'react';
import { Tree } from 'antd';
import { shallowEqual, omit } from "../utils/MyUtil";
import TreeNode from "./antd2/tree/TreeNode";

class NTTree extends React.PureComponent {
	
	static defaultProps = {groupInfo: {}, itemInfo: {}, containGroupKeys: false};
	
	constructor(props)
	{
		super(props);
	}
	
	shouldComponentUpdate(nextProps)
	{
		const {treeData, ...other} = nextProps;
		
		if(treeData && treeData.length === 0)
			return false;
		
		return !shallowEqual(other, omit(this.props, ["treeData"]));
	}
	
	get childrenKey()
	{
		let {children} = this.props.groupInfo;
		
		return children || "children";
	}
	
	get groupIdKey()
	{
		let {groupid} = this.props.groupInfo;
		
		return groupid || "groupid";
	}
	
	get groupNameKey()
	{
		let {groupname} = this.props.groupInfo;
		
		return groupname || "groupname";
	}
	
	get itemIdKey()
	{
		let {itemid} = this.props.itemInfo;
		
		return itemid || "itemid";
	}
	
	get itemNameKey()
	{
		let {itemname} = this.props.itemInfo;
		
		return itemname || "itemname";
	}
	
	get itemTitleFn()
	{
		let {itemTitleFn} = this.props;
		
		if(typeof itemTitleFn === "function")
		{
			return itemTitleFn;
		}
		
		return (item) => item[this.itemNameKey] || item[this.itemId];
	}
	
	get groupTitleFn()
	{
		let {groupTitleFn} = this.props;
		
		if(typeof groupTitleFn === "function")
		{
			return groupTitleFn;
		}
		
		return (item) => item[this.groupNameKey] || item[this.groupIdKey];
	}
	
	get loadDataFn()
	{
		let {loadDataFn} = this.props;
		
		if(typeof loadDataFn === "function")
		{
			return loadDataFn;
		}
		
		return () =>
		{
		};
	}
	
	getTreeNodesComp(data, gid)
	{
		if(!data || !Array.isArray(data))
			return <TreeNode key={gid + "_"} title={"无"} disableCheckbox={true}/>;
		
		return data.map(item =>
		{
			let isGroup = item.hasOwnProperty(this.childrenKey);
			
			const groupid = item[this.groupIdKey],
				title = this.groupTitleFn(item),
				children = item[this.childrenKey];
			
			if(isGroup)
			{
				return (
					children.length <= 0 ?
						<TreeNode key={groupid} title={title} value={groupid} data={item} isGroup>
							<TreeNode key={groupid + "^$_$^"} title={"无"}/>
						</TreeNode>
						:
						<TreeNode key={groupid} title={title} value={groupid} data={item} isGroup>
							{
								this.getTreeNodesComp(children, groupid)
							}
						</TreeNode>
				);
			}
			
			return this.getLeafsComp(item);
		});
	}
	
	/*责任客服 具体客服*/
	getLeafsComp(item)
	{
		const itemId = item[this.itemIdKey],
			title = this.itemTitleFn(item);
		
		return <TreeNode key={itemId} title={title} value={itemId} data={item}/>;
	}
	
	onCheck(checkedKeys, {node, checked})
	{
	
	}
	
	onExpand(expandedKeys, {node})
	{
		let {keyProps} = this.props,
			{eventKey = "", data = []} = node.props;
		
		if(!data.length)
		{
			this.loadDataFn(eventKey === keyProps ? "" : eventKey);
		}
	}
	
	afterReturnFn()
	{
	
	}
	
	render()
	{
		const {keyProps, title, treeData} = this.props,
			treeNodesComp = this.getTreeNodesComp(treeData);
		
		this.afterReturnFn();
		
		return (
			<Tree checkable multiple checkedKeys={this.state.checkedKeys}
			      onCheck={this.onCheck.bind(this)} onExpand={this.onExpand.bind(this)}>
				<TreeNode key={keyProps} title={title}>
					{
						treeNodesComp
					}
				</TreeNode>
			</Tree>
		);
	}
}

export default NTTree;
