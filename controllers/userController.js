const bcrypt = require('bcryptjs');
const db = require('../config/db'); // Your MySQL connection

exports.createUser = async(req, res) => {
    try {
        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const [existingUser] = await db.query(
            'SELECT * FROM users WHERE username = ?', [username]
        );
        if (existingUser.length > 0) {
            return res.status(409).json({ message: 'Username already exists' });
        }

        await db.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)', [username, hashedPassword, role]
        );

        res.status(201).json({ message: 'User created successfully' });
    } catch (err) {
        console.error('Error creating user:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.getAllUsers = async(req, res) => {
    try {
        const [users] = await db.query('SELECT id, username, role FROM users');
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users' });
    }
};

exports.deleteUser = async(req, res) => {
    const userId = req.params.id;

    try {
        const [result] = await db.query('DELETE FROM users WHERE id = ?', [userId]);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting user' });
    }
};