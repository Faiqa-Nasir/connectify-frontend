import React from 'react';
import { Provider } from 'react-redux';
import store from './store'; // Import your Redux store

const AppProvider = ({ children }) => {
    return <Provider store={store}>{children}</Provider>;
};

export default AppProvider;
