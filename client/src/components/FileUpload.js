import React, { Fragment, useState, useLayoutEffect } from 'react';
import Progress from './Progress';
import Tags from './Tags';
import { useDropzone } from "react-dropzone"
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faArrowUp, faCompactDisc, faRandom } from '@fortawesome/free-solid-svg-icons'
import { faYoutube } from '@fortawesome/free-brands-svg-icons'

const FileUpload = () => {
  let imgPick
  const [file, setFile] = useState({});
  const [filename, setFilename] = useState('');
  const [title, setTitle] = useState(filename);
  const [myTags, setTags] = useState([]);
  const [desc, setDesc] = useState('long ass description');
  const [image, setImage] = useState("");
  const [color, setColor] = useState("rgba(255, 255, 255, 0.0");
  const [uploadedFile, setUploadedFile] = useState({});
  const [message, setMessage] = useState('Audio uploading');
  const [dropped, setDropped] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [uploadPercentage, setUploadPercentage] = useState(0);

  const { getRootProps, getInputProps, isDragActive, isDragReject} = useDropzone({
    maxFiles: 1, // number of files,
    accept: "audio/mpeg",
    onDropAccepted: (acceptedFile) => {
      imgPick = Math.floor(Math.random() * 10) + 1;
      shuffleImage();
      setDropped(true);
      setFile(
        // convert preview string into a URL
        Object.assign(acceptedFile[0], {
          preview: URL.createObjectURL(acceptedFile[0]),
        })
      );
      setFilename(acceptedFile[0].name);
      setTitle(acceptedFile[0].name);
    },
    onDropRejected: () => {
        console.log("drop rejected, do nothing.");
    },
  })

  useLayoutEffect(() => {
    if(!isDragActive && !isDragReject) {
      setColor("rgba(255, 255, 255, 0.0"); //none
    } else if (isDragActive && !isDragReject) {
      setColor("rgba(102, 187, 107, 0.9"); //green
    } else if (isDragActive && isDragReject) {
      setColor("rgba(239, 83, 79, 0.9"); //red
    } else {
      setColor("rgba(239, 83, 79, 0.9"); //red
    }
  }, [isDragActive] )

  const shuffleImage = async e => {
    imgPick = Math.floor(Math.random() * 10) + 1;
    setImage("/thumbnails/" + imgPick.toString() + ".jpg");
  }

  const onSubmit = async e => {
    setSubmitted(true);
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filename', filename);
    formData.append('title', title);
    console.log(myTags);
    // formData.append('tags', tags);
    formData.append('desc', desc);
    formData.append('image', image);

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
      <div id='file-dropzone' style={{backgroundColor: color}} {...getRootProps({})}>
        <input form="myForm" id='customFile' {...getInputProps()} />
        <label className='custom-file-label' htmlFor="customFile">
          {!isDragActive && !isDragReject && "Drop an mp3!"}
          {isDragActive && !isDragReject && "Drop it like it's hot!"}
          {isDragActive && isDragReject && "Not an mp3"}
        </label>
        {!dropped && <FontAwesomeIcon icon={faCompactDisc} size="6x" />}
      </div>

      {dropped && <Fragment>
        <div id="info-box">
          {!submitted && <Fragment>
            <form id="myForm" onSubmit={onSubmit}>
              <h2>
                  <FontAwesomeIcon className="button-space" icon={faYoutube} size="1x"/>
                  Youtube Helpy
              </h2>
              <div>
                <label className="input-label">Title</label>
                <input form="myForm" className="form-control my-input" type="text" value={title} onChange={(e) => setTitle(e.target.value)} required/>
              </div>
              <div>
                <label className="input-label">Tags</label>
                <Tags myTags={myTags} setTags={setTags} />
              </div>
              <div>
                <label className="input-label">Description</label>
                <textarea id='my-desc' form="myForm" className="form-control my-input" type="" value={desc} onChange={(e) => setDesc(e.target.value)} required/>
              </div>
              <div id="box">
                <label className="input-label">Image</label>
                  <div id="box-image"
                    className="d-flex align-items-center justify-content-center"
                    onClick={shuffleImage}
                    style={{ backgroundImage: `url(${process.env.PUBLIC_URL + image})`
                  }}>
                    <FontAwesomeIcon className="box-icon" icon={faRandom} size="2x"/>
                </div>
              </div>

              <button form="myForm" type='submit' value='Upload' className='my-btn'>
              Upload
              <FontAwesomeIcon className="button-space" icon={faArrowUp}/>
              </button>
            </form>
          </Fragment>
          }
          {submitted && <Progress percentage={uploadPercentage} message={message}/>}

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
