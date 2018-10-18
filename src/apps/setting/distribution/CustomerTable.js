import React from 'react'
import { Table, Input, InputNumber } from 'antd';
import { getLangTxt, shallowEqual } from "../../../utils/MyUtil";
import { connect } from 'react-redux';

class CustomerTable extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
            selectedRows:[],
            selectedAll:false,
            editItem:"",
            editType:"",
            selectedRowKeys: []
        };
        this._selectedRows = [];
	}

    columns = [
        {
            title: getLangTxt("kf"),
            key: 'userId',
            width: '15%',
            render: (text, record) => {
               return (
                    record.externalname
                        ?
                        <span>
                            {record.nickname}({record.externalname})
                        </span>:<span></span>
                )
            }
        },
        {
            title: getLangTxt("setting_skill_tag"),
            key: 'tagId',
            width: '15%',
            render: (text, record) => {
                let {skillTagData} = this.props,
                    tagNameArr = [],
                    {tagId = []} = record;

                tagId && tagId.forEach((currentTagId) => {
                    skillTagData && skillTagData.forEach(tagId => {
                        if(currentTagId == tagId.tagid)
                        {
                            let tagName = tagId.tagname;
                            tagNameArr.push(tagName);
                        }
                    });
                });

                return ( <span>{tagNameArr.join(",")}</span> )
            }
        },
        {
            title: getLangTxt("setting_distribution_priority"),
            key: 'level',
            width: '22%',
            render: (text, record) => {
                let {radioValue} = this.props;

                return <div className="editConversationNum"
                            onDoubleClick={radioValue === 0 ? this.editConversationNum.bind(this,record.userId,"level") : null}>
                    {
                        record.userId === this.state.editItem && this.state.editType === 'level'
                            ?
                            <InputNumber
                                min={1} max={20}
                                className="customerTableIpt"
                                autoFocus defaultValue={record.level || 1}
                                onBlur={this.saveEditNumData.bind(this, 'level', record)}
                            />
                            :
                            <span>{record.level || 1}</span>
                    }
                </div>
            }
        },
        {
            title: getLangTxt("setting_account_reception_sametime_set"),
            key: 'maxConcurrentConversationNum',
            width: '24%',
            render: (text, record) => {
                let {radioValue} = this.props;

                return <div className="editConversationNum"
                            onDoubleClick={radioValue === 0 ? this.editConversationNum.bind(this,record.userId,"maxConcurrentConversationNum") : null}
                        >
                            {
                                record.userId === this.state.editItem && this.state.editType === 'maxConcurrentConversationNum'
                                    ?
                                <InputNumber
                                    min={1} className="customerTableIpt"
                                    autoFocus defaultValue={record.maxConcurrentConversationNum || 1}
                                    onBlur={this.saveEditNumData.bind(this, 'maxConcurrentConversationNum', record)}
                                />
                                :
                                <span>{record.maxConcurrentConversationNum || 8}</span>
                            }
                        </div>
            }
        },
        {
            title: getLangTxt("setting_distribution_max"),
            key: 'maxConversationNum',
            width: '24%',
            render: (text, record) => {
                let {radioValue} = this.props;

                return <div className="editConversationNum"
                            onDoubleClick={radioValue === 0 ? this.editConversationNum.bind(this, record.userId, "maxConversationNum") : null}
                        >
                            {
                                record.userId === this.state.editItem && this.state.editType === 'maxConversationNum'
                                    ?
                                    <InputNumber
                                        min={-1} className="customerTableIpt"
                                        autoFocus defaultValue={record.maxConversationNum || -1}
                                        onBlur={this.saveEditNumData.bind(this, 'maxConversationNum', record)}
                                    />
                                    :
                                    <span>{record.maxConversationNum || (record.maxConversationNum == 0 ? record.maxConversationNum : -1)}</span>
                            }
                        </div>
            }
        }/*,
        {
            title: '订单转化率',
            key: '6',
            render: (text, record) => (
                <span>
		                    0%
		                </span>
            )
        },
        {
            title: '满意度',
            key: '7',
            render: (text, record) => (
                <span>
		                     0%
		                </span>
            )
        },
        {
            title: '首次响应时间',
            key: '8',
            render: (text, record) => (
                <span>
		                    0秒
		                </span>
            )
        }*/
    ];

	// shouldComponentUpdate(nextProps, nextState)
	// {
	// 	return !shallowEqual(nextProps, this.props) || !shallowEqual(nextState, this.state);
	// }

    componentDidMount()
    {
        if(this.props.link === 'editor')
        {
            let {suppliers = []} = this.props,
                selectedRowKeys = [];

            suppliers.map((item) => {
                selectedRowKeys.push(item.userId);
            });

                this.setState({selectedRowKeys});
                this._selectedRows = suppliers;
        }else
        {
            this.setState({selectedRowKeys:[]});
            this._selectedRows = [];
        }
    }

    //双击编辑优先级  接待量
    editConversationNum(userId, type)
    {
        this.setState({editItem: userId, editType: type})
    }
    //blur保存编辑信息
    saveEditNumData(editType, record, e)
    {
        let editValue = parseInt(e.target.value);
        switch(editType)
        {
            case "level":
                record.level = editValue;
                break;
            case 'maxConcurrentConversationNum':
                record.maxConcurrentConversationNum = editValue;
                break;
            case 'maxConversationNum':
                record.maxConversationNum = editValue;
                break;
        }

        for (var i = 0; i < this._selectedRows.length; i++)
        {
        	if (this._selectedRows[i].userId === record.userId)
            {
                Object.assign(this._selectedRows[i], record)
            }
        }

        this.setState({editItem: "", editType: ""});
    }

    delUnselectRowItems(tableData, selectedData)
    {
        let dealedVal = [],
            dealedRows = [];

        tableData.forEach(tableItem => {
            selectedData.forEach(item => {
                if (item.userId === tableItem.userId)
                {
                    dealedVal.push(item.userId);
                    dealedRows.push(item);
                }
            })
        });

        return {dealedVal, dealedRows}
    }

    componentWillReceiveProps(nextProps, nextState) {
        let {groupData = []} = this.props,
            {groupData: nextGroupData = []} = nextProps,
            selectedRowInfo;

        if (groupData.toString() != nextGroupData.toString())
            {
                selectedRowInfo = this.delUnselectRowItems(nextGroupData, this._selectedRows) || {};

                this.setState({selectedRowKeys: selectedRowInfo.dealedVal});
                this._selectedRows = selectedRowInfo.dealedRows;

                this.props.getTableData(this._selectedRows);
            }
    }

	render()
	{
		const rowSelection = {
                selectedRowKeys: this.state.selectedRowKeys,
                type: "checkbox",
                onChange: (selectedRowKeys, selectedRows) => {
                    this.setState({selectedRowKeys});
                },
                getCheckboxProps: record => ({
                    disabled: record.name === 'Disabled User'
                }),
                onSelectAll: (selected, selectedRows, changeRows)=> {
                    if (selected) {
                        changeRows.map((item) => {
                            this._selectedRows.push(item);
                        })
                    }
                    else
                    {
                        changeRows.map((selectedItem) => {
                            this._selectedRows = this._selectedRows.filter(item => {
                                return item.userId != selectedItem.userId
                            });
                        })
                    }
                    this.props.getTableData(this._selectedRows);
                },
                onSelect: (record, selected, selectedRows) => {

                    this.setState({selectedRows});
                    if (selected)
                    {
                        this._selectedRows.push(record);
                    }else
                    {
                        this._selectedRows.map((item, index) => {
                            if (item.userId === record.userId)
                            {
                                this._selectedRows.splice(index,1)
                            }
                        });
                    }

                    this.props.getTableData(this._selectedRows);
                }
            },
            pagination = {
                showQuickJumper: true,
                // current: this.props.currentPage,
                total: this.props.groupDataCount,
                onChange: (pageNumber) => {
                    // this.props.getNextPageTags(pageNumber, this.props.currentSkillTag);
                }
            },
            {
                customerData = [],
                skillTagData = [],
                radioValue = 0
            } = this.props;

		return (
			<div className="customerTable">
                {
                    radioValue === 0 ?
                        <Table columns={this.columns} rowSelection={rowSelection}
                            dataSource={customerData} pagination={pagination}/>
                        :
                        <Table columns={this.columns} dataSource={customerData}
                            pagination={pagination}/>
                }

			</div>
		)
	}
}
function mapStateToProps(state)
{
    return {
        groupData: state.distributeReducer.groupData
    }
}

export default connect(mapStateToProps)(CustomerTable);
