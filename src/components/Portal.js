import React from 'react';
import PropTypes from 'prop-types';
import { createPortal } from 'react-dom';

export default class Portal extends React.Component {

	static propTypes = {
		getContainer: PropTypes.func.isRequired,
		children: PropTypes.node.isRequired,
		didUpdate: PropTypes.func,
	}

	componentDidMount()
	{
		this.createContainer();
	}

	componentDidUpdate(prevProps)
	{
		const {didUpdate} = this.props;

		if(didUpdate)
		{
			didUpdate(prevProps);
		}
	}

	componentWillUnmount()
	{
		this.removeContainer();
	}

	getContainer()
	{
		if(this.props.getContainer)
		{
			return this.props.getContainer();
		}

		const container = document.createElement('div');
		container.className = 'portalWrapper';
		document.body.appendChild(container);
        document.body.style.overflow = 'hidden';
		return container;
	}

	createContainer()
	{
		this._container = this.getContainer();
		this.forceUpdate();
	}

	removeContainer()
	{
		try
		{
			if(this._container)
			{
				if(this.props.onRemove)
				{
					this.props.onRemove();
				}
				
				document.body.style.overflow = 'visible';
				
				this._container.parentNode.removeChild(this._container);
			}
		}
		catch(e)
		{
		
		}
	}

	render()
	{
		if(this._container)
		{
			return createPortal(this.props.children, this._container, this.props.key);
		}

		return null;
	}
}
