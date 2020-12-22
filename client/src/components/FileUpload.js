import React, { Fragment, useState } from 'react';
import Message from './Message';
import Progress from './Progress';
import { useDropzone } from "react-dropzone"
import axios from 'axios';
import ReactAudioPlayer from 'react-audio-player';

const FileUpload = () => {
  const [file, setFile] = useState({});
  const [filename, setFilename] = useState('Drop Mp3 here');
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('');
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const { getRootProps, getInputProps } = useDropzone({
    maxFiles: 1, // number of files,
    accept: "audio/mpeg",
    onDrop: (acceptedFile) => {
      setFile(
        // convert preview string into a URL
        Object.assign(acceptedFile[0], {
          preview: URL.createObjectURL(acceptedFile[0]),
        })
      );
      setFilename(acceptedFile[0].name);
    },
  })

  // const onChange = acceptedFiles => {
  //   setFile(acceptedFiles.target.files[0]);
  //   setFilename(acceptedFiles.target.files[0].name);
  // };

  const onSubmit = async e => {
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
      {message ? <Message msg={message} /> : null}
      <form onSubmit={onSubmit}>
        <div className='custom-file mb-4' {...getRootProps()}>
          <input id='customFile' {...getInputProps()} />
          <label className='custom-file-label' htmlFor='customFile'>
            {filename}
          </label>
        </div>

        <Progress percentage={uploadPercentage} />

        <input
          type='submit'
          value='Upload'
          className='btn btn-primary btn-block mt-4'
        />
      </form>

      {uploadedFile ? (
        <div className='row mt-5'>
          <div className='col-md-6 m-auto'>
            <h3 className='text-center'>{uploadedFile.fileName}</h3>
            <ReactAudioPlayer src={file.preview} controls/>
          </div>
        </div>
      ) : null}
    </Fragment>
  );
};

export default FileUpload;
