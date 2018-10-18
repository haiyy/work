import React from 'react';
import { render } from 'react-dom';
import {  Form, Input, Button, Upload, Icon ,DatePicker,TreeSelect ,Tree,message} from 'antd';
import { connect } from "react-redux";
import { bindActionCreators } from 'redux';
import {stringLen} from "../../../utils/StringUtils";
import { Map, fromJS } from 'immutable';
import {downloadTemplate} from "../redux/reducers/calloutTaskReducer";
import {getBindGroupList} from "../redux/reducers/receptiongroupReducer";
import { configProxy, loginUserProxy } from "../../../utils/MyUtil";
import "../view/style/callOutTask.less";
import "../view/style/formContent.less";
import Modal from "../../../components/xn/modal/Modal";
import { confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";
const FormItem = Form.Item;
const {TextArea} = Input;
import moment from 'moment';
const RangePicker = DatePicker.RangePicker;
const TreeNode = Tree.TreeNode;
//const confirm = Modal.confirm;

class CalloutTaskComponent extends React.Component { //子组件
	constructor(props)
	{
		super(props);
        console.log(props)
		this.state = {
			modalShow: props.modalShow,
			visible: props.visible,
			confirmDirty: false,
            ruleNumLength:0,
            value:'',
            fileList: [],
            uploadStaus:"init",
            uploadAlertText:"",
            startValue: null,
            endValue: null,
            endOpen: false
		}

	}

    componentDidMount()
    {
        this.groupData();

        this.disabledStartDate = this.disabledStartDate.bind(this);
        this.disabledEndDate = this.disabledEndDate.bind(this);
        this.onChange = this.onChange.bind(this);
        this.onStartChange = this.onStartChange.bind(this);
        this.onEndChange = this.onEndChange.bind(this);
        this.handleStartOpenChange = this.handleStartOpenChange.bind(this);
        this.handleEndOpenChange = this.handleEndOpenChange.bind(this);
    }

    componentWillReceiveProps(props) {
        let {queryList, actionsType} = props, {startTime, endTime} = queryList;
        if (actionsType != this.props.actionsType && actionsType != "edit") {//创建
            this.setState({
                startValue: moment(),
                endValue: moment().add('hours',2)
            });
        } else if (startTime && endTime && actionsType == "edit" && this.props.queryList && (this.props.queryList.startTime!= startTime || this.props.queryList.endTime != endTime)) {
            this.setState({
                startValue: moment(startTime),
                endValue: moment(endTime)
            });
        }
        return true;
    }

    groupData() {
        let {actions} = this.props;

        actions.getBindGroupList();
    }

	handleSubmit = (e) => {

        let {uploadStaus} = this.state;
        e.preventDefault();
        
        if(!uploadStaus){
            confirm({
                title: '提示',
                content: '请上传正确的附件！',
                onOk()
                {
                },
                onCancel()
                {},
            });
        }else{
            this.props.form.validateFieldsAndScroll((err, formData) => {
                if(!err)
                {
                    this.props.onformData(formData);
                    this.setState({
                        uploadStaus:"init",
                        fileList:[],
                    })
                }
            });
        }

	}

    onDescribe(e){
	    this.setState({
            ruleNumLength:e.target.value
        })
    }

    renderTreeNodes(data) {
        return data.map(((item)=> {
            item.value = item.groupName;
            if (item.users) {
                let disableCheckbox = item.users.length <= 0;
                return <TreeNode title={item.groupName} key={item.groupId} dataRef={item} value={item.groupName} disableCheckbox={disableCheckbox}>
                    {item.users.map((i)=> {
                        i.groupName = item.groupName;
                        return <TreeNode title={i.nickName} key={i.userId} dataRef={i} isLeaf value={i.attendantAccount}/>;
                    })}
                </TreeNode>
            }
            return (<div>出错</div>);
        }))
    }

    onGroupChange(value, label, extra) {
        console.log(value);

        if (value == "false") {
            return;
        }
        this.setState({
            value: value,
        });
    }

    onFileUpload(info)
    {
        let {data,code,msg}=info.file.response,
            uploadStaus=code,
            flag=false,
            uploadAlertText=msg;
 
            if(uploadStaus==200){
               flag = true;
               this.setState({
                   uploadStaus:flag,
                   fileList:data
               })
           }else{
               this.setState({
                   uploadStaus:flag,
                   uploadAlertText
               })
           }

        console.log("uploadStaus",uploadStaus)
        this.props.ontaskNumber(data)
    }

    onDownLoadFile(){

        window.open(`${configProxy().xNccRecordServer}/task/template/`,'_self');
    }

    get initGroupName() {
        let {queryList} = this.props,
            {list = []} = queryList,
            arr = [],
            recordGroup=[];

        list.map((item)=> {
            recordGroup.push(item.groupId);
            arr.push(item.attendantAccount);
        })
        return arr;
    }

    onhandleCancel()
    {
        this.setState({
            uploadStaus:"init",
            fileList:[],
        })

        this.props.handleCancel();
    }

    get  disabledFlag(){
        let flag=false;

        let {actionsType} = this.props;

        if(actionsType=='edit'){
            flag=true;
        }
        return flag;
    }

    onBeforeUpload(file,fileList){
        console.log(file,fileList)
    }

    /** datepicker start*/
    disabledStartDate(startValue) {
        let disabled = startValue ? startValue.isBefore(moment(Date.now())) : false;
        if (disabled) return disabled;

        const endValue = this.state.endValue;
        if (!startValue || !endValue) {
            return false;
        }
        return startValue.valueOf() > endValue.valueOf();
    }

    disabledEndDate(endValue) {
        let disabled = endValue ? endValue.isBefore(moment(Date.now())) : false;
        if (disabled) return disabled;

        const startValue = this.state.startValue;
        if (!endValue || !startValue) {
            return false;
        }
        return endValue.valueOf() <= startValue.valueOf();
    }

    onChange(field, value) {
        this.setState({
          [field]: value,
        });
    }
    
    onStartChange(value) {
        this.onChange('startValue', value);
    }

    onEndChange(value) {
        this.onChange('endValue', value);
    }

    handleStartOpenChange(open) {
        if (!open) {
            this.setState({ endOpen: true });
        }
    }

    handleEndOpenChange(open) {
        this.setState({ endOpen: open });
    }
    /** datepicker end */

    render()
	{
        let siteId = loginUserProxy().siteId;
        let { value, uploadAlertText, uploadStaus="init", endOpen, startValue, endValue }=this.state;
		const { modalShow, visible, treeGroupList, queryList, actionsType } = this.props,
              { taskName, describe }=queryList,
		      { getFieldDecorator } = this.props.form,
              formItemLayout = {
			    labelCol: {span: 5},
			    wrapperCol: {span: 19},
		        },
            tProps = {
                value: value,
                disabled: this.disabledFlag,
                onChange: this.onGroupChange.bind(this),
                treeCheckable: true,
                multiple: true,
                placeholder:'请选择',
                treeDefaultExpandAll: false,
                dropdownMatchSelectWidth:true,
                treeCheckStrictly:false,
                treeNodeFilterProp:"title",
                style: {
                    width: 403,
                    minHeight:30,
                    maxHeight:100,
                },
                dropdownStyle:{height:"320px"},
        },
            props = {
                name: 'file',
                multiple:false,
                listType:'file',
                accept: '.csv,.xls,.xlsx',
                beforeUpload:this.onBeforeUpload.bind(this),
                onChange:this.onFileUpload.bind(this),
                action:`${configProxy().xNccRecordServer}/task/upload/${siteId}`
            };
            let startDateDisabled = false;
            if (actionsType == "edit" && this.props.queryList.status == 6) {//编辑外呼任务-暂停，开始时间不可编辑
                startDateDisabled = true;
            }
		return (
			<div>
				{
					modalShow ?
						<Modal
							visible={visible}
							title={actionsType == 'edit' ? "编辑外呼任务" : "新建外呼任务"}
							okText="保存"
                            width="543px"
                            id="callOutTaskModal"
                            style={{top:"200px"}}
							onOk={this.handleSubmit.bind(this)}
							onCancel={this.onhandleCancel.bind(this)}
						>
							<Form onSubmit={this.handleSubmit.bind(this)}>
								<FormItem {...formItemLayout} label="任务名称">
									{
										getFieldDecorator('taskName', {
											rules: [{
												required: true,
                                                message:"任务名称不能为空 ",
											}],
                                            initialValue: actionsType == 'edit' ? taskName: '',
                                        })(<Input maxlength={50}/>)
									}
								</FormItem>
								<FormItem {...formItemLayout} label="任务执行时间">
									{
										getFieldDecorator('startTime', {
											rules: [{
												required: true,
                                                message:" ",
											}],
                                            initialValue: startValue
										})
                                        (<DatePicker
                                            style={{width:200}}
                                            disabledDate={this.disabledStartDate}
                                            showTime
                                            format="YYYY-MM-DD HH:mm:ss"
                                            onChange={this.onStartChange}
                                            onOpenChange={this.handleStartOpenChange}
                                            disabled={startDateDisabled}
                                            allowClear={false}
                                          />
                                        )
                                    }
                                    {
                                        getFieldDecorator('endTime', {
											rules: [{
												required: true,
                                                message:" ",
											}],
                                            initialValue: endValue
                                        })
                                        (<DatePicker
                                            style={{width:200, marginLeft:3}}
                                            disabledDate={this.disabledEndDate}
                                            showTime
                                            format="YYYY-MM-DD HH:mm:ss"
                                            onChange={this.onEndChange}
                                            open={endOpen}
                                            onOpenChange={this.handleEndOpenChange}
                                            allowClear={false}
                                          />)
                                    }
								</FormItem>

								<FormItem {...formItemLayout} label="任务描述">
									{getFieldDecorator('describe', {
                                        rules: [{
                                            required: true,
                                            message:"任务描述不能为空 ",
                                        }],
                                        initialValue: actionsType == 'edit' ? describe: '',
                                    })(
										<TextArea maxlength={140}  style={{height:"100px",resize:"none"}}/>
									)}

								</FormItem>
                                {actionsType !== 'edit' ?
                                    <FormItem
                                        {...formItemLayout}
                                        label="外呼用户"
                                    >
                                        {getFieldDecorator('enclosure', {
                                        rules: [{
											required: true,
                                            message:"请上传附件",
										}],
                                        })(
                                            <Upload {...props} >
                                                <span className="enclosure-Upload"><Icon type="paper-clip"/>上传附件</span>
                                                {uploadStaus && uploadStaus!="init"?
                                                    <span className="enclosure-Success"><Icon type="check-circle"/>上传成功</span>
                                                    :!uploadStaus  && uploadStaus!="init"?
                                                    <span className="enclosure-Warning"><Icon type="exclamation-circle" />{uploadAlertText}</span>
                                                    :null
                                                }
                                            </Upload>
                                        )}
                                        <p>
                                            请先下载<a href="javascript:void(0)" onClick={this.onDownLoadFile.bind(this)}>外呼用户模版</a>,填写完成后上传（支持csv、xls、xlsx格式文件）
                                        </p>
                                    </FormItem>
                                :null
                                }

								<FormItem
									{...formItemLayout}
									label="负责坐席"
								>
									{getFieldDecorator('userIds', {
                                	rules: [{
                                        required: true,
                                        message:" ",
                                    }],
                                        initialValue: actionsType == 'edit' ? this.initGroupName : '',
									})(
                                        <TreeSelect {...tProps} >
                                            {this.renderTreeNodes(treeGroupList)}

                                        </TreeSelect>
									)}
								</FormItem>


							</Form>
						</Modal>
						: ''
				}
			</div>
		)
	}
}


const mapStateToProps = (state) => {
    let {receptiongroupReducer,calloutTaskReducer} = state;
    return {
        queryList: calloutTaskReducer.get("queryList") || {},
        treeGroupList: receptiongroupReducer.get("bindgroupList") || [],

    };
}

const mapDispatchToProps = (dispatch) => ({
    actions: bindActionCreators({getBindGroupList,downloadTemplate}, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(Form.create()(CalloutTaskComponent));
