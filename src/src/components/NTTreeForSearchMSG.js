import React from 'react';
import { Tree } from 'antd';
import { omit } from "../utils/MyUtil";
import TreeNode from "./antd2/tree/TreeNode";

/**
 * example:
 *
 *
 * */
//<NTTreeForSearch/>

class NTTreeForSearch extends React.PureComponent {

	static defaultProps = {groupInfo: {}, itemInfo: {}, containGroupKeys: false};

	constructor(props)
	{
		super(props);

		this.state = {checkedKeys: []};
		this._groupCheckedkeys = [];
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
		let {itemName} = this.props.itemInfo;

		return itemName || "itemname";
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

	/*责任客服 组*/
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
				let index = this._groupCheckedkeys.findIndex(value => value === groupid),
					leafs = children.map(item => item[this.itemIdKey]);

				if(leafs.length && index > -1)
				{
					this._groupCheckedkeys.splice(index, 1);

					leafs.forEach(this.updateCheckedKeys.bind(this, true, this.state.checkedKeys));

					this.updateCheckedKeys(true, this.state.checkedKeys, groupid);

					this.state.checkedKeys = [...this.state.checkedKeys];
				}

				return (
					children.length <= 0 ?
						<TreeNode key={groupid} title={title} value={groupid} data={item} isGroup>
							<TreeNode key={groupid + "_"} title={"无"} disableCheckbox={true}/>
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
		let {data = [], eventKey, isGroup} = node.props,
			children = data && data[this.childrenKey] || [],
			checkedKeys1 = this.state.checkedKeys;

		if(isGroup)
		{
			children = children.map(item => item[this.itemIdKey]);

			if(children.length)
			{
				children.forEach(this.updateCheckedKeys.bind(this, checked, checkedKeys1))
				this.updateCheckedKeys(checked, checkedKeys1, eventKey);
				this.setState({checkedKeys: [...this.state.checkedKeys]});
			}
			else
			{
				if(!this._groupCheckedkeys.includes(eventKey))
				{
					this._groupCheckedkeys.push(eventKey);
				}

				this.loadDataFn(eventKey);
			}
		}
        else
        {
            this.updateCheckedKeys(checked, checkedKeys, eventKey);

            if(!('checkedKeys' in this.props))
            {
                this.setState({checkedKeys});
            }
        }

        this.refreshSearch();
	}

	updateCheckedKeys(checked, checkedKeys, key)
	{
		if(!key)
			return;

		let index = checkedKeys.findIndex(value => value === key);

		if(index > -1)
		{
			(!checked) && checkedKeys.splice(index, 1);
		}
		else
		{
			checked && checkedKeys.push(key);
		}
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

	refreshSearch(checkedKeys)
	{
		let {searchFn, containGroupKeys, treeData} = this.props;

		if(typeof searchFn === "function")
		{
			if(!containGroupKeys)
			{
				let {checkedKeys} = this.state,
					searchKeys = [...checkedKeys];

				this.filterGroupId(treeData, searchKeys);
				searchFn(searchKeys);
			}
		}
	}

	filterGroupId(data, searchKeys)
	{
		if(!data || !Array.isArray(data))
			return;

		data.forEach(item =>
		{
			let isGroup = item.hasOwnProperty(this.childrenKey);

			if(isGroup)
			{
				const groupid = item[this.groupIdKey],
					children = item[this.childrenKey],
					index = searchKeys.findIndex(value => value === groupid);

				if(index > -1)
				{
					searchKeys.splice(index, 1);
					this.filterGroupId(children, searchKeys);
				}
			}
		});
	}

	render()
	{
		const {keyProps, title, treeData} = this.props,
			treeNodesComp = this.getTreeNodesComp(treeData);

		this.refreshSearch();

		return (
			<Tree checkable multiple checkedKeys={this.state.checkedKeys}
			      onCheck={this.onCheck.bind(this)} onExpand={this.onExpand.bind(this)} {...omit(this.props, omitArr)}>
				<TreeNode key={keyProps} title={title}>
					{
						treeNodesComp
					}
				</TreeNode>
			</Tree>
		);
	}
}

const omitArr = ["groupInfo", "itemInfo", "treeData", "loadDataFn", "searchFn",
    "containGroupKeys", "groupTitleFn", "itemTitleFn", "checkedKeys"];

export default NTTreeForSearch;
