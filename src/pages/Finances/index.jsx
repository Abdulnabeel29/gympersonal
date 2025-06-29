// Finances/index.jsx
import { Link } from 'react-router-dom';
import { FaPlus, FaEye, FaSync } from 'react-icons/fa';

export default function Finances() {
  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Finances Dashboard</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link 
          to="/finances/add" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-blue-500"
        >
          <div className="flex items-center mb-4">
            <FaPlus className="text-blue-500 text-2xl mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Add Finance</h2>
          </div>
          <p className="text-gray-600">Add new income or expense entries to your financial records.</p>
        </Link>

        <Link 
          to="/finances/view" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-green-500"
        >
          <div className="flex items-center mb-4">
            <FaEye className="text-green-500 text-2xl mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">View Finances</h2>
          </div>
          <p className="text-gray-600">View and analyze your financial transactions and reports.</p>
        </Link>

        <Link 
          to="/finances/recurring" 
          className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 border-l-4 border-purple-500"
        >
          <div className="flex items-center mb-4">
            <FaSync className="text-purple-500 text-2xl mr-3" />
            <h2 className="text-xl font-semibold text-gray-800">Recurring Transactions</h2>
          </div>
          <p className="text-gray-600">Manage staff salaries and other recurring financial transactions.</p>
        </Link>
      </div>
    </div>
  );
}
