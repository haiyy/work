import React from 'react';
import { ContextMenu, MenuItem } from "./contextmenu/index";

class MenuTop extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		this.state = {
			collapse: false
		};
	}
	
	render()
	{
		return <div>
			<ContextMenu identifier="some_identifier" currentItem={ this.currentItem }>
				<MenuItem>
					<p>置顶</p>
				</MenuItem>
				<MenuItem>
					<p>咨询总结</p>
				</MenuItem>
				<MenuItem>
					<p>加入标签</p>
				</MenuItem>
				<MenuItem>
					<p>关闭会话</p>
				</MenuItem>
				<MenuItem>
					<p style={{borderTop: '1px solid #ccc', color: '#ccc'}}>按时间顺序</p>
				</MenuItem>
				<MenuItem>
					<p style={{color: '#ccc'}}>按状态顺序</p>
				</MenuItem>
				<MenuItem>
					<p style={{color: '#ccc'}}>小头像</p>
				</MenuItem>
			</ContextMenu>
		</div>;
	}
}

export default MenuTop;
