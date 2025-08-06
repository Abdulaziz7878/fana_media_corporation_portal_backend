const db = require('../config/db'); // Your DB connection file
const path = require('path');
// const fs = require('fs');
const fs = require('fs').promises;

// Upload video
const uploadVideo = async(req, res) => {
    try {
        const { title, description, category, recipient_id } = req.body;
        const file = req.file;
        const is_public = !recipient_id;

        if (!file) {
            return res.status(400).json({ message: 'No video file uploaded' });
        }

        const filename = file.filename;
        const uploader_id = req.user.id;

        const query = 'INSERT INTO videos(title, description, filename, category, uploaded_by, recipient_id, is_public) VALUES( ? , ? , ? , ? , ? , ? , ? )';
        const values = [
            title,
            description || null,
            filename,
            category,
            uploader_id,
            recipient_id || null,
            is_public
        ];

        await db.query(query, values);

        res.status(201).json({ message: 'Video uploaded successfully' });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
};

// Get videos for current user (public or specifically sent)
const getUserVideos = async(req, res) => {
    try {
        const userId = req.user.id;

        const query = 'SELECT * FROM videos WHERE is_public = TRUE OR recipient_id = ? ORDER BY upload_date DESC';

        const [videos] = await db.query(query, [userId]);
        res.json(videos);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching videos' });
    }
};

// Get videos uploaded by the current user
const getMyVideos = async(req, res) => {
    try {
        const userId = req.user.id;

        const query = 'SELECT * FROM videos WHERE uploaded_by = ? ORDER BY upload_date DESC';

        const [videos] = await db.query(query, [userId]);
        res.json(videos);
    } catch (error) {
        console.error('Fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching your uploads' });
    }
};

// Get all videos (admin only)
const getAllVideos = async(req, res) => {
    try {
        const [videos] = await db.query('SELECT * FROM videos ORDER BY upload_date DESC');
        res.json(videos);
    } catch (error) {
        console.error('Admin video fetch error:', error);
        res.status(500).json({ message: 'Server error while fetching all videos' });
    }
};

// Delete a video (admin only)
const deleteVideo = async(req, res) => {
    try {
        const videoId = req.params.id;

        // Optional: First, get the filename to delete the physical file
        const [rows] = await db.query('SELECT filename FROM videos WHERE id = ?', [videoId]);
        if (rows.length === 0) return res.status(404).json({ message: 'Video not found' });

        const filename = rows[0].filename;
        const filePath = path.join(__dirname, '../uploads/', filename);

        // Delete file from disk
        const fs = require('fs');
        fs.unlink(filePath, (err) => {
            if (err) console.error('File deletion failed:', err);
        });

        await db.query('DELETE FROM videos WHERE id = ?', [videoId]);
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Delete error:', error);
        res.status(500).json({ message: 'Server error while deleting video' });
    }
};

const downloadVideo = async(req, res) => {
    try {
        const videoId = req.params.id;
        const userId = req.user.id;
        const isAdmin = req.user.role === 'admin';

        if (!/^\d+$/.test(videoId)) {
            return res.status(400).json({ message: 'Invalid video ID' });
        }

        const [rows] = await db.query('SELECT * FROM videos WHERE id = ?', [videoId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Video not found' });
        }

        const video = rows[0];

        if (!isAdmin && !video.is_public && video.recipient_id !== userId && video.uploaded_by !== userId) {
            console.warn(`Access denied: User $ { userId }
                        tried to access video $ { videoId }`);
            return res.status(403).json({ message: 'Access denied' });
        }

        const filePath = path.join(__dirname, '../uploads', video.filename);

        try {
            await fs.access(filePath);
        } catch {
            return res.status(404).json({ message: 'File not found on server' });
        }

        res.download(filePath, video.original_name || video.filename);

    } catch (error) {
        console.error('Download error:', error);
        res.status(500).json({ message: 'Server error during download' });
    }
};

module.exports = {
    uploadVideo,
    getUserVideos,
    getMyVideos,
    getAllVideos,
    deleteVideo,
    downloadVideo
};