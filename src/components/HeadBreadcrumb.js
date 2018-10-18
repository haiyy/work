import React from 'react';
import { Breadcrumb, Icon, Button} from 'antd';
import '../public/styles/enterpriseSetting/conAndRecHeadBreadcrumb.scss';
import DatePickerComponentRecord from "../apps/record/public/DatePickerComponentRecord";
import { getLangTxt } from "../utils/MyUtil";

class HeadBreadcrumb extends React.Component {
	constructor(props)
	{
		super(props);
	}

    reFreshFn()
    {
        this.props.reFreshFn();
    }

	render()
	{
		let {time, selectedValue, path} = this.props;

		this.MenuData = this.props.MenuData;

		return (
			<div className="conAndRecHeadBreadcrumb">
				<div className="left">
                    <Breadcrumb>
                        <Breadcrumb.Item key="0">
                            <i className="icon-interact iconfont"/>
                        </Breadcrumb.Item>
                        {
                            path.map(item =>
                            {
                                return(
                                    <Breadcrumb.Item key={item.key}>{getLangTxt(item.title)}</Breadcrumb.Item>
                                )
                            })
                        }
                    </Breadcrumb>
				</div>

                <Button type="primary" shape="circle" onClick={this.reFreshFn.bind(this)}>
                    <i className="icon-shuaxin iconfont" />
                </Button>

                <div className="right">
                    <DatePickerComponentRecord time={time} _onOk={this.props._onOk.bind(this)} selectedValue={selectedValue}/>
                </div>
			</div>
		);
	}
}

export default HeadBreadcrumb;
