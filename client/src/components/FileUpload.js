import React, { Fragment, useState } from 'react';
import Message from './Message';
import Progress from './Progress';
import { useDropzone } from "react-dropzone"
import axios from 'axios';

const FileUpload = () => {
  const [file, setFile] = useState({});
  const [filename, setFilename] = useState('');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [dropped, setDropped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const { getRootProps, getInputProps, isDragActive, isDragReject} = useDropzone({
    maxFiles: 1, // number of files,
    accept: "audio/mpeg",
    onDrop: (acceptedFile) => {
      setDropped(true);
      setFile(
        // convert preview string into a URL
        Object.assign(acceptedFile[0], {
          preview: URL.createObjectURL(acceptedFile[0]),
        })
      );
      setFilename(acceptedFile[0].name);
    },
  })



  const onSubmit = async e => {
    setSubmitted(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: progressEvent => {
          setUploadPercentage(
            parseInt(
              Math.round((progressEvent.loaded * 100) / progressEvent.total)
            )
          );

          // Clear percentage
          setTimeout(() => setUploadPercentage(0), 10000);
        }
      });

      const { fileName, filePath } = res.data;

      setUploadedFile({ fileName, filePath });

      setMessage('File Uploaded');
    } catch (err) {
      if (err.response.status === 500) {
        setMessage('There was a problem with the server');
      } else {
        //ffmpeg then youtube here
        setMessage(err.response.data.msg);
      }
    }
  };

  return (
    <Fragment>
      <div id='file-dropzone' {...getRootProps()}>
        <input form="myForm" id='customFile' {...getInputProps()} />
        <label className='custom-file-label' htmlFor='customFile'>
          {filename.length < 1 && !isDragActive && 'Click here or drop a file to upload!'}
          {isDragActive && !isDragReject && "Drop it like it's hot!"}
          {filename.length > 0 && !isDragReject && filename}
        </label>
      </div>

      {dropped && <Fragment>
        <div id="info-box">
          {message ? <Message msg={message} /> : null}
          <form id="myForm" onSubmit={onSubmit}>
            {dropped && <input form="myForm" className="form-control my-input" type="text"/>}
            {dropped && <input form="myForm" type='submit' value='Upload' className='btn btn-primary my-btn' />}
          </form>
          {submitted && <Progress percentage={uploadPercentage} />}
          {uploadedFile ? ( <div> {dropped && <audio src={file.preview} controls/> } </div> ) : null}
        </div>
      </Fragment>}
    </Fragment>
  );
};

export default FileUpload;
