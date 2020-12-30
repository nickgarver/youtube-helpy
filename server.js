const express = require('express');
const fileUpload = require('express-fileupload');
var cmd = require('node-cmd');
const app = express();

app.use(fileUpload());

const Youtube = require("youtube-api"),
  fs = require("fs"),
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
    res.json({
      fileName: file.name,
      filePath: `/uploads/${file.name}`
    });
    console.log('audio done');
    const audioPath = `${__dirname}/client/public/uploads/${file.name}`;
    const photoPath = `${__dirname}/client/public` + req.body.image;
    const videoPath = `${__dirname}/client/public/uploads/out.mp4`;
    const title = req.body.title;
    const tags = req.body.tags;
    const desc = req.body.desc;

    cmd.run(
      `ffmpeg -loop 1 -i ` + photoPath + ` -i ` + audioPath + ` -c:v libx264 -tune stillimage -c:a aac -b:a 192k -vf "scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p" -shortest -movflags +faststart -vf scale=1280:720 ` + videoPath,
      function(err, data, stderr) {
        console.log('ffmpeg done ', data, stderr, err)
        // uploadToYoutube();
      }
    );
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
                tags: ["cute", "asmr", "type beats"],
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



app.listen(5000, () => console.log('Server Started...'));
