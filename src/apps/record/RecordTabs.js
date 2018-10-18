import React from 'react';
import { Menu } from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import RecordSetting from "./RecordSetting";
import { getLangTxt, shallowEqual } from "../../utils/MyUtil";
import LogUtil from "../../lib/utils/LogUtil";
import {getConversationCount} from "./redux/consultReducer";
import { Map } from "immutable";

const SubMenu = Menu.SubMenu,
	Item = Menu.Item;

const option = [
	{
		"title": "record_online_record",
		"key": "onlineRecord",
        "countKey": "conversationCount",
		"subMenu": [
			{"title": "record_valid_consult", "key": "validConsult", fns:[],
                "countKey": "effectiveCount",
            "subMenu": [
                // {"title": "record_valid_consult", "key": "effectiveCount", "countKey": "effectiveCount"},
                {"title": "record_valid_summaryCount", "key": "summaryCount", "countKey": "summaryCount"},
                {"title": "record_valid_unSummaryCount", "key": "unSummaryCount", "countKey": "unSummaryCount"},
                {"title": "record_valid_goodStartCount", "key": "goodStartCount", "countKey": "goodStartCount"},
                {"title": "record_valid_cartStartCount", "key": "cartStartCount", "countKey": "cartStartCount"},
                {"title": "record_valid_orderStartCount", "key": "orderStartCount", "countKey": "orderStartCount"},
                {"title": "record_valid_payStartCount", "key": "payStartCount", "countKey": "payStartCount"},
                {"title": "record_valid_otherStartCount", "key": "otherStartCount", "countKey": "otherStartCount"}
            ]},
			{"title": "record_invalid_consult", "key": "invalidConsult", "countKey": "unEffectiveCount",
                "subMenu": [
                    // {"title": "record_invalid_consult", "key": "unEffectiveCount", "countKey": "unEffectiveCount"},
                    {"title": "record_invalid_csNotReplyCount", "key": "csNotReplyCount", "countKey": "csNotReplyCount"},
                    {"title": "record_invalid_customerNotReplyCount", "key": "customerNotReplyCount", "countKey": "customerNotReplyCount"}
                ]
            }
		]
	}, {
		"title": "record_all_leave_msg", "key": "allLeaveMessage", "countKey": "allLeaveMsgCount",
		"subMenu": [
			{"title": "record_pending", "key": "pending", "countKey": "unDealCount"},
			{"title": "record_dealed", "key": "dealed", "countKey": "dealCount"}
		]
	}
];

class RecordTabs extends React.Component {

	constructor(props)
	{
		super(props);

		this.state = {
			selectedKey: '1',
			openKeys: ["sub1"],
			path: [],//[{"title": "在线咨询记录", "key": "onlineRecord"}, {"title": "有效咨询", "key": "validConsult"}],
			winHeight: ""
		};

		this._getMenuMap();

		this.onOpenChange = this._onOpenChange.bind(this);
		this.handleClick = this._handleClick.bind(this);
        this.onWindowResize = this.onWindowResize.bind(this);

        this.getOptionsLoop(option.map(item =>
        {
            return {...item}
        }), props.recordFunc);

		this.getDefaultPath();
        this.getCountData();
	}

	componentDidMount()
	{
		window.addEventListener('resize', this.onWindowResize);
	}

    get time()
    {
        return this.getData("time");
    }

    getData(key2)
    {
        let {leaveMsgReducer} = this.props,
            key = /*this.isproccessed ? */"leaveDealedMsg"/* : "leavePendingMsg"*/;

        return leaveMsgReducer.getIn([key, key2]);
    }

    getCountData(keyPath = [])
    {
        let consultTime = this.consultTime;

        this.props.getConversationCount(consultTime);
    }

	componentWillUnmount()
	{
		window.removeEventListener('resize', this.onWindowResize);
    }

	onWindowResize()
	{
		if(document.documentElement && document.documentElement.clientHeight && document.documentElement.clientWidth)
		{
			let winHeight = document.documentElement.clientHeight - 60;
			if(winHeight != this.state.winHeight)
			{
				this.setState({
					winHeight: winHeight
				})
			}
		}
	}

	shouldComponentUpdate(nextProps, nextState)
	{
		if(!shallowEqual(nextProps.recordFunc, this.props.recordFunc, true, 2) || !this.state.option || !shallowEqual(nextProps.conversationCount, this.props.conversationCount, true, 2))
		{
            let {recordFunc} = nextProps;

            this.getOptionsLoop(option.map(item =>
            {
                return {...item}
            }), recordFunc);

			this.getDefaultPath();

			return true;
		}

		return !shallowEqual(nextState, this.state, true, 2);
	}

    /**
     * 获取默认路径
     * 第一个节点或者第一个父节点的第一个子节点
     * */
	getDefaultPath()
	{
		if(this.state.path && this.state.path.length > 0)
			return;

		this.state.option.find(item =>
		{
			if(item.hasOwnProperty("subMenu"))
			{
				if(item.subMenu && item.subMenu.length > 0)
				{
					let {title, key} = item,
						{title: t, key: k} = item.subMenu[0];

                    if (item.subMenu[0].subMenu && item.subMenu[0].subMenu.length)
                    {
                        let {title: unitTitle, key: unitkey} = item.subMenu[0].subMenu[0]

                        this.state.path = [{title, key}, {title: t, key: k}, {title: unitTitle, key: unitkey}];
                        this.state.selectedKey = unitkey;
                        this.state.openKeys = [key, k];
                    }
				}
			}
			else
			{
				this.state.path = [{...item}];
				this.state.selectedKey = item.key;
			}

			return this.state.path.length;
		});
	}

