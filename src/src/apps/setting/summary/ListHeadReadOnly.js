import React, { PropTypes } from 'react';
import { Form, Button, Icon, Tooltip, Input } from 'antd';
import { getLangTxt } from "../../../utils/MyUtil";

const FormItem = Form.Item;
class ListHeadReadOnly extends React.Component {
	constructor(props)
	{
		super(props);
		this.state = {
			value: '',
			focus: false
		};
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
                    <Button disabled type="primary">{getLangTxt("setting_add_summary")}</Button>
                    <Button disabled type="primary">{getLangTxt("setting_faq_templete")}</Button>
                    <Button disabled type="primary">{getLangTxt("import")}</Button>
                    <Button disabled type="primary">{getLangTxt("export")}</Button>
                    {
                        this.props.isRangeItem ?
                            <span>
                            <Tooltip placement="bottom" title={getLangTxt(" ")}>
                                <Button type="primary">
                                    <i className="iconfont icon-shangyi rangeBtn"/>
                                </Button>
                            </Tooltip>
                            <Tooltip placement="bottom" title="下移">
                                <Button type="primary">
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

ListHeadReadOnly = Form.create()(ListHeadReadOnly);
export default ListHeadReadOnly;
