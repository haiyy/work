import React from 'react';
import { connect } from 'react-redux';
import { Table } from 'antd';
import '../public/styles/enterpriseSetting/tableAndTurnpage.scss';
import { getLangTxt } from "../utils/MyUtil";

class NTTableWithPageRecord extends React.PureComponent {

    constructor(props)
    {
        super(props);
    }

    pageChange(thePage)
    {
        this.props.selectOnChange(thePage);
    }

    onRowClick(record, index, event)
    {
        if(typeof this.props.onRowClick === "function")
        {
            this.props.onRowClick(record, index);
        }
    }

    render()
    {
        const pagination = {
            total: this.props.total,
            showQuickJumper: true,
            current: this.props.currentPage || 1,
            onChange: this.pageChange.bind(this),
            showTotal: (total) => {
                return getLangTxt("total", total);
            }
        };

        return (
            <div className="tableAndTurnpage">
                <Table className="recordTable" scroll={{x: this.props.scrollX}} pagination={pagination}
                    dataSource={this.props.dataSource} columns={this.props.columns || []}
                    onRowClick={this.onRowClick.bind(this)}/>
            </div>
        );
    }
}

export default NTTableWithPageRecord
