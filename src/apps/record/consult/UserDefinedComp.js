import React from 'react';
import {Form, Checkbox, Select} from 'antd';
import '../css/exportModal.less';
import {bglen} from "../../../utils/StringUtils";
import ScrollArea from 'react-scrollbar';

const FormItem = Form.Item, Option = Select.Option;

class UserDefinedComp extends React.PureComponent {
    constructor(props)
    {
        super(props);
        this.state={
            exportFileType: "xlsx",
            indeterminate: false,
            checkedAll: false
        }
    }

    judgeTitleSpace(rule, value, callback)
    {
        if (value && typeof value !== "string")
            return callback();

        if(value && value.trim() !== "" && bglen(value) <= 20)
        {
            callback();
        }
        callback(" ");
    }

    /*全选条件*/
    handleSelectAll(e)
    {
        let checked = e.target.checked ? 1 : 0;
        this.exportData.forEach(item =>
        {
            if (item.fieldList && item.fieldList.length)
                item.fieldList.forEach(fieldItem => fieldItem.isChecked = checked)
        });
        this.getCheckedValue();
    }

    /*获取条件check框值*/
    onFieldCheck(fieldList, checkedValue)
    {
        fieldList.forEach(fieldItem => fieldItem.isChecked = 0);
        checkedValue.forEach(item => {
            let checkedItem = fieldList.find(fieldItem => fieldItem.fieldId === item) || {};

            checkedItem.isChecked = 1;
        });
        this.getCheckedValue();
        this.forceUpdate();
    }

    componentWillReceiveProps(nextProps)
    {
        let {exportOption} = this.props,
            {exportOption: nextExportOption} = nextProps;

        if (!exportOption.length && nextExportOption.length)
            this.collectAllCheckedValToParents(nextExportOption);

    }

    collectAllCheckedValToParents(exportOption)
    {
        let checkedValue = [],
            itemLength = 0,
            indeterminate,
            checkedAll;

        exportOption.forEach(item => {
            item.fieldList.forEach(fieldItem => {
                itemLength ++;
                if (fieldItem.isChecked === 1)
                    checkedValue.push(fieldItem.fieldId);
            })
        });

        indeterminate = checkedValue.length && (checkedValue.length < itemLength);
        checkedAll = checkedValue.length === itemLength;

        this.props.getCheckedValue(checkedValue);
        this.setState({indeterminate, checkedAll})
    }

    /*值变化传递给上级*/
    getCheckedValue()
    {
        let {exportOption = []} = this.props;

        this.collectAllCheckedValToParents(exportOption)
    }

    /*获取条件下checkbox默认值*/
    getFieldCheckedValue(fieldList)
    {
        let checkedValue = [],
            filterList = fieldList.filter(item => item.isChecked === 1);

        filterList.forEach(item => {
            checkedValue.push(item.fieldId);
        });

        return checkedValue;
    }

    /*获取条件下checkbox*/
    getListCheckOption(fieldList)
    {
        let checkOption = [];

        fieldList.forEach((item, index) => {
            let obj = {};
            obj.label = item.fieldName;
            obj.value = item.fieldId;

            checkOption.push(obj);
        });

        return checkOption;
    }

    /*获取导出条件项*/
    getExportOptionListComp()
    {
        if (!this.exportData)
            return null;

        return this.exportData.map(item =>
            <FormItem
                label={item.typeName}
                key={item.typeName}
                className="exportConditionItem">
                <Checkbox.Group value={this.getFieldCheckedValue(item.fieldList)}
                    onChange={this.onFieldCheck.bind(this, item.fieldList)}
                    options={this.getListCheckOption(item.fieldList)}
                />
            </FormItem>
        )
    }

    get progress()
    {
        let {exportOption} = this.props;

        return exportOption.get("progress") || 3;
    }

    get exportData()
    {
        let {exportOption} = this.props;

        return exportOption || [];
    }

    render()
    {
        let {form} = this.props,
            {getFieldDecorator} = form,
            formItemLayout = {
                labelCol: {span: 4},
                wrapperCol: {span: 14}
            },
            taskTitleValue = form.getFieldValue("taskTitle"),
            taskTitleLen = Math.floor(bglen(taskTitleValue)/2);

        return (
            <ScrollArea speed={1} horizontal={false} smoothScrolling style={{height: '500px'}}>
                <Form hideRequiredMark={true}>
                    {/*<FormItem
                     {...formItemLayout}
                     label="任务名称："
                     className="exportTaskTitle"
                     help={taskTitleLen + '/10'}
                     hasFeedback>
                     {getFieldDecorator('taskTitle', {
                     initialValue: "",
                     rules: [{validator: this.judgeTitleSpace.bind(this)}]
                     })(
                     <Input/>
                     )}
                     </FormItem>*/}

                    <FormItem
                        {...formItemLayout}
                        className="exportTaskTitle">
                        {getFieldDecorator('allCheck')(
                            <Checkbox indeterminate={this.state.indeterminate} checked={this.state.checkedAll} onChange={this.handleSelectAll.bind(this)}>全选</Checkbox>
                        )}
                    </FormItem>

                    {
                        this.getExportOptionListComp()
                    }
                </Form>
            </ScrollArea>
        );
    }
}

UserDefinedComp = Form.create()(UserDefinedComp);

export default UserDefinedComp
