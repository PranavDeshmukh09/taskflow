// src/components/Dashboard/ProductivityChart.jsx

const ProductivityChart = ({ data }) => {
  const maxValue = Math.max(...data.map(d => d.completed), 1);
  
  if (data.length === 0 || data.every(d => d.completed === 0)) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No completed tasks this week
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mb-2">
        {data.map((day, idx) => (
          <div key={idx} className="text-center flex-1">
            {new Date(day.date).toLocaleDateString('en-US', { weekday: 'short' })}
          </div>
        ))}
      </div>
      <div className="flex justify-between items-end h-32">
        {data.map((day, idx) => (
          <div key={idx} className="flex-1 flex justify-center">
            <div
              className="w-8 bg-blue-500 rounded-t transition-all duration-500 hover:bg-blue-600"
              style={{ height: `${(day.completed / maxValue) * 100}%`, minHeight: '4px' }}
            />
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-2">
        {data.map((day, idx) => (
          <div key={idx} className="text-center flex-1">
            {day.completed}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductivityChart;