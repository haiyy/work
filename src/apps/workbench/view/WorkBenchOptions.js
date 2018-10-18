import React from 'react'
import SortableGridItem from '../../../components/grid/SortableGridItem'

class WorkBenchOptions extends React.PureComponent {
	
	constructor(props)
	{
		super(props);
		
		this.state = {
			items: this.props.allOptions,
			draggingIndex: null,
		}
	}
	
	updateState(obj)
	{
		this.setState(obj);
	}
	
	getUI(allOptions)
	{
		return allOptions.map((item, i) =>
		{
			let title = item.get("title");
			title = title ? title : item.get("name");
			
			return <SortableGridItem key={i} sortId={i} check={item.get("on") === 1} data-id={i}
			                         updateState={this.updateState.bind(this)}
			                         draggingIndex={this.state.draggingIndex}
			                         updateParent={this.props._updateSelected}
			                         outline="column"
			                         items={allOptions}>
				{title}
			</SortableGridItem>;
		});
	}
	
	render()
	{
		let allOptions = this.props.allOptions;
		this.allOptions = allOptions;
		
		return <div className="grid">
			{
				this.getUI(allOptions)
			}
		</div>;
	}
}

export default WorkBenchOptions;