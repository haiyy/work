import React from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { TreeSelect, Tag, Input, Select, Popover } from 'antd';
import {getSearchShopItem} from "../../setting/shopAccount/reducer/shopAccountReducer";
import { bglen, truncateToPop } from "../../../utils/StringUtils";
import {getBindingShopGroup} from "../../setting/consultBinding/reducer/consultBindingReducer";

const TreeNode = TreeSelect.TreeNode,
    { CheckableTag } = Tag,
    Search = Input.Search,
    Option = Select.Option;

let letterArr = [{ title: "A", checked: false}, { title: "B", checked: false}, { title: "C", checked: false}, { title: "D", checked: false}, { title: "E", checked: false}, { title: "F", checked: false}, { title: "G", checked: false}, { title: "H", checked: false}, { title: "I", checked: false}, { title: "J", checked: false}, { title: "K", checked: false}, { title: "L", checked: false}, { title: "M", checked: false}, { title: "N", checked: false}, { title: "O", checked: false}, { title: "P", checked: false}, { title: "Q", checked: false}, { title: "R", checked: false}, { title: "S", checked: false}, { title: "T", checked: false}, { title: "U", checked: false}, { title: "V", checked: false}, { title: "W", checked: false}, { title: "X", checked: false}, { title: "Y", checked: false}, { title: "Z", checked: false} ];

class SearchByShopComp extends React.Component {
	constructor(props)
	{
		super(props);

		this.state = {
            clickedGroupId: [],
            shopItemIds: []
		}
	}

    componentDidMount() {
        let {queryType} = this.props;

        letterArr.forEach(item => item.checked = false);
        this.props.getBindingShopGroup(queryType);
    }

    componentWillReceiveProps(nextProps) {
        let {shopData: thisShopData} = this.props,
            {shopData: nextShopData} = nextProps,
            thisList = thisShopData.get("shopItemList"),
            nextList = nextShopData.get("shopItemList"),
            {isSearch, shopItemIds} = this.state;

        if (isSearch && JSON.stringify(thisList) != JSON.stringify(nextList) || isSearch && (JSON.stringify(nextList) != JSON.stringify(shopItemIds)))
        {
            this.setState({
                shopItemIds: nextList,
                clickedGroupId: []
            })
        }
    }

    handleShopTypeChange(value)
    {
        let isShop = value === "shop";

        if (!isShop)
            this.props.getShopIdList(null);

        this.setState({isShowSearchShop: isShop});
    }


    handleClickSelect()
    {
        let {isShowSearchShop, checkedIdList} = this.state;
        this.setState({isShowSearchShop: !isShowSearchShop});

        this.props.getShopIdList(checkedIdList)
    }

    unSelectShopItem(merchants, shopIds)
    {
        if(merchants.length)
        {
           merchants.forEach(item =>
            {
                let resetChatItem = shopIds.find(checkedItem => checkedItem.siteid === item.siteid) || {};
                resetChatItem.checked = false;

                shopIds = shopIds.filter(shopItem => shopItem.siteid !== item.siteid)
            })
        }

        return shopIds;
    }

    //选中状态下再次点击分组则移除
    unSelectGroupItem(groupInfo, groupIds, shopIds)
    {
        let deledGroupIds = groupIds.filter(item => item !== groupInfo.groupid),
            deledShopIds = this.unSelectShopItem(groupInfo.merchants, shopIds),
            loopGroup = (group) => {

                group.forEach(groupItem => {

                    deledGroupIds = deledGroupIds.filter(item => item !== groupItem.groupid);
                    deledShopIds = this.unSelectShopItem(groupItem.merchants, deledShopIds);

                    if (groupItem.children.length)
                        loopGroup(groupItem.children)
                })
            };

        if (groupInfo.children.length)
            loopGroup(groupInfo.children);

        return {deledGroupIds, deledShopIds};
    }

    selectGroupItem(groupItem, shopItemIds, isSearch)
    {
        if (groupItem.merchants.length)
        {
            groupItem.merchants.forEach(shopItem => {
                if (isSearch)
                    shopItem.checked = false;
                shopItemIds.push(shopItem)
            })
        }

        return shopItemIds
    }

    getClickedGroup(shopGroupItem)
    {
        let {clickedGroupId, shopItemIds, isSearch} = this.state,
            unSelectInfo = {};

        if (clickedGroupId.includes(shopGroupItem.groupid))
        {
            unSelectInfo = this.unSelectGroupItem(shopGroupItem, clickedGroupId, shopItemIds);
            clickedGroupId = unSelectInfo.deledGroupIds;
            shopItemIds = unSelectInfo.deledShopIds;

        }else
        {
            if (isSearch)
            {
                shopItemIds = [];
                this.setState({checkedIdList: []})
            }

            clickedGroupId.push(shopGroupItem.groupid);
            shopItemIds = this.selectGroupItem(shopGroupItem, shopItemIds, isSearch);
        }

        letterArr.forEach(item => item.checked = false);

        this.forceUpdate();
        this.setState({clickedGroupId, shopItemIds, isSearch: false})
    }

