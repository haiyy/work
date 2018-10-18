import React from 'react';
import { Tag } from 'antd';

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

        this.props.getWidth(this.width);
    }

	/*删*/
	handleClose(key)
	{
		this.props.delDataFn(key);
	}

	render()
	{
		let {tags, idnames, classname} = this.props;

		return (
			<div className={'selectedBox ' + classname} id={idnames}>
				{
					tags && tags.map(tag => {
						return (
							<Tag key={tag.key} closable onClose={() => this.handleClose(tag.key)}>
								{tag.value}
							</Tag>
						)
					})
				}
            </div>
		);
	}
}

export default Tags;
