// backend/controllers/adminController.js
const User = require('../models/User');


// Fetch all users with pagination (limit 10)
exports.getAllUsers = async (req, res) => {
    const { page = 1 } = req.query;  // Default to page 1 if not specified
    const limit = 10;                // Limit to 10 users per page
    const skip = (page - 1) * limit;

    try {
        // Get users with pagination
        const users = await User.find({})
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 }); // Sort by most recent
        const totalUsers = await User.countDocuments(); // Get total number of users for pagination

        res.status(200).json({data:{
            users,
            totalPages: Math.ceil(totalUsers / limit),
            currentPage: parseInt(page),
        }});
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};
exports.getUserSummary = async (req, res) => {
    try {
        // Default categories to ensure all statuses are returned even if count is 0
        const defaultCategories = [
            { status: "active", isVerified: false, count: 0 },
            { status: "active", isVerified: true, count: 0 },
            { status: "inactive", isVerified: false, count: 0 },
            { status: "inactive", isVerified: true, count: 0 },
            { status: "blocked", isVerified: false, count: 0 },
            { status: "blocked", isVerified: true, count: 0 }
        ];

        // Aggregation to get actual counts
        const userSummary = await User.aggregate([
            {
                $group: {
                    _id: {
                        status: "$status",          // Group by status (active, inactive, etc.)
                        isVerified: "$isVerified"   // Group by verification status (true, false)
                    },
                    count: { $sum: 1 }              // Count number of users in each group
                }
            },
            {
                $project: {
                    _id: 0,                         // Remove _id from the final result
                    status: "$_id.status",          // Rename fields for clarity in response
                    isVerified: "$_id.isVerified",
                    count: 1                        // Include count in the final output
                }
            }
        ]);

        // Merge default categories with actual counts
        const mergedResults = defaultCategories.map(category => {
            const foundCategory = userSummary.find(
                item => item.status === category.status && item.isVerified === category.isVerified
            );
            return foundCategory || category; // Use found category from the database or the default one with count 0
        });

        res.status(200).json({
            data: mergedResults
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Fetch user by ID
exports.getUserById = async (req, res) => {
    const { userId } = req.query; // Extract user ID from the request parameters

    try {
        // Find user by ID
        const user = await User.findById(userId);

        // If user not found, return 404
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        const data = {
            ...user.toObject(), // Convert mongoose document to plain object
            pictures: user.pictures.map(picture => {
                return `${req.protocol}://${req.get('host')}/uploads/${picture}`; // Construct URL for the images
            }),
        };
        // Return user details if found
        res.status(200).json({data:{
            data: data
        }});
    } catch (error) {
        // Handle potential errors (e.g., invalid ID format)
        res.status(500).json({ message: 'Server error' });
    }
};

// Search for users by name
exports.searchUserByName = async (req, res) => {
    const { name } = req.query;

    try {
        // Search users by first name or last name
        const users = await User.find({
            $or: [
                { firstname: { $regex: name, $options: 'i' } }, // Case-insensitive search
                { lastname: { $regex: name, $options: 'i' } }
            ]
        });

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Filter users by age, place, and salary, and sort by salary
exports.filterAndSortUsers = async (req, res) => {
    const { age, city, salary, sortSalary } = req.query;

    let filter = {};

    // Build filter query dynamically
    if (age) {
        filter.age = age;
    }
    if (city) {
        filter['address.city'] = city;
    }
    if (salary) {
        filter.salary = { $gte: salary };  // Filter by salary greater than or equal to the given value
    }

    try {
        // Get users based on filters
        let query = User.find(filter);

        // Sort by salary if specified
        if (sortSalary === 'highToLow') {
            query = query.sort({ salary: -1 }); // Sort salary descending (high to low)
        } else if (sortSalary === 'lowToHigh') {
            query = query.sort({ salary: 1 });  // Sort salary ascending (low to high)
        }

        const users = await query.exec();

        if (users.length === 0) {
            return res.status(404).json({ message: 'No users found' });
        }

        res.json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

// Manage users (e.g., approve profiles)
exports.approveUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.params.id, { isVerified: true }, { new: true });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

//courses apis 

// Create a new course
exports.createCourse = async (req, res) => {
    const { title, description, thumbnail, category, price, modules } = req.body;
    
    try {
        // If category is premium, ensure price is provided
        if (category === 'premium' && !price) {
            return res.status(400).json({ message: 'Price is required for premium courses.' });
        }

        const course = new Course({
            title,
            description,
            thumbnail,
            category,
            price: category === 'premium' ? price : 0, // Set price to 0 if it's a free course
            modules,
        });

        await course.save();
        res.status(201).json({ message: 'Course created successfully', data: course });
    } catch (error) {
        console.error('Error creating course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get all courses
exports.getAllCourses = async (req, res) => {
    try {
        const courses = await Course.find();
        res.status(200).json({ data: courses });
    } catch (error) {
        console.error('Error fetching courses:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Get a single course by ID
exports.getCourseById = async (req, res) => {
    const { courseId } = req.params;

    try {
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json({ data: course });
    } catch (error) {
        console.error('Error fetching course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update a course
exports.updateCourse = async (req, res) => {
    const { courseId } = req.params;
    const { title, description, thumbnail, category, price, modules } = req.body;

    try {
        // Find the course by ID and update it
        const course = await Course.findById(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        // Validate if the category is premium, the price must be provided
        if (category === 'premium' && !price) {
            return res.status(400).json({ message: 'Price is required for premium courses.' });
        }

        // Update the course fields
        course.title = title || course.title;
        course.description = description || course.description;
        course.thumbnail = thumbnail || course.thumbnail;
        course.category = category || course.category;
        course.price = category === 'premium' ? price : 0;
        course.modules = modules || course.modules;

        await course.save();
        res.status(200).json({ message: 'Course updated successfully', data: course });
    } catch (error) {
        console.error('Error updating course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Delete a course
exports.deleteCourse = async (req, res) => {
    const { courseId } = req.params;

    try {
        const course = await Course.findByIdAndDelete(courseId);
        if (!course) {
            return res.status(404).json({ message: 'Course not found' });
        }

        res.status(200).json({ message: 'Course deleted successfully' });
    } catch (error) {
        console.error('Error deleting course:', error);
        res.status(500).json({ message: 'Server error' });
    }
};


// exports.getUserSummary = async (req, res) => {
//     try {
//         // Define possible combinations of statuses and verification states
//         const statusCombinations = [
//             { status: "active", isVerified: false },
//             { status: "active", isVerified: true },
//             { status: "inactive", isVerified: false },
//             { status: "inactive", isVerified: true },
//             { status: "blocked", isVerified: false },
//             { status: "blocked", isVerified: true }
//         ];

//         // Perform aggregation in MongoDB to group users by status and isVerified
//         const userSummary = await User.aggregate([
//             {
//                 $group: {
//                     _id: { status: "$status", isVerified: "$isVerified" },
//                     count: { $sum: 1 }
//                 }
//             },
//             {
//                 $project: {
//                     _id: 0,
//                     status: "$_id.status",
//                     isVerified: "$_id.isVerified",
//                     count: 1
//                 }
//             },
//             {
//                 // Add missing combinations using $facet and unionWith an empty dataset
//                 $facet: {
//                     data: [
//                         {
//                             $unionWith: {
//                                 coll: "users",
//                                 pipeline: [
//                                     { $match: { _id: null } } // Empty result, just to maintain the structure
//                                 ]
//                             }
//                         },
//                         {
//                             $addFields: {
//                                 data: statusCombinations
//                             }
//                         }
//                     ]
//                 }
//             },
//             {
//                 // Merge the actual aggregation results with the predefined status combinations
//                 $addFields: {
//                     finalData: {
//                         $map: {
//                             input: statusCombinations,
//                             as: "combo",
//                             in: {
//                                 $mergeObjects: [
//                                     "$$combo",
//                                     {
//                                         count: {
//                                             $ifNull: [
//                                                 {
//                                                     $arrayElemAt: [
//                                                         {
//                                                             $filter: {
//                                                                 input: "$data",
//                                                                 as: "result",
//                                                                 cond: {
//                                                                     $and: [
//                                                                         { $eq: ["$$result.status", "$$combo.status"] },
//                                                                         { $eq: ["$$result.isVerified", "$$combo.isVerified"] }
//                                                                     ]
//                                                                 }
//                                                             }
//                                                         },
//                                                         0
//                                                     ]
//                                                 },
//                                                 { count: 0 }
//                                             ]
//                                         }
//                                     }
//                                 ]
//                             }
//                         }
//                     }
//                 }
//             }
//         ]);

//         res.status(200).json({
//             data: userSummary[0].finalData
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Server error' });
//     }
// };