    getShopList(shopGroupData)
    {
        let {clickedGroupId} = this.state;

        return shopGroupData.map(shopGroupItem =>
        {
            let isSelected = clickedGroupId.includes(shopGroupItem.groupid),
                className = isSelected ? "selectedStatus groupName" : "groupName",
                groupNameInfo = truncateToPop(shopGroupItem.groupname, 100) || {};

            return <div key={shopGroupItem.groupid} className="levelFirst">
                        <div className={className} onClick={this.getClickedGroup.bind(this, shopGroupItem)}>
                            {
                                groupNameInfo.show ?
                                <Popover content={<div style={{
									maxWidth: "1.4rem", height: "auto", wordBreak: "break-word"
								}}>{shopGroupItem.groupname}</div>} placement="topLeft">
                                        <span> {groupNameInfo.content} </span>
                                    </Popover>
                                    :
                                    <span> {shopGroupItem.groupname} </span>
                            }
                            {shopGroupItem.children.length ? <i className="iconfont icon-xiala1-xiangyou"/> : null}
                        </div>
                        <div className="levelChildren">
                            {
                                shopGroupItem.children && clickedGroupId.includes(shopGroupItem.groupid)
                                    ? this.getShopList(shopGroupItem.children) : null
                            }
                        </div>
                    </div>
        })
    }

    handleCheckShop(shopItem, checked)
    {
        let {shopItemIds} = this.state,
            checkedItem = shopItemIds.find(item => item.siteid === shopItem.siteid),
            checkedIdList = [];
        checkedItem.checked = checked;

        shopItemIds.forEach(item =>
        {
             if (item.siteid === shopItem.siteid)
             {
                 item.checked = checked;
             }

            if (item.checked)
                checkedIdList.push(item.siteid.toString())
        });

        this.setState({shopItemIds, checkedIdList});
    }

    getShopCheckList()
    {
        let {shopItemIds} = this.state;
        return shopItemIds.map(shopItem => {
            return <CheckableTag checked={shopItem.checked} onChange={this.handleCheckShop.bind(this, shopItem)}>{shopItem.name}</CheckableTag>
        })
    }

    handleCheckLetter(letterInfo, checked)
    {
        letterArr.forEach(item =>
        {
            item.checked = letterInfo.title === item.title;
        });

        let obj = {
            "page": 1,
            "size": 100000,
            "keyword": letterInfo.title
        };

        this.props.getSearchShopItem(obj);
        this.setState({isSearch: true, checkedIdList: []});
    }

    getSearchLetterTags()
    {
        return letterArr.map(letterInfo => {
            return <CheckableTag checked={letterInfo.checked} onChange={this.handleCheckLetter.bind(this, letterInfo)}>{letterInfo.title}</CheckableTag>
        })
    }

    searchShopItem(value)
    {
        let obj = {
            "page":1,
            "size":100000,
            "keyword":value
        };

        letterArr.forEach(item => item.checked = false);

        this.props.getSearchShopItem(obj);

        this.setState({isSearch: true, checkedIdList: []});
    }

	render()
	{
        let {shopGroupData} = this.props,
            {isShowSearchShop} = this.state;

        return (
            <div className="searchShopComponent">
                <div className="searchShopIpt">
                    <Select defaultValue="site" style={{ width: 120 }}
                        getPopupContainer={() => document.querySelector(".searchShopIpt")}
                        onSelect={this.handleShopTypeChange.bind(this)}
                    >
                        <Option value="site">平台</Option>
                        <Option value="shop">平台商户</Option>
                    </Select>
                </div>
                {
                    isShowSearchShop ?
                        [
                            <div className="searchByShopMask" onClick={this.handleClickSelect.bind(this)}></div>,
                            <div className="searchByShop">
                                <div className="searchIpt">
                                    <Search
                                        placeholder="商户名称关键词/ID"
                                        onSearch={this.searchShopItem.bind(this)}
                                        enterButton
                                    />
                                </div>
                                <div className="searchByShopComp">
                                    <div className="shopGroupMenu">
                                        {this.getShopList(shopGroupData)}
                                    </div>
                                    <div className="shopListCheckComp">
                                        <div className="searchByLetter">
                                            {
                                                this.getSearchLetterTags()
                                            }
                                        </div>
                                        <div className="shopItemCheckBox">
                                            {
                                                this.getShopCheckList()
                                            }
                                        </div>

                                    </div>
                                </div>
                            </div>
                        ]
                        : null
                }
            </div>
		);
	}
}

function mapStateToProps(state) {
    let {consultBindingReducer} = state,
        shopGroupData = consultBindingReducer.get("consultBindingShop") || [];

    return {
        shopData: state.shopAccountReducer,
        shopGroupData
    };
}

function mapDispatchToProps(dispatch) {
    return bindActionCreators({getSearchShopItem, getBindingShopGroup}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SearchByShopComp);
