const express = require('express');
const router = express.Router();
const {
    approveUserProfile,
    getUserById,
    getAllUsers,          // Pagination API
    searchUserByName,     // Search by name API
    filterAndSortUsers, 
    getUserSummary,   // Filter and sort users API
} = require('../../controller/adminController');

// const { authenticateUser, authorizeAdmin } = require('../middleware/authMiddleware');

// Route to approve a user's profile (by Admin)
router.put('/approve/:id', approveUserProfile);
router.get('/user/summary', getUserSummary);


// Route to fetch all users with pagination (limit 10 per page)
router.get('/get-users', getAllUsers);
router.get('/user', getUserById);



// Route to search users by name (firstname or lastname)
router.get('/search-users', searchUserByName);

// Route to filter and sort users by age, place, and salary (with optional sorting by salary)
router.get('/filter-users', filterAndSortUsers);

module.exports = router;
