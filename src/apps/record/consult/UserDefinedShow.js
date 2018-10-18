import React from 'react';
import {Form, Input, Checkbox, Select, Button} from 'antd';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import '../css/exportModal.less';
import { configProxy, token, downloadByATag } from "../../../utils/MyUtil";
import {getUserDefinedExport} from "../redux/userDefinedExportReducer";
import {updateTableHeader, getConsultList} from "../redux/consultReducer";
import UserDefinedComp from "./UserDefinedComp";
import {getLangTxt} from "../../../utils/MyUtil";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

class UserDefinedExport extends React.PureComponent {
    constructor(props)
    {
        super(props);
        this.state={
            checkedFieldVal:[]
        }
    }

    componentDidMount() {
        this.props.getUserDefinedExport(2)
    }

    getCheckedValue(checkedFieldVal)
    {
        this.setState({checkedFieldVal})
    }

    handleCancel()
    {
        this.props.handleOpenExportPage();
    }

    handleOK()
    {
        let {checkedFieldVal = []} = this.state;

        if (!checkedFieldVal.length)
            warning({
                title: getLangTxt("err_tip"),
                iconType: 'exclamation-circle',
                className: 'errorTip',
                content: getLangTxt("record_table_head_note"),
                width: '320px',
                okText: getLangTxt("sure")
            });

        this.props.updateTableHeader({filedIds: checkedFieldVal}).then(result => {
            if (result.code == 200)
            {
                this.props.refreshList(1);
                this.props.handleOpenExportPage();
            }
        });
    }

    //恢复默认
    handleResetVal()
    {
        if(!this.exportData)
            return;
        let checkedFieldVal = [];
        this.exportData.forEach(item => {
            item.fieldList.forEach(fieldItem => {
                if (fieldItem.isDefault == 1)
                    checkedFieldVal.push(fieldItem.fieldId);
                fieldItem.isChecked = fieldItem.isDefault;
            })
        });
        this.props.updateTableHeader({filedIds: checkedFieldVal}).then(result =>
        {
            if (result.code == 200)
            {
                this.props.refreshList(1);
                this.forceUpdate();
                this.props.handleOpenExportPage();
            }
        });
    }

    get progress()
    {
        let {exportOption} = this.props;

        return exportOption.get("progress") || 3;
    }

    get exportData()
    {
        let {exportOption} = this.props;

        if (!exportOption)
            return [];

        return exportOption.get("exportData") || [];
    }

    render()
    {
        let modalFooter = [
                <Button className="exportTypeSelect" type="primary" onClick={this.handleResetVal.bind(this)}>恢复默认</Button>,
                <Button key="back" onClick={this.handleCancel.bind(this)}>取消</Button>,
                <Button key="submit" type="primary" onClick={this.handleOK.bind(this)}>确定</Button>
            ];

        return (
            <Modal title="选择显示内容" visible width={1000} wrapClassName="consultExportModal" onCancel={this.handleCancel.bind(this)} footer={modalFooter}>
                <div className="userDefinedExportWrapper">
                    <UserDefinedComp exportOption={this.exportData} getCheckedValue={this.getCheckedValue.bind(this)}/>
                </div>
            </Modal>
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
        getUserDefinedExport,
        updateTableHeader,
        getConsultList
    }, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(UserDefinedExport);
