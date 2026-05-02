// src/components/Dashboard/PriorityChart.jsx

const priorityColors = {
  Critical: '#EF4444',
  High: '#F97316',
  Medium: '#F59E0B',
  Low: '#10B981',
};

const PriorityChart = ({ distribution }) => {
  const total = Object.values(distribution).reduce((a, b) => a + b, 0);
  
  if (total === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No tasks with priority
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {Object.entries(distribution).map(([priority, count]) => {
        const percentage = total > 0 ? (count / total) * 100 : 0;
        return (
          <div key={priority}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-gray-400">{priority}</span>
              <span className="text-gray-900 dark:text-white font-medium">{count}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: priorityColors[priority]
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default PriorityChart;