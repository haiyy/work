function parseJSON(response)
{
	return response.json();
}

function checkStatus(response)
{
	if(response.status >= 200 && response.status < 300)
	{
		return response;
	}
	
	const error = new Error(response.state);
	error.response = response;
	throw error;
}

/**
 * Requests a URL, returning a promise.
 *
 * @param  {string} url       The URL we want to request
 * @param  {object} [options] The options we want to pass to "fetch"
 * @return {object}           An object containing either "data" or "err"
 */
export default function request(url, options, timeout = 8000)
{
	let abortFn = function()
	{
	};
	
	const fetchPromise = fetch(url, options);
	
	var abortPromise = new Promise(function(resolve, reject)
	{
		abortFn = function()
		{
			reject('timeout');
		}
	});
	
	var abortablePromise = Promise.race([
		fetchPromise,
		abortPromise
	]);
	
	setTimeout(function()
	{
		abortFn();
	}, timeout);
	
	return abortablePromise
	.then(checkStatus)
	.then(parseJSON)
	.then((data) => ( data ))
	.catch((err) => ({err}));
}
