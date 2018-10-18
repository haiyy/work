import React,{ Component } from 'react';
import { ContextMenuLayer } from "../contextmenu/index";

class ContextBottom extends Component {
	
	render()
	{
		let contextHeight = this.props.offlineNum == 0 ? this.props.height + 53 : this.props.height;
		return (
			<div className='well'>
				<div className='wellmenu' style={{height: contextHeight}}/>
			</div>
		)
	}
}

export default ContextMenuLayer("some_unique")(ContextBottom);