import React, { Fragment, useState } from 'react';
import Message from './Message';
import Progress from './Progress';
import { useDropzone } from "react-dropzone"
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faCompactDisc, faRandom, faPlay } from '@fortawesome/free-solid-svg-icons'
import { faYoutube } from '@fortawesome/free-brands-svg-icons'

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
          {!dropped && !isDragActive && 'Drop a beat to upload!'}
          {isDragActive && !isDragReject && "Drop it like it's hot!"}
          {dropped && !isDragReject && filename}
        </label>
        {!dropped && <FontAwesomeIcon icon={faCompactDisc} size="6x" />}
      </div>


      {dropped && <Fragment>
        <div id="info-box">
          {message ? <Message msg={message} /> : null}
          <form id="myForm" onSubmit={onSubmit}>
            <h2>
                <FontAwesomeIcon className="button-space" icon={faYoutube} size="1x"/>
                Youtube Helpy
            </h2>

            <div>
              <label className="input-label">Title</label>
              <input form="myForm" className="form-control my-input" type="text" value={filename}/>
            </div>

            <div>
              <label className="input-label">Tags</label>
              <input form="myForm" className="form-control my-input" type="text"/>
            </div>

            <div>
              <label className="input-label">Description</label>
              <textarea id='my-desc' form="myForm" className="form-control my-input" type=""/>
            </div>

            <div id="box">
              <label className="input-label">Image</label>
                <div id="box-image" className="d-flex align-items-center justify-content-center">
                  <FontAwesomeIcon className="box-icon" icon={faRandom} size="2x"/>
              </div>
            </div>

            <button form="myForm" type='submit' value='Upload' className='my-btn'>
            Upload
            <FontAwesomeIcon className="button-space" icon={faArrowUp}/>
            </button>
          </form>
          {submitted && <Progress percentage={uploadPercentage} />}

          {uploadedFile ? (
            <div>
              {dropped && <audio id="player" src={file.preview} /> }
            </div>
          ) : null}
        </div>
      </Fragment>}
    </Fragment>
  );
};

export default FileUpload;
