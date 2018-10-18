import React from "react";
import classnames from "classnames";
import monitor from "./monitor";
import PropTypes from 'prop-types';

class MenuItem extends React.Component {
	
	handleClick(event)
	{
		monitor.hideMenu();
	}
	
	render()
	{
		let {disabled, children, attributes: {className = "", ...props}} = this.props,
			menuItemClassNames = `react-context-menu-item ${className}`;
		const classes = classnames({
			"react-context-menu-link": true,
			disabled
		});
		return (
			<div className={menuItemClassNames} {...props}>
				<a href="#" className={classes} onClick={this.handleClick}>
					{children}
				</a>
			</div>
		);
	}
}

MenuItem.propTypes = {
	data: PropTypes.object,
	disabled: PropTypes.bool,
	preventClose: PropTypes.bool
}

MenuItem.defaultProps = {
	disabled: false,
	data: {},
	attributes: {}
}

export default MenuItem;
