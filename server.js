const express = require('express');
const fileUpload = require('express-fileupload');
const app = express();
const {FFMpegProgress} = require('ffmpeg-progress-wrapper');
const fs = require('fs')

app.use(fileUpload());

let progAmt = 33;
let progMsg = 'Converting 2 video :-)';
let audioPath = '';
let photoPath = '';
let videoPath = '';
let title = '';
let tags = '';
let desc = '';
let tFrames = '';

const Youtube = require("youtube-api"),
  readJson = require("r-json"),
  Logger = require("bug-killer"),
  opn = require("opn");
// I downloaded the file from OAuth2 -> Download JSON
const CREDENTIALS = readJson(`${__dirname}/client_secret.json`);

let oauth = Youtube.authenticate({
  type: "oauth",
  client_id: CREDENTIALS.web.client_id,
  client_secret: CREDENTIALS.web.client_secret,
  redirect_url: CREDENTIALS.web.redirect_uris[0]
});

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

    audioPath = `${__dirname}/client/public/uploads/${file.name}`;
    photoPath = `${__dirname}/client/public` + req.body.image;
    videoPath = `${__dirname}/client/public/uploads/out.mp4`;
    title = req.body.title;
    tags = req.body.tags;
    desc = req.body.desc;
    tFrames = req.body.totalFrames;
    res.json({
      fileName: file.name,
      filePath: `/uploads/${file.name}`
    });

    ( async () => {

        const process = new FFMpegProgress(['-loop', '1', '-i' , photoPath , '-i', audioPath, '-c:v', 'libx264', '-tune', 'stillimage', '-c:a', 'aac', '-b:a', '192k', '-vf', "scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p", '-shortest', '-movflags', '+faststart', '-vf', 'scale=1280:720' , videoPath]);

        process.once('details', (details) => {
          console.log("ffmpeg started");
        });

        process.on('progress', (progress) => {
          progAmt = Math.round(33 + ((Number(progress.frame) / tFrames) *100) / 3);
        });

        process.once('end', (end) => {
          console.log('ffmpeg end');
          progMsg = 'Logging into youtube';
          progAmt = 66;
          fs.unlink(audioPath, (err) => {
            if (err) {
              console.error(err)
              return
            }
            //file removed
          });
          //upload to youtube

          opn(oauth.generateAuthUrl({
            access_type: "offline",
            scope: ["https://www.googleapis.com/auth/youtube.upload"]
          }));


        });

        await process.onDone();
    })();


  });

});

app.get("/oauth2callback", function(req, res) {
  const code = req.query.code
  console.log("Trying to get the token using the following code: " + code);
  oauth.getToken(code, (err, tokens) => {
    if (err) {
      console.log('Error authenticating')
      console.log(err);
    } else {
      console.log("Got the tokens.");
      progMsg = 'Uploading to youtube';
      // authed = true;
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
      });

      setInterval(function() {
        // progAmt = Math.round(66 + ((Number(progress.frame) / tFrames) *100) / 3);
        console.log("progress: " + req.processingDetails);
      }, 250);
    }
  });
});
// respond with "hello world" when a GET request is made to the homepage
// app.get('/progress', (req, res) => {
//     res.json({
//       progAmt: progAmt,
//       progMsg: progMsg
//     });
// });

app.listen(5000, () => console.log('Server Started...'));
