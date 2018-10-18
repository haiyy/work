import { createStore, applyMiddleware } from 'redux';
import thunk from 'redux-thunk';
import promise from 'redux-promise';
import rootReducer from '../reducers';
import { routerMiddleware } from 'react-router-redux';

function configureStore(initialState)
{
	return createStore(rootReducer,
		initialState,
		applyMiddleware(thunk, promise)
	);
}

export default configureStore;


