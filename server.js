const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const {FFMpegProgress} = require('ffmpeg-progress-wrapper');
const fs = require('fs')

app.use(fileUpload());

let progAmt = 33;
let progMsg = 'Converting 2 video :-)';

const Youtube = require("youtube-api"),
  readJson = require("r-json"),
  Logger = require("bug-killer"),
  opn = require("opn"),
  prettyBytes = require("pretty-bytes");

// I downloaded the file from OAuth2 -> Download JSON
const CREDENTIALS = readJson(`${__dirname}/client_secret.json`);

// Upload Endpoint
app.post('/upload', (req, res) => {
  if (req.files === null) {
    return res.status(400).json({
      msg: 'No file uploaded'
    });
  }
  const file = req.files.file;

  file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }

    const audioPath = `${__dirname}/client/public/uploads/${file.name}`;
    const photoPath = `${__dirname}/client/public` + req.body.image;
    const videoPath = `${__dirname}/client/public/uploads/out.mp4`;
    const title = req.body.title;
    const tags = req.body.tags;
    const desc = req.body.desc;
    const tFrames = req.body.totalFrames;
    res.json({
      fileName: file.name,
      filePath: `/uploads/${file.name}`
    });

    (async () => {

        const process = new FFMpegProgress(['-loop', '1', '-i' , photoPath , '-i', audioPath, '-c:v', 'libx264', '-tune', 'stillimage', '-c:a', 'aac', '-b:a', '192k', '-vf', "scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p", '-shortest', '-movflags', '+faststart', '-vf', 'scale=1280:720' , videoPath]);

        process.once('details', (details) => {
          console.log(JSON.stringify(details));
        });

        process.on('progress', (progress) => {
          progAmt = Math.round(33 + ((Number(progress.frame) / tFrames) *100) / 3);
        });

        process.once('end', (end) => {
          // uploadToYoutube();
          progMsg = 'Uploading to youtube';
          progAmt = 66;
          fs.unlink(audioPath, (err) => {
            if (err) {
              console.error(err)
              return
            }
            //file removed
          });
          console.log.bind(console, 'Conversion finished and exited with code');
        });

        process.done(console.log);

        await process.onDone();

    })();


  });

  function uploadToYoutube() {
    //upload to youtube
    let oauth = Youtube.authenticate({
      type: "oauth",
      client_id: CREDENTIALS.web.client_id,
      client_secret: CREDENTIALS.web.client_secret,
      redirect_url: CREDENTIALS.web.redirect_uris[0]
    });
    opn(oauth.generateAuthUrl({
      access_type: "offline",
      scope: ["https://www.googleapis.com/auth/youtube.upload"]
    }));
    app.get("/oauth2callback", function(req, res) {
      const code = req.query.code
      console.log("Trying to get the token using the following code: " + code);
      oauth.getToken(code, (err, tokens) => {
        if (err) {
          console.log('Error authenticating')
          console.log(err);
        } else {
          console.log("Got the tokens.");
          oauth.setCredentials(tokens);
          var req = Youtube.videos.insert({
            resource: {
              // Video title and description
              snippet: {
                title: title,
                tags: tags,
                description: desc
              }
              // I don't want to spam my subscribers
              ,
              status: {
                privacyStatus: "private"
              }
            }
            // This is for the callback function
            ,
            part: "snippet,status"

              // Create the readable stream to upload the video
              ,
            media: {
              body: fs.createReadStream(videoPath)
            }
          }, (err, data) => {
            if (err) {
              console.log("fs error: " + err);
            }
            console.log("youtube done");
            //delete audio and video
            process.exit();
          });

          setInterval(function() {
            console.log("progress: " + res.processingDetails);
          }, 250);
        }
      });
    });
  }
});

// respond with "hello world" when a GET request is made to the homepage
app.get('/progress', function (req, res) {
  res.json({
    progAmt: progAmt,
    progMsg: progMsg
  });
});

app.listen(5000, () => console.log('Server Started...'));
