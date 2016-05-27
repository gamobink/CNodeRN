'use strict'

import {createStore,applyMiddleware,compose,bindActionCreators} from "redux"
import {connect,Provider} from "react-redux"
import thunkMiddleware from "redux-thunk"
import createLogger from "redux-logger"
import {autoRehydrate,persistStore} from "redux-persist"
import React,{AsyncStore,Component} from "react-native"

const isDebugInChrome = __DEV__ && window.navigator.userAgent

let middlewares = [
    thunkMiddleware    
]

const logger = createLogger({
    // predicate: (getState, action) => isDebugInChrome,
    // collapsed: true,
    // duration: true
})

if(isDebugInChrome){
    middlewares.push(logger)
}

const createStoreWithMiddlewares = compose(
    applyMiddleware(...middlewares),
    typeof window.devToolsExtension !== 'undefined' ? window.devToolsExtension() : f => f
)(createStore)

export function configureStore(rootReducer,initialState,onComplete=()=>{}){
    // const store = initialState?createStoreWithMiddlewares(rootReducer,initialState):createStoreWithMiddlewares(rootReducer)
    const createStoreRehydrated = autoRehydrate()(createStoreWithMiddlewares)
    const store = initialState?createStoreRehydrated(rootReducer,initialState):createStoreRehydrated(rootReducer)
    // persistStore(store,{storage:AsyncStore},onComplete).purgeAll()
    if(isDebugInChrome){
        window.store = store
    }
    return store
}


export function createContainer(OriginComponent,store,actions,mapStateToProps=state=>state){
    const mapDispatchToProps = dispatch=>({
        actions:bindActionCreators(actions,dispatch)
    })
    const ConnectedComponent = connect(mapStateToProps,mapDispatchToProps)(OriginComponent)
    return class extends Component{
        render(){
            return (
                <Provider store={store}>
                <ConnectedComponent {...this.props}/>
                </Provider>
            )
        }
    }
}

export default function(OriginComponent,rootReducer,actions,initialState,mapStateToProps=state=>state){
    const store = configureStore(rootReducer,initialState)
    return createContainer(OriginComponent,store,actions,mapStateToProps)    
}