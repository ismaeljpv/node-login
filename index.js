const express = require('express');
const cors = require('cors');
const authRouter = require('./src/routes/auth');
const userRouter = require('./src/routes/user');


const app = express();

const PORT = process.env.PORT || 5000;

// Cross origin middleware
app.use(cors());

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({extended: false}));

// Auth API router
app.use('/auth', authRouter);

// User API router
app.use('/user', userRouter);

// Start server
app.listen(PORT, () => console.log(`Server started in port ${PORT}`));