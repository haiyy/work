import React from 'react';
import { omit } from "../utils/MyUtil";
import TreeSelect from "../apps/public/TreeSelect";
import TreeNode from "./antd2/tree/TreeNode";

/**
 * example:
 *<NTTreeForSearch keyProps="" title="" treeData={[]}
 groupInfo={ {children: "children", groupid: "groupid", groupname: "groupname"}}
 itemInfo={ {itemid: "itemid", itemname: "itemname"}}
 itemTitleFn="function(item:Object)" //非必填
 groupTitleFn="function(group:Object)" //非必填
 loadDataFn="function(groupid:String)"  //非必填 异步加载数据
 searchFn="function(searchKeys:Array)"
 containGroupKeys=false/> //非必填 是否包含父级Key值
 * */

class NtTreeForSelect extends React.PureComponent {

	static defaultProps = {groupInfo: {}, itemInfo: {}, containGroupKeys: false};

	constructor(props)
	{
		super(props);

		this.state = {checkedKeys: []};
		this._groupCheckedkeys = [];
		this.refreshSearch = this.refreshSearch.bind(this);
	}

    /*shouldComponentUpdate(nextProps) {
        const {treeData} = nextProps;

        if (treeData && treeData.length === 0)
            return false;

        return ((nextProps.checkedKeys.length > 0 || this.props.checkedKeys.length > 0)
            && nextProps.checkedKeys !== this.props.checkedKeys)
            || nextProps.treeData !== this.props.treeData;
    }*/

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

		return () => {
		};
	}

	getTreeNodesComp(data, gid)
	{

		let {selectedValue = []} = this.props;

		if(!data || !Array.isArray(data))
			return <TreeNode key={gid + "_"} title={"无"} isLeaf/>;

		return data.map(item => {
			let isGroup = item.hasOwnProperty(this.childrenKey);

			const groupid = item[this.groupIdKey],
				title = this.groupTitleFn(item),
				children = item[this.childrenKey];

			if(isGroup)
			{
				let index = this._groupCheckedkeys.findIndex(value => value === groupid),
					leafs = children.filter(item => item[this.itemIdKey])
					.map(item => item[this.itemIdKey]);

				if(leafs.length && index > -1)
				{
					let checkedKeys = [...this.state.checkedKeys];
					this._groupCheckedkeys.splice(index, 1);

					leafs.forEach(this.updateCheckedKeys.bind(this, true, checkedKeys));

					this.updateCheckedKeys(true, checkedKeys, groupid);

					this.state.checkedKeys = checkedKeys;

					this.refreshSearch();
				}

				return (
					children.length <= 0 ?
						<TreeNode key={groupid} title={title} value={groupid} data={item} isGroup disableCheckbox
						          disabled={selectedValue.includes(groupid)}>
							<TreeNode key={groupid + "^$_$^"} title={"无"} isLeaf/>
						</TreeNode>
						:
						<TreeNode key={groupid} title={title} value={groupid} data={item} isGroup disableCheckbox>
							{
								//selectedValue.includes(groupid) &&
								this.getTreeNodesComp(children, groupid)
							}
						</TreeNode>
				);
			}

			return this.getLeafsComp(item, selectedValue);
		});
	}

	isContainGroup(data)
	{
		return data.findIndex(item => item.hasOwnProperty(this.childrenKey)) > -1;
	}

	/*责任客服 具体客服*/
	getLeafsComp(item, selectedValue)
	{
		const itemId = item[this.itemIdKey],
			title = this.itemTitleFn(item);

		return <TreeNode key={itemId} title={title} value={itemId} data={item} isLeaf
		                 disabled={selectedValue.includes(itemId)}/>;
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

	onExpand(node)
	{
		let {eventKey = "", data = []} = node.props;

		if(!data.length)
		{
			this.loadDataFn(eventKey);
		}

		return new Promise((resolve) => {
			resolve();
			return;
		});
	}

	refreshSearch()
	{
		let {searchFn, containGroupKeys, treeData} = this.props,
			treeSelectedData = [];

		if(typeof searchFn === "function")
		{
			let {checkedKeys} = this.state,
				searchKeys = [...checkedKeys];

			if(!containGroupKeys)
			{
				searchKeys = searchKeys.filter(key => key && (key.indexOf("^$_$^") === -1));

				this.filterGroupId(treeData, searchKeys, treeSelectedData);
			}

			searchFn(searchKeys, treeSelectedData);
		}
	}

	filterGroupId(data, searchKeys, treeSelectedData)
	{
		if(!data || !Array.isArray(data) || !treeSelectedData)
			return;

		data.forEach(item => {
			let isGroup = item.hasOwnProperty(this.childrenKey),
				groupid = item[this.groupIdKey],
				itemid = item[this.itemIdKey],
				index = searchKeys.findIndex(value => value === groupid);

			if(isGroup)
			{
				const children = item[this.childrenKey];

				if(index > -1)
				{
					searchKeys.splice(index, 1);
				}

				this.filterGroupId(children, searchKeys, treeSelectedData);
			}
			else
			{
				if(searchKeys.includes(itemid))
				{
					treeSelectedData.push(item);
				}
			}
		});
	}

	onChange(checkedKeys, labels, {triggerNode})
	{
		console.log("NtTreeForSelect onChange checkedKeys = ", checkedKeys);

		if(!triggerNode)
		{
			this.state.checkedKeys = checkedKeys;
			this.refreshSearch();
			return;
		}

		let {data = [], eventKey, isGroup, checked} = triggerNode.props,
			children = data && data[this.childrenKey] || [];

		checkedKeys = [...checkedKeys];

		checked = !checked;

		if(isGroup && checkedKeys.length)
		{
			children = children.filter(item => item && item[this.itemIdKey])
			.map(item => item[this.itemIdKey]);

			if(children.length)
			{
				children.forEach(this.updateCheckedKeys.bind(this, checked, checkedKeys));

				this.updateCheckedKeys(checked, checkedKeys, eventKey);

				if(!('checkedKeys' in this.props))
				{
					this.setState({checkedKeys}, this.refreshSearch);
				}
				else
				{
					this.state.checkedKeys = checkedKeys;
					this.refreshSearch();
				}

				this.checkedNodeKeys = checkedKeys;

				//this.refreshSearch();
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

			this.checkedNodeKeys = checkedKeys;
			this.state.checkedKeys = checkedKeys;
			this.refreshSearch();
		}

		console.log("NtTreeForSelect onChange end...");
	}

	render()
	{
		const {treeData, checkedKeys, popupContainer} = this.props,
			treeNodesComp = this.getTreeNodesComp(treeData);

		return (
			<TreeSelect value={checkedKeys} multiple treeCheckable allowClear
			            onChange={this.onChange.bind(this)}
			            loadData={this.onExpand.bind(this)}
			            {...omit(this.props, ["groupInfo", "itemInfo", "containGroupKeys", "treeData"])}
			            getPopupContainer={() => document.getElementsByClassName(popupContainer)[0]}
                        treeNode={treeNodesComp}
			/>
		);
	}
}

export default NtTreeForSelect;
