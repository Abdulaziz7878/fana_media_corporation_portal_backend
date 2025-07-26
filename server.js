const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const app = express();

dotenv.config();

app.use(cors());
app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static('uploads')); // Serve video files

app.get('/', (req, res) => {
    res.send('Fana Video Portal Backend Running');
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});