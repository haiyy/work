class Model
{
    constructor()
    {
        this.instance = new Map();
    }

    /**
     * Register an <code>IProxy</code> instance with the <code>Model</code>.
     *
     * @param proxyName the name to associate with this <code>IProxy</code> instance.
     * @param proxy an object reference to be held by the <code>Model</code>.
     */
    registerProxy(proxy)
    {
        this.instance.set(proxy.getProxyName(), proxy);
        proxy.onRegister();
        return this;
    }

    /**
     * Retrieve an <code>IProxy</code> instance from the Model.
     *
     * @param proxyName
     * @return the <code>IProxy</code> instance previously registered with the given <code>proxyName</code>.
     */
    retrieveProxy(proxyName)
    {
        return this.instance.get(proxyName);
    }

    /**
     * Remove an <code>IProxy</code> instance from the Model.
     *
     * @param proxyName name of the <code>IProxy</code> instance to be removed.
     * @return the <code>IProxy</code> that was removed from the <code>Model</code>
     */
    removeProxy(proxyName)
    {
        var proxy = this.instance.get(proxyName);
        if(proxy)
        {
            proxy.onRemove();
        }

        this.instance.delete(proxyName);
    }

    /**
     * Check if a Proxy is registered
     *
     * @param proxyName
     * @return whether a Proxy is currently registered with the given <code>proxyName</code>.
     */
    hasProxy(proxyName)
    {
        return this.instance.has(proxyName);
    }
}

export default new Model();



/*
*
*
* */