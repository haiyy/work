import React from 'react'
import { Button, Table, Modal, Input, Form } from 'antd';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import { getQualityTest, newQualityTest, editorQualityTest, removeQualityTest } from './action/qualityTest';
import './style/qualityTesting.scss';
import { getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import NTModal from "../../../components/NTModal";

let confirm = Modal.confirm, FormItem = Form.Item;

class QualityTesting extends React.PureComponent {
	constructor(props)
	{
		super(props);
		this.state = {
            isNewModelShow: false,
			filteredInfo: null,
			sortedInfo: null,
			modalName: "",
			record: null
		}
	}
    //页面渲染完成请求质检列表
	componentDidMount()
	{
		this.props.getQualityTest();
	}
    //开启新建质检框
	showModal()
	{
		this.setState({isNewModelShow: true, modalName: "新建标准"});
	}
    //点击保存新建或者修改质检数据
	handleOk()
	{
        let {form} = this.props;

        form.validateFields((errors) => {
            if (errors)
                return false;
            let data = {
                "content": form.getFieldValue("name"),
                "standard": parseFloat(form.getFieldValue("grad"))
            };

            if(this.state.modalName == "新建标准")
            {

                this.props.newQualityTest(data);

            }
            else if(this.state.modalName == "修改标准")
            {
                let {record} = this.state;

                Object.assign(record,data);
                /*data.qualityId = record.qualityId;
                 data.rank = record.rank;*/

                this.props.editorQualityTest(record);

            }
            this.setState({isNewModelShow: false});
        });
	}
    //取消框
	handleCancel(e)
	{
		this.setState({isNewModelShow: false});
	}
    //删除质检
	removeQuality(record)
	{
		let _this = this;
		confirm({
            title: '删除提示',
            width: '320px',
            iconType: 'exclamation-circle',
            className: 'warnTip',
			content: '是否确定删除此项？',
			onOk() {
				_this.props.removeQualityTest(record.qualityId);
			},
			onCancel() {
			}
		});
	}
    //获取编辑质检数据并弹框
	editorQuality(record)
	{
		this.setState({isNewModelShow: true, modalName: "修改标准", record: record});
	}
    //分页、排序、筛选变化时触发
	handleChange(pagination, filters, sorter)
	{
		console.log('Various parameters', pagination, filters, sorter);
		this.setState({
			filteredInfo: filters,
			sortedInfo: sorter
		});
	}
    //评分数据不可超过100
    getGradValue(e)
    {
        if (e.target.value > 100)
        {
            this.props.form.setFieldsValue({"grad":100})
        }else if (e.target.value < 0)
        {
            this.props.form.setFieldsValue({"grad":0})
        }
    }
    //页面数据加载失败从新加载
    reFreshFn()
    {
        this.props.getQualityTest();
    }

	render()
	{
		let {sortedInfo, filteredInfo, modalName} = this.state, {getFieldDecorator} = this.props.form;
		sortedInfo = sortedInfo || {};
		filteredInfo = filteredInfo || {};

		const reg = /^[0-9\-]+$/,
            columns = [{
			key: 'rank',
			dataIndex: 'rank'
		}/*, {
			key: 'checked',
			render: (record) =>
			{
				return (
					<div><Checkbox onChange={this.onChange.bind(this, record)}></Checkbox></div>
				)
			}
		}*/, {
			key: 'content',
			title: '质检标准',
			dataIndex: 'content'
		}, {
			key: 'standard',
			title: '评分',
			dataIndex: 'standard',
			sorter: (a, b) => a.standard - b.standard,
			sortOrder: sortedInfo.columnKey === 'standard' && sortedInfo.order
		}, {
			key: 'remove',
			title: '操作',
			render: (record) =>
			{
				return (
					<div>
						<i style={{cursor: 'pointer'}} className="icon-bianji iconfont"
                           onClick={this.editorQuality.bind(this, record)}/>
						<i style={{cursor: 'pointer', marginLeft: "10px"}} className="icon-shanchu iconfont"
                           onClick={this.removeQuality.bind(this, record)}/>
					</div>
				)
			}
		}], isEdit = modalName === "修改标准";

		let {state:data = [],progress} = this.props,
            num = data.length,
            {record} = this.state;

        if(progress === LoadProgressConst.LOAD_FAILED)
            return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

        return (
			<div className='quality-testing'>
				<div className='quality-testing-body'>
					<div className='bth'>
						<Button style={{marginRight: '10px'}} type="primary"
						        onClick={this.showModal.bind(this)}>新建标准</Button>
						{/*<Button>删除</Button>*/}
                        {/*<Button style={{float: 'right', marginLeft: '10px'}}><i style={{cursor: 'pointer'}}
						                                                        className="icon-xiangxia iconfont"/></Button>
						<Button style={{float: 'right'}}><i style={{cursor: 'pointer'}}
						                                    className="icon-xiangshang iconfont"/></Button>*/}
					</div>

					<div>
						<Table onChange={this.handleChange.bind(this)} columns={columns} dataSource={data}/>
						<p className='info-num' style={{display: "inline"}}>信息条目共<span>{num}</span>条</p>
					</div>
				</div>

				{this.state.isNewModelShow ?
					<NTModal style={{ height: "314px", marginTop: "-157px", top: "50%" }}
					       className="quality-testing-new" title={ modalName } visible={true}
					       onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}>
						<div className='quality-new-body'>
							<p>质检标准</p>
							<FormItem>
								{
                                    getFieldDecorator('name',
                                    {
                                        initialValue: record && isEdit ? record.content : "",
                                        rules: [{required: true, max: 200,message: ' '}]
                                    })
                                    (
                                        <Input style={{width: '100%'}}/>
                                    )
                                }
							</FormItem>
							<p>评分</p>
							<FormItem>
								{
                                    getFieldDecorator('grad',
                                    {
                                        initialValue: record && isEdit ? record.standard : "",
                                        rules:[{required: true, pattern: reg, message: ' '}]
                                    })
                                    (
                                        <Input onKeyUp={this.getGradValue.bind(this)} type="number" min="1" max="100" style={{width: '100%'}}/>
                                    )
                                }
							</FormItem>
						</div>
					</NTModal> : null
                }

                {
                    getProgressComp(progress)
                }
			</div>
		)
	}
}

QualityTesting = Form.create()(QualityTesting);

function mapStateToProps(state)
{
	return {
		state: state.qualityTest.data,
        progress: state.qualityTest.progress
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getQualityTest, newQualityTest, editorQualityTest, removeQualityTest}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(QualityTesting);
