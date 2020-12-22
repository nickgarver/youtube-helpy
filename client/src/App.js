import React from 'react';
import FileUpload from './components/FileUpload';
import './App.css';

const App = () => (
  <div className='container mt-4'>
    <h4 className='display-4 text-center mb-4'>
      <i className='fab fa-react' /> React File Upload
    </h4>

    <FileUpload />
  </div>
);

export default App;

// import React, { useState } from "react"
// import { useDropzone } from "react-dropzone"
// import logo from "./logo.svg";
// import "./App.css"
//
// function App() {
//   const [files, setFiles] = useState([])
//
//   const { getRootProps, getInputProps } = useDropzone({
//     maxFiles: 1, // number of files,
//     accept: "audio/mpeg",
//     onDrop: (acceptedFiles) => {
//       setFiles(
//         acceptedFiles.map((file) =>
//           Object.assign(file, {
//             preview: URL.createObjectURL(file),
//           })
//         )
//       )
//     },
//   })
//
//   const images = files.map((file) => (
//     <div key={file.name}>
//       <div>
//         <audio controls>
//           <source src={file.preview} type="audio/mpeg"/>
//         </audio>
//       </div>
//     </div>
//   ))
//
//   return (
//     <div className="App min-h-screen text-blue-200 flex items-center flex-col p-20">
//
//       <div className="mb-10 grid grid-cols-4 grid-rows-2 w-1/2 mx-auto">
//         <img className="opacity-25" src={logo} alt="React Logo" width="300" />
//           <div className="col-span-2 row-span-3" {...getRootProps()}>
//             <input {...getInputProps()} />
//             <p className="text-2xl lg:text-3xl mb-10 text-center">Drop mp3 here</p>
//           </div>
//         <img className="opacity-25" src={logo} alt="React Logo" width="300" />
//         <img className="opacity-25" src={logo} alt="React Logo" width="300" />
//         <img className="opacity-25" src={logo} alt="React Logo" width="300" />
//         <div>{images}</div>
//       </div>
//     </div>
//   )
// }
//
// export default App
