import React, {PropTypes} from 'react'
import {Tree, Popover, Tooltip} from 'antd';
import TreeNode from "../../../components/antd2/tree/TreeNode";
import ScrollArea from 'react-scrollbar';
import {truncateToPop} from "../../../utils/StringUtils";
import { getLangTxt } from "../../../utils/MyUtil";

const defaultProps = {
        summaryTypeTree: []
    };

class SummaryTypeTreeReadOnly extends React.PureComponent {
    constructor(props) {
        super(props);

        this.state={
            checkedKeys: [],
            rangeDone: false,
            currentGroup: ""
        };
        this.onSelect = this.onSelect.bind(this);
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

    //获取分组下咨询总结列表
    getSummaryLeafData(groupId)
    {
        this.props.getSummaryLeafData(groupId)
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
                            <i className="icon-bianji iconfont"/>
                        </Tooltip>
                        <Tooltip placement="bottom" title={getLangTxt("del")}>
                            <i className="icon-shanchu iconfont"/>
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
                    <span>总结类型</span>
                    <span className='tree-icon clearFix'>
                        <Tooltip placement="bottom" title={getLangTxt("move_up")}>
                            <i className="iconfont icon-shangyi"/>
                        </Tooltip>
                        <Tooltip placement="bottom" title={getLangTxt("move_down")}>
                            <i className="iconfont icon-xiayi"/>
                        </Tooltip>
                        <Tooltip placement="bottom" title={"add_group"}>
                            <i className="icon-tianjia1 iconfont"/>
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

SummaryTypeTreeReadOnly.defaultProps = defaultProps;

export default SummaryTypeTreeReadOnly;
