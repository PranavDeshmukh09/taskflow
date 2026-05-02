// src/controllers/dashboard.controller.js

const { Op } = require('sequelize');
const db = require('../models');

const Task = db.Task;
const Project = db.Project;

// Get dashboard statistics
exports.getDashboardStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const endOfWeek = new Date(today);
    endOfWeek.setDate(endOfWeek.getDate() + 7);
    
    // Get all counts in parallel for performance
    const [
      totalTasks,
      completedTasks,
      overdueTasks,
      dueTodayTasks,
      dueThisWeekTasks,
      criticalTasks,
      highTasks,
      mediumTasks,
      lowTasks,
      totalProjects
    ] = await Promise.all([
      // Total tasks
      Task.count({ where: { userId } }),
      
      // Completed tasks
      Task.count({ where: { userId, status: 'Done' } }),
      
      // Overdue tasks (due date < today and not done)
      Task.count({
        where: {
          userId,
          dueDate: { [Op.lt]: today },
          status: { [Op.ne]: 'Done' }
        }
      }),
      
      // Due today
      Task.count({
        where: {
          userId,
          dueDate: { [Op.gte]: today, [Op.lt]: tomorrow },
          status: { [Op.ne]: 'Done' }
        }
      }),
      
      // Due this week (next 7 days)
      Task.count({
        where: {
          userId,
          dueDate: { [Op.gte]: today, [Op.lte]: endOfWeek },
          status: { [Op.ne]: 'Done' }
        }
      }),
      
      // Critical priority tasks (not done)
      Task.count({
        where: { userId, priority: 'Critical', status: { [Op.ne]: 'Done' } }
      }),
      
      // High priority tasks (not done)
      Task.count({
        where: { userId, priority: 'High', status: { [Op.ne]: 'Done' } }
      }),
      
      // Medium priority tasks (not done)
      Task.count({
        where: { userId, priority: 'Medium', status: { [Op.ne]: 'Done' } }
      }),
      
      // Low priority tasks (not done)
      Task.count({
        where: { userId, priority: 'Low', status: { [Op.ne]: 'Done' } }
      }),
      
      // Total projects
      Project.count({ where: { userId } })
    ]);
    
    // Calculate completion rate
    const completionRate = totalTasks > 0 
      ? Math.round((completedTasks / totalTasks) * 100) 
      : 0;
    
    // Get upcoming tasks (next 7 days, limited to 10)
    const upcomingTasks = await Task.findAll({
      where: {
        userId,
        dueDate: { [Op.gte]: today, [Op.lte]: endOfWeek },
        status: { [Op.ne]: 'Done' }
      },
      order: [['dueDate', 'ASC']],
      limit: 10,
      attributes: ['id', 'title', 'dueDate', 'priority', 'status'],
      include: [
        { model: db.Project, as: 'project', attributes: ['id', 'name', 'colour'] }
      ]
    });
    
    // Calculate priority distribution for chart
    const priorityDistribution = {
      Critical: criticalTasks,
      High: highTasks,
      Medium: mediumTasks,
      Low: lowTasks
    };
    
    // Get recent completed tasks (last 7 days, limited to 5)
    const recentCompleted = await Task.findAll({
      where: {
        userId,
        status: 'Done',
        updatedAt: { [Op.gte]: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      },
      order: [['updatedAt', 'DESC']],
      limit: 5,
      attributes: ['id', 'title', 'updatedAt']
    });
    
    res.json({
      stats: {
        totalTasks,
        completedTasks,
        overdueTasks,
        dueTodayTasks,
        dueThisWeekTasks,
        completionRate,
        totalProjects
      },
      priorityDistribution,
      upcomingTasks,
      recentCompleted,
      // For notification badge (tasks due in next 24 hours)
      notificationCount: dueTodayTasks
    });
  } catch (error) {
    next(error);
  }
};

// Get productivity trend (last 7 days completion count)
exports.getProductivityTrend = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const last7Days = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      date.setHours(0, 0, 0, 0);
      
      const nextDate = new Date(date);
      nextDate.setDate(nextDate.getDate() + 1);
      
      const count = await Task.count({
        where: {
          userId,
          status: 'Done',
          updatedAt: { [Op.gte]: date, [Op.lt]: nextDate }
        }
      });
      
      last7Days.push({
        date: date.toISOString().split('T')[0],
        completed: count
      });
    }
    
    res.json({ trend: last7Days });
  } catch (error) {
    next(error);
  }
};