	getOptionsLoop(opts, recordFunc)
	{
        let {converMenu = false, leaveMenu = false} = recordFunc;

        this.state.option = [];
        if (converMenu)
        {
            this.state.option.push(option[0]);
        }

        if (leaveMenu)
        {
            this.state.option.push(option[1]);
        }
	}

	_getMenuMap()
	{
		this._menuMap = {};
		option.forEach(item =>
		{
			this._menuMap[item.key] = item.title;

			item.subMenu && item.subMenu.forEach(item =>
			{
				this._menuMap[item.key] = item.title;
                item.subMenu && item.subMenu.forEach(item =>
                {
                    this._menuMap[item.key] = item.title;

                });
			});
		});
	}

	_handleClick({key, keyPath})
	{
		let path = keyPath.map(key =>
		{
			return {key, title: this._menuMap[key]};
		});

        this.getCountData(keyPath);

		this.setState({
			selectedKey: key,
			path: path.reverse()
		});
	}

	_onOpenChange(openKeys)
	{
		// let openKey = openKeys.pop();
        //
		// openKeys = [];
        //
		// if(openKey && openKey.length > 0)
		// {
		// 	openKeys.push(openKey);
		// }

		this.setState({openKeys});
	}

	_getOpenFirstItem(openKey)
	{
		let path = [{key: openKey, title: this._menuMap[openKey]}],
			curOpenItem = option.filter(item => item.key === openKey)[0],
			subFirst = curOpenItem.subMenu && curOpenItem.subMenu[0];

		let selectedKey;
		if(subFirst)
		{
			path.push(subFirst);
			selectedKey = subFirst.key;
		}

		return {path, selectedKey};
	}

	_getMenuItems()
	{
		let opts = this.state.option || [],
            {conversationCount = {}} = this.props;

		return opts.map(menu =>
		{
			if(menu.subMenu)
			{
				return (
					<SubMenu key={menu.key} title={[
                            <span>{getLangTxt(menu.title)}</span>,
                            <span className="listCountSpan">( {conversationCount[menu.countKey] || 0} )</span>
					    ]} style={{position: "relative"}}
                    >
						{
							menu.subMenu.map(item =>
							{
                                if (item.subMenu)
                                {
                                    return <SubMenu key={item.key} title={[
                                            <span>{getLangTxt(item.title)}</span>,
                                            <span className="listCountSpan">( {conversationCount[item.countKey] || 0} )</span>
                                        ]} style={{position: "relative"}}
                                    >
                                        {
                                            item.subMenu.map(unit => {
                                                return <Item key={unit.key} style={{position: "relative"}}>{getLangTxt(unit.title)}
                                                    <span className="listCountSpan">( {conversationCount[unit.countKey] || 0} )</span>
                                                </Item>;
                                            })
                                        }
                                    </SubMenu>
                                }
								return <Item key={item.key} style={{position: "relative"}}>{getLangTxt(item.title)}
                                        <span className="listCountSpan">( {conversationCount[item.countKey] || 0} )</span>
                                    </Item>;
							})
						}
					</SubMenu>
				);
			}
			else
			{
				return <Item key={menu.key} style={{position: "relative"}}><span style={{
					width: "5px", height: "5px", borderRadius: "50%", backgroundColor: "#d2d8db",
					display: "inline-block", position: "absolute", top: "19px", left: "10px"
				}}></span>{getLangTxt(menu.title)}<span className="listCountSpan">( {conversationCount[menu.countKey] || 0} )</span></Item>
			}
		});
	}

	changeRoute(path)
	{
		let key, selectedKey;
		if(path.length === 2)
		{
			key = path[0].key;
			selectedKey = path[1].key;
		}
		else
		{
			key = selectedKey = path[0].key;
		}

		this.setState({selectedKey/*, openKeys: [key, selectedKey]*/, path});
	}

    get consultTime()
    {
        const {getRecordCommonTime} = this.props,
            consultTime = getRecordCommonTime.get("consultTime");

        if (Map.isMap(consultTime))
            return consultTime.toJS();

        return consultTime
    }

	render()
	{
		try
		{
			const {openKeys, selectedKey, path} = this.state;

			return (
				<div ref="menus" className="recordTabWrap">
					<Menu className="user-select-disable recordTabLeftMenu" theme="dark" mode="inline" selectedKeys={[selectedKey]}
                        openKeys={openKeys} onOpenChange={this.onOpenChange} onClick={this.handleClick}>
						{
							this._getMenuItems()
						}
					</Menu>
					<RecordSetting path={path} changeRoute={this.changeRoute.bind(this)}/>
				</div>
			);
		}
		catch(e)
		{
			LogUtil.trace("RecordTabs", LogUtil.ERROR, "render stack = " + e.stack);
		}

		return null;
	}
}

function mapStateToProps(state)
{
	let {startUpData, consultReducer1, leaveMsgReducer, getRecordCommonTime} = state,
        recordFunc = startUpData.get("record") || {},
        conversationCount = consultReducer1.get("conversationCount"),
        extraTime = consultReducer1.getIn(["validConsult", "extra"]);

	return {recordFunc, conversationCount, extraTime, leaveMsgReducer, getRecordCommonTime};
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getConversationCount}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(RecordTabs);

