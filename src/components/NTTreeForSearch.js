import React from 'react';
import { Tree } from 'antd';
import { omit } from "../utils/MyUtil";
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

class NTTreeForSearch extends React.PureComponent {

	static defaultProps = {groupInfo: {}, itemInfo: {}, containGroupKeys: false};

	constructor(props)
	{
		super(props);

		this.state = {checkedKeys: props.checkedKeys || []};
		this._groupCheckedkeys = [];
		this.checkedNodeKeys = [];
	}

    /*shouldComponentUpdate(nextProps) {
        const {treeData} = nextProps;

        if (treeData && treeData.length === 0)
            return false;

        return ((nextProps.checkedKeys.length > 0 || this.props.checkedKeys.length > 0)
            && nextProps.checkedKeys !== this.props.checkedKeys)
            || nextProps.treeData !== this.props.treeData;
    }*/

	componentWillReceiveProps(nextProps)
	{
		if(nextProps.hasOwnProperty("checkedKeys"))
		{
			this.setState({checkedKeys: nextProps.checkedKeys || []});
		}
	}

	componentDidMount()
	{
        let {checkedKeys = []} = this.state;

		this.loadDataFn();
        this.setState({checkedKeys});
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

		return (item) => item[this.itemNameKey] || item[this.itemIdKey];
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
		if(!data || !Array.isArray(data))
			return <TreeNode key={gid + "_"} title={"无"} />; //disableCheckbox={true}

		return data.map(item => {
			let isGroup = item.hasOwnProperty(this.childrenKey);

			const groupid = item[this.groupIdKey],
				title = this.groupTitleFn(item),
				children = item[this.childrenKey];
			if(isGroup)
			{
				let index = this._groupCheckedkeys.findIndex(value => value == groupid),
					leafs = children.filter(item => item[this.itemIdKey])
					.map(item => item[this.itemIdKey]);

				if(leafs.length && index > -1)
				{
					let checkedKeys = [...this.state.checkedKeys];
					this._groupCheckedkeys.splice(index, 1);

					leafs.forEach(this.updateCheckedKeys.bind(this, true, checkedKeys));

					this.updateCheckedKeys(true, checkedKeys, groupid);

					this.refreshSearch(checkedKeys);
				}


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

		return <TreeNode key={itemId} title={title} value={itemId} data={item} isLeaf={true}/>;
	}

	onCheck(checkedKeys, {node, checked})
	{
		let {data = [], eventKey, isGroup, isLeaf} = node.props,
			children = data && data[this.childrenKey] || [];

        // if (!isLeaf)
        //     return;

		checkedKeys = [...checkedKeys];

		if(isGroup)
		{
			children = children.filter(item => item && item[this.itemIdKey])
			.map(item => item[this.itemIdKey]);

			if(children.length)
			{
				children.forEach(this.updateCheckedKeys.bind(this, checked, checkedKeys));

				this.updateCheckedKeys(checked, checkedKeys, eventKey);

				if(!('checkedKeys' in this.props))
				{
					this.setState({checkedKeys});
				}

				this.checkedNodeKeys = checkedKeys;
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
		}

		this.refreshSearch(checkedKeys);
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
			if(checked)
			{
				checkedKeys.push(key)
			}
		}
	}

	onExpand(expandedKeys, {node})
	{
		let {eventKey = "", data = []} = node.props;

		if(!data.length)
		{
			this.loadDataFn(eventKey);
		}
	}

	refreshSearch(checkedKeys)
	{
		let {searchFn, containGroupKeys, treeData} = this.props,
			treeSelectedData = [];

		if(typeof searchFn === "function")
		{
			if(!containGroupKeys)
			{
				let searchKeys = [...checkedKeys];

				this.checkedNodeKeys = this.checkedNodeKeys.filter(key => key && (key.indexOf("^$_$^") === -1));

				this.filterGroupId(treeData, searchKeys, treeSelectedData);
			}

			searchFn(this.checkedNodeKeys, treeSelectedData);
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

			if(isGroup && item[this.childrenKey].length > 0)
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

	render()
	{
		const {treeData, popupContainer} = this.props,
			treeNodesComp = this.getTreeNodesComp(treeData);

		//this.refreshSearch();
		return (
			<Tree checkable multiple checkedKeys={this.state.checkedKeys}
			      onCheck={this.onCheck.bind(this)} onExpand={this.onExpand.bind(this)}
			      {...omit(this.props, omitArr)}
                  getPopupContainer={() => document.getElementsByClassName(popupContainer)[0]}
            >
				{
					treeNodesComp
				}
			</Tree>
		);
	}
}

const omitArr = ["groupInfo", "itemInfo", "treeData", "loadDataFn", "searchFn",
	"containGroupKeys", "groupTitleFn", "itemTitleFn", "checkedKeys"];

export default NTTreeForSearch;
