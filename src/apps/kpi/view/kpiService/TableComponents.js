import React,{ Component, Fragment } from 'react';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import {Button, Table, Icon } from 'antd';
import { get } from "immutable";
import "../scss/TableComponents.scss";

class TableComponents extends Component{
    constructor(props){
        super(props)
        this.state = {
            scrollX:null
        }
    }

    render()
    {
        const { columns, data, pageSizeInd, scrollY } = this.props;
        let arr = columns,
            totalWidth = arr.reduce((accumulator, item) => accumulator + parseInt(item.width), 0);
        return(
              <Table columns={columns} dataSource={data} scroll={{ x: totalWidth, y: scrollY || false }} pagination={{pageSize:pageSizeInd} } useFixedHeader={false} />
        )
    }

    componentDidMount() {
        let antTableRow = document.getElementsByClassName("ant-table-row");
        for (let i = 0; i < antTableRow.length; i++){
            if (i % 2 != 0){
                antTableRow[i].classList.add("changeColor");
            }
        }
    }
}

export default TableComponents
