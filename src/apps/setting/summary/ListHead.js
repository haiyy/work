import React, { PropTypes } from 'react';
import { Form, Button, Icon, Tooltip, Input } from 'antd';
import { getLangTxt } from "../../../utils/MyUtil";

const FormItem = Form.Item;
class ListHead extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			value: '',
			focus: false
		};

		this.handleAddSummaryLeaf = this.handleAddSummaryLeaf.bind(this);
	}

	handleAddSummaryLeaf()
	{
		this.props.addClick();
	}

    onSearch()
    {
        let searchVal = this.props.form.getFieldValue("search"),
            data = {keywords: searchVal};

        if(searchVal)
            this.props.onSearchSummaryList(data);
    }

	render()
	{
        const {getFieldDecorator} = this.props.form;

		return (
            <div className='list-btn clearFix'>
                <div className="summaryListBtn">
                    <Button type="primary" onClick={this.handleAddSummaryLeaf.bind(this)}>{getLangTxt("setting_add_summary")}</Button>
                    <Button type="primary" onClick={this.props.downLoadModal.bind(this)}>{getLangTxt("setting_faq_templete")}</Button>
                    <Button type="primary" onClick={this.props.importFile.bind(this)}>{getLangTxt("import")}</Button>
                    <Button type="primary" onClick={this.props.exportSummarys.bind(this)}>{getLangTxt("export")}</Button>
                    {
                        this.props.isRangeItem ?
                            <span>
                            <Tooltip placement="bottom" title={getLangTxt("move_up")}>
                                <Button type="primary" onClick={this.props.handleRangeSummaryItem.bind(this, -1)}>
                                    <i className="iconfont icon-shangyi rangeBtn"/>
                                </Button>
                            </Tooltip>
                            <Tooltip placement="bottom" title={getLangTxt("move_down")}>
                                <Button type="primary" onClick={this.props.handleRangeSummaryItem.bind(this, 1)}>
                                    <i className="iconfont icon-xiayi rangeBtn"/>
                                </Button>
                            </Tooltip>
                        </span>
                            :
                            null
                    }
                </div>

                <div className="contentOpera">
                    <div className="searchBox">
                        <Form>
                            <FormItem>
                                {getFieldDecorator('search')(
                                    <Input onKeyUp={this.onSearch.bind(this)} className="searchIpt"/>
                                )}
                            </FormItem>
                        </Form>
                        <Button className="searchBtn" type="primary" onClick={this.onSearch.bind(this)} icon="search"></Button>
                    </div>
                </div>
            </div>
		)
	}
}

ListHead = Form.create()(ListHead);
export default ListHead;
