import React, {PropTypes} from 'react'
import {Tree, Popover, Tooltip} from 'antd';
import TreeNode from "../../../components/antd2/tree/TreeNode";
import ScrollArea from 'react-scrollbar';
import { getLangTxt, upOrDown } from "../../../utils/MyUtil";
import {truncateToPop} from "../../../utils/StringUtils";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

//const confirm = Modal.confirm,
const  defaultProps = {
    summaryTypeTree: []
};

class SummaryTypeTree extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state={
            checkedKeys: [],
            rangeDone: false,
            currentGroup: ""
        };
        this.onSelect = this.onSelect.bind(this);
        this.showAddSummaryTypeModel = this.showAddSummaryTypeModel.bind(this);
        this.removeSummaryType = this.removeSummaryType.bind(this);
    }
    //点击分组获取分组下数据
    onSelect(info, e) {
        let {node = {props: {}}} = e,
            {props = {children}} = node,
            {children} = props;

        if (info && info.length > 0)
        {
            this.setState({currentGroup: info[0]});
            this.props.notifySelectedSummaryType(info[0], children);
        }
    }

    uniqueParent(array)
    {
        return [...new Set(array)]
    }

    //咨询总结组checked
    onCheckGroup=(checkedKeys, info)=>
    {
        let rangeCheckedKeys = [],
            checkedParents = [],
            {checkedNodes = []} = info;

        checkedNodes.forEach(item => {
            rangeCheckedKeys.push(item.key);
            checkedParents.push(item.props.parentId);
        });

        checkedParents = this.uniqueParent(checkedParents);

        if (checkedParents.length == 1 && checkedKeys.checked.length > 0)
        {
            this.setState({rangeCheckedParent: checkedParents[0]})
        }else
        {
            this.setState({rangeCheckedParent: null})
        }

        this.setState({
            checkedKeys: rangeCheckedKeys
        });
    };

    findGroup(allGroupData, rangeCheckedParent)
    {
        let groupItem = {};

        let loop = (groupData, groupId) => {
            for (let i = 0; i < groupData.length; i++)
            {
                if (groupData[i].summaryid === groupId)
                {
                    groupItem = groupData[i];
                    return;
                }else if (groupData[i].children && groupData[i].children.length > 0)
                {
                    loop(groupData[i].children, groupId)
                }
            }
        };
        loop(allGroupData, rangeCheckedParent);
        return groupItem;
    }


    //咨询总结组排序 @param type: -1向上 || 1向下;
    rangeSummaryGroup(type)
    {
        let { summaryTypeTree = [] } = this.props,
            { checkedKeys = [], rangeCheckedParent } = this.state,
            rangeGroupData = summaryTypeTree,
            copyCheckedKeys = [...checkedKeys];

        if (rangeCheckedParent)
        {
            let group = this.findGroup(summaryTypeTree, rangeCheckedParent);
            rangeGroupData = group.children;
        }


        let rangeArray = upOrDown(rangeGroupData, copyCheckedKeys, "summaryid", type);

        if (checkedKeys.length < 1 || rangeCheckedParent === null)
            return;

        if (rangeArray && rangeArray.length > 0)
            this.props.editSummaryTypeRank(rangeArray);

        this.setState({
            rangeChanged: !this.state.rangeChanged
        });
    }


    //弹出新增咨询总结类型弹框
    showAddSummaryTypeModel() {
        this.props.notifyEditSummary({
            summaryTypeContent: ""
        });
        this.props.showSummaryModel('addSummaryType');
    }

    //弹出编辑咨询总结类型弹框
    showEditSummaryTypeModel(item) {
        this.props.notifyEditSummary(item);
        this.props.showSummaryModel('editSummaryType');
    }

    //删除咨询总结类型
    removeSummaryType(item) {
        confirm({
            title: getLangTxt("del_tip"),
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip',
            content: item.children ? getLangTxt("setting_summary_note5") : getLangTxt("setting_summary_note6"),
            onOk:() => {
                this.props.removeSummaryType(item);
                this.props.hideSummaryModel();
            },
            onCancel:() => {
            }
        });
    }

    //获取分组下咨询总结列表
    getSummaryLeafData(groupId)
    {
        this.props.getSummaryLeafData(groupId)
    }

    scrollIng(value)
    {
        if(!value.topPosition){
            value.topPosition  = 0;
        }
    }

    getContainerWidth(floor)
    {
        if (!getComputedStyle(window.document.documentElement)['font-size'])
            return;

        let htmlFontSizepx = getComputedStyle(window.document.documentElement)['font-size'],
            htmlFontSize = htmlFontSizepx.substring(0, htmlFontSizepx.length - 2),
            maxWidth = 2 * htmlFontSize;

        return floor > 1 ? maxWidth - 18 * floor - 100 : maxWidth - 18 * floor - 100;
    }

    getSummaryTypeTreeNode(data, parentid)
    {
        const loop = (data, parentid, level = 0) =>data.map(item => {
            if (item.children && item.children.length < 1) {
                delete item.children;
            }

            let id = item.summaryid,
                boxWidth = this.getContainerWidth(level),
                contentInfo = truncateToPop(item.content, boxWidth) || {};

            let title = (
                <div className="summaryTypeNameBox" onClick={this.getSummaryLeafData.bind(this,id)}>
                    {
                        contentInfo.show ?
                            <Popover content={<div style={{maxWidth: "1.4rem", height: "auto", wordBreak: "break-word"}}>{item.content}</div>} placement="top">
                                {contentInfo.content}
                            </Popover>
                            :
                            item.content
                    }
                    <span className="operateBox">
                        <Tooltip placement="bottom" title={getLangTxt("edit")}>
                            <i className="icon-bianji iconfont"
                                onClick={this.showEditSummaryTypeModel.bind(this, {summaryTypeContent: item.content, summaryTypeParentid:parentid || "", summaryid:id})}/>
                        </Tooltip>
                        <Tooltip placement="bottom" title={getLangTxt("del")}>
                            <i className="icon-shanchu iconfont" onClick={this.removeSummaryType.bind(this, item)}/>
                        </Tooltip>
                    </span>
                </div>
            );

            if (item.children && item.children.length > 0) {
                return (
                    <TreeNode key={id} title={title} parentId={item.parentid}>
                        {loop(item.children, id, level + 1)}
                    </TreeNode>
                );
            }

            return <TreeNode key={id} title={title} parentId={item.parentid}/>;
        });
        return loop(data, parentid, 0)
    }

    render() {
        let {summaryTypeTree = []} = this.props;

        return (
            <div style={{height:'100%'}}>
                <div className='tree-head'>
                    <span>{getLangTxt("setting_summary_type")}</span>
                    <span className='tree-icon clearFix'>
                        <Tooltip placement="bottom" title={getLangTxt("move_up")}>
                            <i className="iconfont icon-shangyi" onClick={this.rangeSummaryGroup.bind(this, -1)}/>
                        </Tooltip>
                        <Tooltip placement="bottom" title={getLangTxt("move_down")}>
                            <i className="iconfont icon-xiayi" onClick={this.rangeSummaryGroup.bind(this, 1)}/>
                        </Tooltip>
                        <Tooltip placement="bottom" title={getLangTxt("add_group")}>
                            <i className="icon-tianjia1 iconfont" onClick={this.showAddSummaryTypeModel}/>
                        </Tooltip>
                    </span>
                </div>
                <div className='tree-con'>
                    <ScrollArea
                        speed={1}
                        horizontal={false}
                        style={{height: "100%"}}
                        onScroll={this.scrollIng.bind(this)} smoothScrolling>
                        <Tree
                            checkable
                            selectedKeys={this.props.selectingKey}
                            onSelect={ this.onSelect }
                            onCheck={ this.onCheckGroup }
                            checkStrictly={true}
                        >
                            {this.getSummaryTypeTreeNode(summaryTypeTree, this.props.rootid)}
                        </Tree>
                    </ScrollArea>
                </div>
            </div>
        )
    }
}

SummaryTypeTree.defaultProps = defaultProps;

export default SummaryTypeTree;
