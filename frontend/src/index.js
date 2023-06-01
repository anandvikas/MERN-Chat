import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import { BrowserRouter } from "react-router-dom"
import { Provider } from "react-redux";
import store from "./store/store"

import "./styles/auth.css";
import "./styles/index.css";
import "./styles/mainbar.css";
import "./styles/sidebar.css";
import "./styles/loader.css";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // <React.StrictMode>
  <BrowserRouter><Provider store={store}><App /></Provider></BrowserRouter>
  // </React.StrictMode>
);


