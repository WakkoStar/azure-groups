import React,{useEffect} from 'react';

import AzureGroup from '../Components/Login/index';

import "./App.sass"

import Store from "../Store/configureStore"
import {Provider} from 'react-redux';

const App = () => {

  
  return (
    <Provider store={Store}>
      <AzureGroup />
    </Provider>
  );
}

export default App;
