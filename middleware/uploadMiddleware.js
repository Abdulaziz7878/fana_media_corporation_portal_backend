const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer storage configuration
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save to /uploads folder
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + ext;
        cb(null, filename);
    }
});

// File filter to accept only video files
const fileFilter = (req, file, cb) => {
    const allowedTypes = ['video/mp4', 'video/mkv', 'video/avi', 'video/mov'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only video files are allowed.'));
    }
};

const upload = multer({
    storage,
    limits: {
        fileSize: 2000 * 1024 * 1024 // 2GB max file size
    },
    fileFilter
});

module.exports = upload;



// const multer = require('multer');
// const path = require('path');

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Store videos here
//     },
//     filename: (req, file, cb) => {
//         const uniqueName = Date.now() + '-' + file.originalname;
//         cb(null, uniqueName);
//     },
// });

// const upload = multer({
//     storage,
//     limits: { fileSize: 2000 * 1024 * 1024 }, // Optional: 2GB limit
//     fileFilter: (req, file, cb) => {
//         const ext = path.extname(file.originalname);
//         if (ext !== '.mp4' && ext !== '.mkv' && ext !== '.mov') {
//             return cb(new Error('Only video files are allowed'));
//         }
//         cb(null, true);
//     },
// });

// module.exports = upload;