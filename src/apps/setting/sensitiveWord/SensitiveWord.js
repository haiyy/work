import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Switch, Alert, Table, Input, Form, Tooltip } from 'antd';
import { getSensitive, setSensitive } from './action/sensitiveWord';
import { getLangTxt, getProgressComp } from "../../../utils/MyUtil";
import LoadProgressConst from "../../../model/vo/LoadProgressConst";
import { ReFresh } from "../../../components/ReFresh";
import Modal,{ confirm, info, error, success, warning } from "../../../components/xn/modal/Modal";

const FormItem = Form.Item;

class SensitiveWord extends Component {
	constructor(props)
	{
		super(props);
		this.state = {
			visible1: false,
			warning: false
		};
	}

	componentDidMount()
	{
		this.props.getSensitive();
	}

	showModal()
	{
		this.setState({
			visible1: true

		});
	}

	showModal2(record)
	{
		if(record.name != "")
		{
			this.getClearModal()
		}

	}

	//关闭警告
	_closeWarning(e)
	{
		this.setState({
			warning: false
		});
	};

	uniqueValue(array)
	{
		let afterFilterValue = [];//临时数组
		for(var i = 0; i < array.length; i++)
		{
			if(afterFilterValue.indexOf(array[i]) == -1) afterFilterValue.push(array[i]);
		}
		return afterFilterValue;
	}

	handleOk()
	{
		let value = this.props.form.getFieldValue("name"),
			word = value.split(/[,，]/g),
            isSingleLetter = /^[A-Za-z]+$/;

		word = this.uniqueValue(word);

        let singleLetterItem = word.find(item => item.length === 1 && isSingleLetter.test(item));

		if(word.length > 50 || value.length - word.length + 1 >= 200 || singleLetterItem)
		{
			this.setState({
				warning: true
			});
			return;

		}
		let data = {
			"sensitiveWords": {
				"filterWay": 0,
				"filterSupplier": this.props.form.getFieldValue("filterSupplier") ? 1 : 0,
				"replace": "*",
				"words": word || ""
			}
		};
		this.props.setSensitive(data);
		this.setState({
			visible1: false,
			warning: false
		});
	}

	handleCancel()
	{
		this.setState({
			visible1: false,
			warning: false
		});
	}

	handleOk2()
	{
		let data = {
			"sensitiveWords": {
				"filterWay": 0,
				"filterSupplier": this.props.form.getFieldValue("filterSupplier") ? 1 : 0,
				"replace": "*",
				"words": []
			}
		};
		this.props.setSensitive(data);
	}

	changeIO(supplier, words)
	{
		let data = {
			"sensitiveWords": {
				"filterWay": 0,
				"replace": "*",
				"words": words || []
			}
		};
		if(supplier)
		{
			data.sensitiveWords.filterSupplier = 0;
		}
		else
		{
			data.sensitiveWords.filterSupplier = 1;
		}
		this.props.setSensitive(data);
	}

	reFreshFn()
	{
		this.props.getSensitive();
	}

	getClearModal()
	{
		confirm({
			title: '清空',
			width: '320px',
			content: '确定要清空词库吗?',
			iconType: 'exclamation-circle',
			className: 'warnTip',
			cancelText: '取消',
			okText: '确定',
			onOk: this.handleOk2.bind(this)
		});
	}

	render()
	{
		let {state, progress} = this.props, name = null, {getFieldDecorator} = this.props.form, supplier, words;

		if(state)
		{
			name = state.words && state.words.join("，");
			supplier = state.filterSupplier == 1;
			words = state.words
		}

		const columns = [{
			title: getLangTxt("setting_word_library"),
			dataIndex: 'name',
			key: 'name',
			render: text => <div>{text}</div>
		}, {
			title: getLangTxt("operation"),
			key: 'action',
			width: 100,
			render: (text, record) => {
				let _style;
				if(record.name == "")
				{
					_style = {color: "#9a9a9a"}
				}
				return (
					<span>
                      <a>
                          <Tooltip placement="bottom" title={getLangTxt("edit")}>
                            <i onClick={this.showModal.bind(this)} className="iconfont icon-bianji" style={{color:"rgb(154, 154, 154)"}}/>
                          </Tooltip>
                      </a>

                      <a style={{marginLeft: "0.15rem"}}>
                          <Tooltip placement="bottom" title={getLangTxt("clear")}>
                            <i onClick={this.showModal2.bind(this, record)} style={_style}
                               className="iconfont icon-ziyuan"/>
                          </Tooltip>
                      </a>
                    </span>
				)
			}
		}], data = [{key: '1', name: name ? name : ""}];

		if(progress === LoadProgressConst.LOAD_FAILED)
			return <ReFresh reFreshFn={this.reFreshFn.bind(this)}/>;

		return (
			<div className="sensitiveWord">
				<div className="sensitiveTop">
					<FormItem>
						{getFieldDecorator('filterSupplier', {
							valuePropName: 'checked',
							initialValue: supplier
						})(
							<Switch onChange={this.changeIO.bind(this, supplier, words)}/>
						)}
						<span>{getLangTxt("setting_shield_sensitive_words")}</span>
					</FormItem>
				</div>

				<div className="sensitiveBottom">
					{/*<span>屏蔽方式</span>
					 <Checkbox  checked={this.state.checked} onChange={this.onCheckChange.bind(this)}>不允许发送敏感词</Checkbox>*/}
					<Table columns={columns} dataSource={data} pagination={false}/>
					{
						getProgressComp(progress)
					}
				</div>

				{
					this.state.visible1 ?
						<Modal title={getLangTxt("edit")} visible={true} wrapClassName="sensitiveWord"
						         className="sensitiveWordModal"
						         onOk={this.handleOk.bind(this)} onCancel={this.handleCancel.bind(this)}>
							{
								this.state.warning ?
									<Alert message={getLangTxt("setting_word_note1")} type="warning" closable
									       onClose={this._closeWarning.bind(this)}/>
									: ""
							}
							<div className="senWordEditor">
								<p className="senWordTitle">{getLangTxt("setting_word_library1")}</p>
								<Form>
									<FormItem className="sensitiveWordFormItem">
										{getFieldDecorator('name', {initialValue: name})(
											<Input className="sensitiveWordIpt" type="textarea"/>
										)}
									</FormItem>
								</Form>
								<p className="attentionOne">{getLangTxt("setting_early_note4")}</p>
								<p>{getLangTxt("setting_early_note5")}</p>
							</div>
						</Modal> : null
				}

			</div>
		)
	}

}

SensitiveWord = Form.create()(SensitiveWord);

function mapStateToProps(state)
{
	return {
		state: state.sensitiveWord.data,
		progress: state.sensitiveWord.progress
	}
}

function mapDispatchToProps(dispatch)
{
	return bindActionCreators({getSensitive, setSensitive}, dispatch);
}

export default connect(mapStateToProps, mapDispatchToProps)(SensitiveWord);
