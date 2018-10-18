import React from 'react';
import { Tag, Popover } from 'antd';
import {truncateToPop} from "../../../utils/StringUtils";

class Tags extends React.PureComponent {
	constructor(props)
	{
		super(props);
        this.state={
            isUpdate: false
        };
        this.width = 0;
	}

    componentDidUpdate() {
        let {tags, idnames, classname} = this.props,
            clientWidth = document.getElementById(idnames)&&document.getElementById(idnames).clientWidth;


        if (clientWidth)
            this.width = clientWidth;

        if (this.width === 1)
            return

        if (!clientWidth)
            this.width = 1;

        this.props.getWidth(this.width);
    }

	/*删*/
	handleClose(key, e)
	{
        /*添加阻止默认事件则取消tag自动删除效果 常用搜索需阻止 搜索条件需开启*/
        let {idnames} = this.props;

        idnames === "consultListCommonUsed" || idnames === "leaveMsgListCommonUsedTags" ? e.stopPropagation(): null;
        idnames === "consultListCommonUsed" || idnames === "leaveMsgListCommonUsedTags" ? e.preventDefault(): null;

		this.props.delDataFn(key);
	}

    /*点击tag*/
    commonNameOnClick(tag)
    {
        let {onClick} = this.props;
        if(typeof onClick === "function")
            this.props.onClick(tag);

    }

	render()
	{
		let {tags, idnames, classname} = this.props;

		return (
			<div className={'selectedBox ' + classname} id={idnames}>
				{
					tags && tags.map(tag => {

                        let contentInfo = truncateToPop(tag.value, 200) || {};

						return (
							<Tag key={tag.key} closable
                                onClick={this.commonNameOnClick.bind(this, tag)}
                                onClose={this.handleClose.bind(this, tag.key)}
                            >
                                {
                                    contentInfo.show ?
                                        <Popover content={<div
                                        style={{maxWidth: "300px", height: "auto", wordBreak: "break-word"}}>{tag.value}</div>} placement="topLeft">
                                            {contentInfo.content}
                                        </Popover>
                                        :
                                        tag.value
                                }
							</Tag>
						)
					})
				}
            </div>
		);
	}
}

export default Tags;
