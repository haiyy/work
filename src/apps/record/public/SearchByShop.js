import React from 'react';
import { Menu, TreeSelect } from 'antd';
import moment from 'moment';
const TreeNode = TreeSelect.TreeNode;

const SubMenu = Menu.SubMenu,
    MenuItem = Menu.Item;

class SearchByShop extends React.Component {
	constructor(props)
	{
		super(props);

		this.state = {
            selectedMenuVal: []
		}
	}

	componentDidMount()
	{
	}

    onTitleClick({ key, domEvent })
    {
        console.log("slkdjflsdkjfsldkfjsfjkld", key, domEvent )
    }

    getShopMenuItem(list)
    {

        if (list && list.length)
            return list.map(item => {
                return <MenuItem key={item.id} style={{position: "relative"}}>
                    {
                        item.name
                    }
                </MenuItem>
            })
    }

    getSearchMenuItem(menuData)
    {
        if (menuData && menuData.length)

        return menuData.map(menu =>
        {
                return (
                    <SubMenu onTitleClick={this.onTitleClick.bind(this)} key={menu.groupid} title={menu.groupname}>
                        {
                            this.getSearchMenuItem(menu.children)
                        }

                        {
                            this.getShopMenuItem(menu.merchants)
                        }
                    </SubMenu>
                );
        });
    }

    handleClick({ item, key, keyPath })
    {
        console.log("lskdfjsldkfjsldfkj", item, key, keyPath)
        let {selectedMenuVal} = this.state;
        if (!selectedMenuVal.includes(key))
        {
            selectedMenuVal.push(key)
        }else
        {
            let delIndex = selectedMenuVal.findIndex(item => item === key);
            selectedMenuVal.splice(1, delIndex);
        }

        this.setState({selectedMenuVal})

    }

    getTreeUserNodes(userArray = [], bindType)
    {
        if (userArray.length)
            return userArray.map(item => {

                let userIdString = item.id.toString();

                return (
                    <TreeNode title={item.name}
                        key={userIdString} value={userIdString}
                        dataRef={item} isLeaf={true}
                    >
                    </TreeNode>
                );
            });
    }

    getShopGroupTreeNode(dataArray)
    {
        return dataArray.map(item => {
            return (
                <TreeNode title={item.groupname}
                    key={item.groupid} value={item.groupid}
                    dataRef={item} isLeaf={item.isLeaf}
                    disableCheckbox = {true}
                >
                    {
                        item.children && item.children.length > 0 ? this.getShopGroupTreeNode(item.children) : null
                    }
                    {
                        this.getTreeUserNodes(item.merchants)
                    }
                </TreeNode>
            );
        });
    }

    handleClickSelect()
    {
        let {isShowSearchShop} = this.state;
        this.setState({isShowSearchShop: !isShowSearchShop});
    }

	render()
	{
        let {shopGroupData} = this.props,
            {isShowSearchShop, selectedMenuVal} = this.state;

        return (
            [
                <div onClick={this.handleClickSelect.bind(this)}>
                    <TreeSelect
                        style={{ width: "198px" }}
                        value={this.state.selectedMenuVal}
                        treeCheckable={true}
                        getPopupContainer={() => document.querySelector(".searchShopIpt")}
                        placeholder="Please select"
                        allowClear
                    >
                        {
                            this.getShopGroupTreeNode(this.props.shopGroupData)
                        }
                    </TreeSelect>
                </div>,
                isShowSearchShop ? <div className="searchByShopComp">
                    <Menu onClick={this.handleClick.bind(this)} multiple={true} style={{ width: 256 }} mode="vertical">
                        {
                            this.getSearchMenuItem(shopGroupData)
                        }
                    </Menu>
                </div> : null
            ]

		);
	}
}

export default SearchByShop;
