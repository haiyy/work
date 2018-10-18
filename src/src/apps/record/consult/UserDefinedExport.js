import React from 'react';
import {Form, Input, Checkbox, Select, Button, Modal} from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import '../css/exportModal.less';
import NTModal from "../../../components/NTModal";
import {bglen} from "../../../utils/StringUtils";
import { configProxy, token, downloadByATag, getLangTxt } from "../../../utils/MyUtil";
import {getUserDefinedExport} from "../redux/userDefinedExportReducer";
import UserDefinedComp from "./UserDefinedComp";

const Option = Select.Option;

class UserDefinedExport extends React.PureComponent {
    constructor(props)
    {
        super(props);
        this.state={
            exportFileType: ".xlsx",
            columnFieldIds: []
        }
    }

    componentDidMount() {
        this.props.getUserDefinedExport(3)
    }

    getCheckedValue(columnFieldIds)
    {
        this.setState({columnFieldIds});

    }

    handleCancel()
    {
        this.props.handleOpenExportPage();
    }

    handleOK()
    {
        let {search = {}} = this.props,
            {exportFileType, columnFieldIds = []} = this.state,
            copySearch = {...search};

        if (!search || !this.exportData)
            return;

        if (!columnFieldIds.length)
        {
            Modal.warning({
                title: getLangTxt("err_tip"),
                iconType: 'exclamation-circle',
                className: 'errorTip',
                content: getLangTxt("record_table_head_export_note"),
                width: '320px',
                okText: getLangTxt("sure")
            });
            return;
        }


        copySearch.page = 1;

        let valueStringify = encodeURIComponent(JSON.stringify(copySearch)),
            tokenValue = token(),
            exportUrl = configProxy().nCrocodileServer + '/conversation/list/export?where=' + valueStringify + '&suffix=' + exportFileType + '&fieldIds=' + columnFieldIds + '&token=' + tokenValue;

        downloadByATag(exportUrl);
        this.props.handleOpenExportPage();
    }

    /*导出文件类型选择*/
    getExportType(exportFileType)
    {
        this.setState({exportFileType});
    }

    get progress()
    {
        let {exportOption} = this.props;

        return exportOption.get("progress") || 3;
    }

    get exportData()
    {
        let {exportOption} = this.props;

        return exportOption.get("exportData") || [];
    }

    render()
    {
        let {exportFileType} = this.state,
            modalFooter = [
                <Select className="exportTypeSelect" value={exportFileType} onChange={this.getExportType.bind(this)}>
                    <Option value=".xlsx">导出为XLSX格式</Option>
                    <Option value=".csv">导出为CSV格式</Option>
                </Select>,
                <Button key="back" onClick={this.handleCancel.bind(this)}>取消</Button>,
                <Button key="submit" type="primary" onClick={this.handleOK.bind(this)}>确定</Button>
            ];

        return (
            <NTModal title={getLangTxt("export")} visible width={1000} wrapClassName="consultExportModal" onCancel={this.handleCancel.bind(this)} footer={modalFooter}>
                <div className="userDefinedExportWrapper">
                    <UserDefinedComp isExport={true} exportOption={this.exportData} getCheckedValue={this.getCheckedValue.bind(this)}/>
                </div>
            </NTModal>
        );
    }
}

UserDefinedExport = Form.create()(UserDefinedExport);

function mapStateToProps(state) {

    return {
        exportOption: state.getExportOption
    };
}

function mapDispatchToProps(dispatch)
{
    return bindActionCreators({
        getUserDefinedExport
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDefinedExport);
