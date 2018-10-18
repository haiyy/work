/**
 // 调用示例
 <Bundle load={require('bundle-loader?lazy!./somefile.js')}>
    {(Cmp) => <Cmp></Cmp>}
 </Bundle>
 */
import React, { Component } from 'react'

class Bundle extends Component {
	
	state = {
		mod: null
	}
	
	constructor(props)
	{
		super(props);
		
		this.load(props, false);
	}
	
	componentWillReceiveProps(nextProps)
	{
		if(nextProps.load !== this.props.load)
		{
			this.load(nextProps)
		}
	}
	
	load(props, isMount = true)
	{
		isMount && this.setState({mod: null});
		
		props.load((mod) => {
			this.setState({
				// handle both es imports and cjs
				mod: mod.default ? mod.default : mod
			})
		})
	}
	
	render()
	{
		return this.state.mod ? this.props.children(this.state.mod) : null
	}
}

export default Bundle