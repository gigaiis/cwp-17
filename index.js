const express = require('express');
const multer  = require('multer');
const sharp = require('sharp');
const uuid = require('uuid/v4');

const storage = multer.diskStorage({
  destination: './uploads/',
  filename: function (req, file, cb) {
    cb(null, file.originalname);
  }
});

const upload = multer({ storage: storage });

const app = express();

app.get('/upload', upload.single('file'), (req, res, next) => {
    res.sendFile('form.html', {root: './public/'});
});

app.post('/upload', upload.single('file'), (req, res, next) => {
    res.json({succeed: true});
});

//pdf
const pdfStorage = multer.diskStorage({
    destination: './uploads/pdf/',
    filename: function (req, file, cb) {
        cb(null, uuid() + ".pdf");
    }
});

const pdfUpload = multer({
    storage: pdfStorage,
    fileFilter: function fileFilter(req, file, cb) {
        console.log(file.mimetype);
        file.mimetype.split('/')[1] === 'pdf' ? cb(null, true) : cb(null, false);
    }
});

app.get('/pdf', upload.single('file'), (req, res, next) => {
    res.sendFile('pdf.html', {root: './public/'});
});

app.post('/pdf', pdfUpload.array('files', 3), (req, res, next) => {
    let files = req.files;
    res.json({files: files.map((file) => file = file.filename)});
});

//images
const imageStorage = multer.diskStorage({
    destination: './uploads/images/',
    filename: function (req, file, cb) {
        cb(null, uuid() + "-master" + file.originalname.slice(-4));
    }
});

const imageUpload = multer({
    storage: imageStorage,
    fileFilter: function fileFilter(req, file, cb) {
        console.log(file.mimetype);
        file.mimetype.split('/')[0] === 'image' ? cb(null, true) : cb(null, false);
    }
});

app.get('/images', function (req, res) {
    res.sendFile('image.html', {root: './public/'});
});

app.post('/images', imageUpload.single('image'), async (req, res, next) => {
    let currFile = req.file.filename.slice(0, 37) ;
    let rash = req.file.filename.split('.')[1];
    let filenames = [
        currFile + 'master.'    + rash,
        currFile + 'preview.'   + rash,
        currFile + 'thumbnail.' + rash
    ];
    await sharp('./uploads/images/' + req.file.filename).resize(800, 600).toFile('./uploads/images/' + filenames[1]);
    await sharp('./uploads/images/' + req.file.filename).resize(300, 180).toFile('./uploads/images/' + filenames[2]);
    res.json(filenames);
});

app.listen(3000, '127.0.0.1', () => console.log('Example app listening on port 3000!'));