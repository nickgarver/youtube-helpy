import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';
import logo from "./logo.svg";

const App = () => (
  <div className="App min-h-screen text-blue-200 flex items-center flex-col p-20">
  <FileUpload id="file-upload" />
      <img className="opacity-25" src={logo} alt="React Logo" width="30" />
  </div>
);

export default App;
