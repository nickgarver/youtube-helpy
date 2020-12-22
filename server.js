const express = require('express');
const fileUpload = require('express-fileupload');
var cmd=require('node-cmd');

const app = express();

app.use(fileUpload());

// Upload Endpoint
app.post('/upload', (req, res) => {
  var aFilePath = "";
  var pFilePath = `${__dirname}/client/public/thumbnails/zack.jpg`;
  var oFilePath = `${__dirname}/client/public/uploads/out.mp4`;
  if (req.files === null) {
    return res.status(400).json({ msg: 'No file uploaded' });
  }

  const file = req.files.file;

  file.mv(`${__dirname}/client/public/uploads/${file.name}`, err => {
    if (err) {
      console.error(err);
      return res.status(500).send(err);
    }
    res.json({ fileName: file.name, filePath: `/uploads/${file.name}` });
    aFilePath = `${__dirname}/client/public/uploads/${file.name}`;

    cmd.run(
        `ffmpeg -loop 1 -i ` + pFilePath + ` -i ` + aFilePath + ` -c:v libx264 -tune stillimage -c:a aac -b:a 192k -vf "scale='iw-mod(iw,2)':'ih-mod(ih,2)',format=yuv420p" -shortest -movflags +faststart -vf scale=1280:720 ` + oFilePath,
        function(err, data, stderr){
            console.log(err);
            console.log(stderr);
            console.log('ffmpeg done ',data)
            //upload to youtube
            
        }
    );



  });
});

app.listen(5000, () => console.log('Server Started...'));
