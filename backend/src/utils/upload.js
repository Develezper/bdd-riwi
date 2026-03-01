const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: path.resolve(__dirname, '../../uploads'),
  filename: (req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`;
    cb(null, safeName);
  }
});

function fileFilter(req, file, cb) {
  const allowed = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowed.includes(ext)) {
    cb(null, true);
  } else {
    const error = new Error('Only .xlsx, .xls and .csv files are allowed');
    error.statusCode = 400;
    error.code = 'INVALID_FILE_TYPE';
    cb(error);
  }
}

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

module.exports = { upload };
