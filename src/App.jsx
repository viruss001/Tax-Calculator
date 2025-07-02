import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';

const baseSlabs = [
  { limit: 300000, rate: 0 },
  { limit: 600000, rate: 0.05 },
  { limit: 900000, rate: 0.1 },
  { limit: 1200000, rate: 0.15 },
  { limit: 1500000, rate: 0.2 },
  { limit: Infinity, rate: 0.3 },
];

function calculateTax(income, options) {
  const slabs = [...baseSlabs];
  if (options.isSenior) slabs[0].limit = 350000;

  if (options.standardDeduction) income -= 50000;
  income = Math.max(0, income);

  let tax = 0;
  let prevLimit = 0;

  for (let i = 0; i < slabs.length; i++) {
    const { limit, rate } = slabs[i];
    if (income > limit) {
      tax += (limit - prevLimit) * rate;
      prevLimit = limit;
    } else {
      tax += (income - prevLimit) * rate;
      break;
    }
  }

  if (income <= 700000 && options.rebate87A) tax = 0;

  return Math.round(tax);
}

export default function TaxCalculator() {
  const currentFY = `${new Date().getFullYear()}–${new Date().getFullYear() + 1}`;
  const [income, setIncome] = useState('');
  const [standardDeduction, setStandardDeduction] = useState(false);
  const [rebate87A, setRebate87A] = useState(true);
  const [isSenior, setIsSenior] = useState(false);
  const [tax, setTax] = useState(null);
  const [showCharts, setShowCharts] = useState(false);

  const handleCalculate = () => {
    const taxAmount = calculateTax(Number(income), {
      standardDeduction,
      rebate87A,
      isSenior,
    });
    setTax(taxAmount);
    setShowCharts(true);
  };

  const incomeValue = Number(income) || 0;
  const chartData = [
    { name: 'Income', value: incomeValue },
    { name: 'Tax', value: tax || 0 },
  ];

  const pieData = [
    { name: 'After Tax Income', value: Math.max(incomeValue - (tax || 0), 0) },
    { name: 'Tax Payable', value: tax || 0 },
  ];

  const pieColors = ['#34d399', '#f87171'];

  return (
    <div className="max-w-4xl mx-auto mt-12 p-8 bg-gradient-to-br from-white to-gray-50 shadow-2xl rounded-3xl">
      <h1 className="text-3xl font-extrabold text-center text-blue-700 mb-6">
        New Regime Tax Calculator (FY {currentFY})
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-6">
        <div className="col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-1">Annual Income (₹)</label>
          <input
            type="number"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            placeholder="e.g. 850000"
            className="w-full px-4 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={standardDeduction}
            onChange={() => setStandardDeduction(!standardDeduction)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">Standard Deduction (₹50,000)</label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={rebate87A}
            onChange={() => setRebate87A(!rebate87A)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">Apply 87A Rebate</label>
        </div>

        <div className="flex items-center space-x-3">
          <input
            type="checkbox"
            checked={isSenior}
            onChange={() => setIsSenior(!isSenior)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label className="text-sm text-gray-700">Senior Citizen (60+)</label>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        className="w-full bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition shadow-lg"
      >
        Calculate Tax
      </button>

      {tax !== null && (
        <div className="text-center text-xl mt-6 font-semibold text-green-600">
          Estimated Tax Payable: ₹{tax.toLocaleString()}
        </div>
      )}

      {showCharts && (
        <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-2xl border p-4 shadow-md">
            <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Income vs Tax (Bar Chart)</h2>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="value" fill="#2563eb" radius={[10, 10, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border p-4 shadow-md overflow-x-auto">
  <h2 className="text-lg font-bold text-gray-800 mb-4 text-center">Income Split (Pie Chart)</h2>
  <ResponsiveContainer width="100%" height={300}>
    <PieChart margin={{ top: 10, right: 10, left: 10, bottom: 30 }}>
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius={90}
        // label
      >
        {pieData.map((entry, index) => (
          <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
        ))}
      </Pie>
      <Tooltip />
      <Legend verticalAlign="bottom" height={36} />
    </PieChart>
  </ResponsiveContainer>
</div>

        </div>
      )}
    </div>
  );
}
