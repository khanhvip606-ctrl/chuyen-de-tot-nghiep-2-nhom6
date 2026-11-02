const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Cấu hình kết nối PostgreSQL (Hãy thay đổi thông tin user, password, database của bạn)
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'ten_database_cua_ban',
    password: 'mat_khau_cua_ban',
    port: 5432,
});

// API Đăng nhập
app.post('/api/login', async (req, res) => {
    const { email } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        if (result.rows.length > 0) {
            const user = result.rows.shift();
            res.json({ success: true, user });
        } else {
            res.status(404).json({ success: false, message: 'Tài khoản không tồn tại!' });
        }
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Đăng ký tài khoản mới
app.post('/api/register', async (req, res) => {
    const { name, email, password, role, student_id } = req.body;
    try {
        const checkUser = await pool.query('SELECT * FROM users WHERE LOWER(email) = LOWER($1)', [email]);
        if (checkUser.rows.length > 0) {
            return res.status(400).json({ success: false, message: 'Email này đã được sử dụng!' });
        }

        const initials = name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
        
        const newUser = await pool.query(
            'INSERT INTO users (name, email, password, role, student_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, password, role, student_id || null]
        );

        res.json({ success: true, user: newUser.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// API Lấy danh sách việc làm
app.get('/api/jobs', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM jobs ORDER BY id DESC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// API Đăng tin tuyển dụng (Dành cho Employer)
app.post('/api/jobs', async (req, res) => {
    const { title, company, location, salary, tags } = req.body;
    try {
        const newJob = await pool.query(
            'INSERT INTO jobs (title, company, location, salary, tags) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [title, company, location, salary, tags]
        );
        res.json({ success: true, job: newJob.rows[0] });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// Khởi động server ở cổng 3000
app.listen(3000, () => {
    console.log('Server Backend đang chạy tại http://localhost:3000');
});