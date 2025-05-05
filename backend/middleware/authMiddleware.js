const jwt = require('jsonwebtoken');

const protect = (req, res, next) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return res.status(401).json({ 
      message: 'No authorization header found',
      todaysTasks: [],
      dueTasks: [],
      completedTasks: [],
      upcomingTasks: [],
      pendingTasks: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        pendingTasks: 0
      }
    });
  }

  if (!token) {
    return res.status(401).json({ 
      message: 'Not authorized, no token',
      todaysTasks: [],
      dueTasks: [],
      completedTasks: [],
      upcomingTasks: [],
      pendingTasks: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        pendingTasks: 0
      }
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Set user object on the request with consistent properties
    req.user = { 
      _id: decoded.id,
      email: decoded.email
    };
    
    console.log('Authenticated user ID:', req.user._id);
    
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ 
      message: 'Not authorized, token failed',
      todaysTasks: [],
      dueTasks: [],
      completedTasks: [],
      upcomingTasks: [],
      pendingTasks: [],
      stats: {
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        notStartedTasks: 0,
        pendingTasks: 0
      }
    });
  }
};

module.exports = { protect };