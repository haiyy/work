import React from 'react';
import { Button, Table, Modal, Input, Form, Popover, Tooltip } from 'antd';
import ScrollArea from 'react-scrollbar';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { bglen, truncateToPop } from "../../../utils/StringUtils";
import { getSkillTagList, getSkillTagUserList, newSkillTag, removeSkillTag, editSkillTag } from './action/skilltag';
import './style/skillTag.scss';
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import NTModal from "../../../components/NTModal";

let confirm = Modal.confirm;

class SkilltagReadOnly extends React.PureComponent {
    constructor(props)
    {
        super(props);
        this.state = {
            isNewTagShow: false,
            isRemoveTagShow: false,
            isTagDetailShow: false,
            filteredInfo: null,
            sortedInfo: null,
            tagDetailInfo: null,
            currentKey: null,
            currentPage: 1,
            currentTagName: null
        }
    }

    //页面渲染完成 获取技能标签列表
    componentWillMount()
    {
        let obj = {
            "page": 1,
            "rp": 10
        };
        this.props.getSkillTagList(obj);
    }

    //开启查看技能标签详情框
    showTagDetail(record)
    {
        this.props.getSkillTagUserList(record);
        this.setState({isTagDetailShow: true, currentTagName: record.tagname});
    }

    //关闭技能标签详情框
    hideTagDetail()
    {
        this.setState({isTagDetailShow: false});
    }

    //技能标签列表操作
    handleChange(pagination, filters, sorter)
    {
        this.setState({filteredInfo: filters, sortedInfo: sorter});
    }

    //技能标签列表翻页
    nextTagListPageData(pageNumber)
    {
        let obj = {
            "page": pageNumber,
            "rp": 10
        };

        if(this.state.sortedInfo && this.state.sortedInfo.order)
        {
            obj.range = this.state.sortedInfo.order === "descend" ? "desc" : "asc"
        }

        this.props.getSkillTagList(obj)
    }

    //从新加载技能标签列表
    reFreshFn()
    {
        let obj = {
            "page": 1,
            "rp": 10
        };
        this.props.getSkillTagList(obj);
        this.setState({currentPage: 1});
    }

    getTagsListColumns(sortedInfo, currentPage)
    {
        return [{
            key: 'key',
            dataIndex: 'key',
            width: '10%',
            render: text =>
            {
                let rankNum,
                    calcCurrent = (currentPage - 1) * 10;
                calcCurrent === 0 ? rankNum = text + 1 : rankNum = calcCurrent + text + 1;
                return (
                    <div style={{paddingLeft: "10px"}}>{rankNum}</div>
                )
            }
        }, {
            key: 'tagName',
            title: getLangTxt("setting_skill_tag_name"),
            width: '40%',
            render: (record) =>
            {

                let typeEle = document.querySelector(".unEditTagName"),
                    titleWidth = typeEle && typeEle.clientWidth,
                    titleInfo = truncateToPop(record.tagname, titleWidth) || {};

                return (
                    <div className="tagNameStyle">
                        {
                            titleInfo.show ?
                                <Popover content={<div style={{maxWidth: titleWidth + "px", height: "auto", wordWrap: "break-word"}} className="tagNamePopover">{record.tagname}</div>} placement="topLeft">
                                    <span className="unEditTagName">{titleInfo.content}</span>
                                </Popover>
                                :
                                <span className="unEditTagName">{record.tagname}</span>
                        }
                    </div>
                )
            }
        }, {
            key: 'userNum',
            title: getLangTxt("setting_skill_tag_people_number"),
            dataIndex: 'usernumber',
            render: text => <div style={{color: "#666"}}>{text}</div>
        }, {
            key: 'operate',
            title: getLangTxt("operation"),
            width: '15%',
            render: record => (
                <div className="tagOperate">
                    <Tooltip placement="bottom" title={getLangTxt("kpi_detail")}>
                        <i className="detailIcon"
                            onClick={this.showTagDetail.bind(this, record)}/>
                    </Tooltip>
                </div>
            )
        }];
    }

    styles = {
        text: {width: "200px", float: "right", height: "35px", paddingRight: "40px"},
        search: {
            cursor: 'pointer',
            position: "absolute",
            right: "0px",
            lineHeight: "35px",
            width: "40px",
            textAlign: "center",
            borderLeft: "1px solid #ccc"
        },
        remove: {position: 'absolute', top: '50%', margin: '-116px 0 0 -208px', left: '50%'}
    };

    columnCheck = [{
        key: 'key',
        title: getLangTxt("serial_number"),
        width: '20%',
        dataIndex: 'key'
    }, {
        key: 'showname',
        title: getLangTxt("setting_skill_tag_people"),
        width: '40%',
        dataIndex: 'username',
        render: (text, record) =>
        {
            return <div>{record.nickname + "(" + record.externalname + ")"}</div>
        }
    }, {
        key: 'name',
        title: getLangTxt("setting_skill_tag_skill"),
        width: '40%',
        dataIndex: 'name'
    }];

    render()
    {
        let {sortedInfo, currentPage = 1} = this.state,
            {skillTagList = [], totalCount = 0, userList = [], progress} = this.props;

        sortedInfo = sortedInfo || {};
        skillTagList ? skillTagList.map((item, index) => item.key = index) : null;
        userList.map((item, index) =>
        {
            item.key = index + 1;
            item.name = this.state.currentTagName
        });

        const pagination = {
            showQuickJumper: true,
            defaultCurrent: 1,
            total: totalCount,
            current: this.state.currentPage,
            showTotal: (total) => {
                return getLangTxt("total", total);
            },
            onChange: (pageNumber) =>
            {
                this.setState({currentPage: pageNumber});
                this.nextTagListPageData(pageNumber);
            }
        };

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        return (
            <div className='skillTagComp'>
                <Form className="skillTagForm">
                    <div className='quality-testing-body'>
                        <Button disabled className="createTagBtn" type="primary" >{getLangTxt("setting_skill_tag_add")}</Button>
                        <ScrollArea
                            speed={1}
                            horizontal={false}
                            className="skillScrollArea">
                            <Table columns={this.getTagsListColumns(sortedInfo, currentPage)} dataSource={skillTagList}
                                pagination={pagination} onChange={this.handleChange.bind(this)}/>
                        </ScrollArea>
                    </div>
                    {
                        this.state.isTagDetailShow ?
                            <NTModal title={getLangTxt("kpi_detail")} footer={false} width={544}
                                className="quality-testing-remove quality-testing-remove_first" visible
                                onCancel={this.hideTagDetail.bind(this)}>
                                <Table columns={this.columnCheck} dataSource={userList} pagination={false}
                                    scroll={{x: "hidden", y: 367}}/>
                            </NTModal> : null
                    }

                    {
                        this.state.isRemoveTagShow ? this.showDeleteModal() : null
                    }
                </Form>
                {
                    getProgressComp(progress)
                }
            </div>
        )
    }
}

SkilltagReadOnly = Form.create()(SkilltagReadOnly);

function mapStateToProps(state)
{
    return {
        skillTagList: state.skilltag.data,
        totalCount: state.skilltag.totalCount,
        userList: state.skilltagList.list,
        progress: state.skilltag.progress
    };
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({
        getSkillTagList, getSkillTagUserList, newSkillTag, removeSkillTag, editSkillTag
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SkilltagReadOnly);
