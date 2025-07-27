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

exports.changeOwnPassword = async(req, res) => {
    const adminId = req.user.id;
    const role = req.user.role;
    const { currentPassword, newPassword } = req.body;

    if (role !== 'admin') {
        return res.status(403).json({ message: 'Only admins can change passwords' });
    }

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ message: 'Both current and new password are required' });
    }

    try {
        const [rows] = await db.query('SELECT password FROM users WHERE id = ?', [adminId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Admin user not found' });
        }

        const isMatch = await bcrypt.compare(currentPassword, rows[0].password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, adminId]);

        res.json({ message: 'Password updated successfully' });
    } catch (error) {
        console.error('Admin own password change error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.changeUserPassword = async(req, res) => {
    const adminRole = req.user.role;
    const { id } = req.params;
    const { newPassword } = req.body;

    if (adminRole !== 'admin') {
        return res.status(403).json({ message: 'Only admin can change user passwords' });
    }

    if (!newPassword) {
        return res.status(400).json({ message: 'New password is required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);

        res.json({ message: 'User password updated successfully' });
    } catch (error) {
        console.error('Admin changes user password error:', error);
        res.status(500).json({ message: 'Server error' });
    }
};