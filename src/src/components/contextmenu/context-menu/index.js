import React from "react";
import store from "../redux/store";
import ContextWrapper from "./wrapper";
import PropTypes from 'prop-types';

class ContextMenu extends React.PureComponent {
	
	displayName = "ContextMenu";
	
	static propTypes = {
		identifier: PropTypes.string.isRequired
	}
	
	constructor(props)
	{
		super(props);
		
		this.state = store.getState();
	}
	
	/*getInitialState()
	{
		return store.getState();
	}*/
	
	componentDidMount()
	{
		this.unsubscribe = store.subscribe(this.handleUpdate.bind(this));
	}
	
	componentWillUnmount()
	{
		if(this.unsubscribe) this.unsubscribe();
	}
	
	handleUpdate()
	{
		this.setState(store.getState());
	}
	
	render()
	{
		return (
			<ContextWrapper {...this.props} {...this.state}/>
		);
	}
	
}

export default ContextMenu;
