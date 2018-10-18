import { createStore, applyMiddleware, compose } from 'redux';
import rootReducer from '../reducers';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import { routerMiddleware } from 'react-router-redux';

const logger = createLogger(),
	enhancer = compose(
		applyMiddleware(thunk, promise),//logger,
		window.devToolsExtension ? window.devToolsExtension() : f => f
	);

function configureStore(initialState)
{
	const store = createStore(rootReducer, initialState, enhancer);
	
	if(module.hot)
	{
		// Enable Webpack hot module replacement for reducers
		module.hot.accept('../reducers', () =>
		{
			// eslint-disable-line global-require
			const nextReducer = require('../reducers').default;
			store.replaceReducer(nextReducer);
		});
	}
	
	return store;
}

export default configureStore;
