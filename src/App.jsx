import React, { useState, useRef } from 'react';
import {
  PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { PDFDownloadLink } from '@react-pdf/renderer';
import TaxPdfDocument from './TaxPdfDocument';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

const COLORS = ['#1976d2', '#ef6c00'];

export default function TaxCalculator() {
  const [income, setIncome] = useState('');
  const [deductions, setDeductions] = useState('');
  const [hra, setHra] = useState('');
  const [otherExemptions, setOtherExemptions] = useState('');
  const [age, setAge] = useState('');
  const [result, setResult] = useState(null);
  const [chartImage, setChartImage] = useState(null);

  const chartRef = useRef(null);

  const slabRates = {
    old: [
      { upto: 250000, rate: 0 },
      { upto: 500000, rate: 0.05 },
      { upto: 1000000, rate: 0.2 },
      { upto: Infinity, rate: 0.3 },
    ],
    new: [
      { upto: 300000, rate: 0 },
      { upto: 600000, rate: 0.05 },
      { upto: 900000, rate: 0.1 },
      { upto: 1200000, rate: 0.15 },
      { upto: 1500000, rate: 0.2 },
      { upto: Infinity, rate: 0.3 },
    ],
  };

  const calculateTax = (income, slabs) => {
    let tax = 0, previous = 0;
    for (const slab of slabs) {
      const taxable = Math.min(slab.upto - previous, income);
      if (taxable > 0) {
        tax += taxable * slab.rate;
        income -= taxable;
        previous = slab.upto;
      }
    }
    return tax;
  };

  const captureChart = async () => {
    if (chartRef.current) {
      const canvas = await html2canvas(chartRef.current);
      setChartImage(canvas.toDataURL('image/png'));
    }
  };

  const handleCalculate = async () => {
    const safeIncome = +income || 0;
    const safeDeductions = +deductions || 0;
    const safeHra = +hra || 0;
    const safeOtherExemptions = +otherExemptions || 0;
    const safeAge = +age || 0;

    const totalExemptionsOld = safeDeductions + safeHra + safeOtherExemptions + 50000;
    const totalExemptionsNew = 75000;

    const taxableOld = Math.max(0, safeIncome - totalExemptionsOld);
    const taxableNew = Math.max(0, safeIncome - totalExemptionsNew);

    const taxOld = calculateTax(taxableOld, slabRates.old);
    const taxNew = calculateTax(taxableNew, slabRates.new);

    const filteredResult = {
      old: taxOld > 0 ? taxOld : 0,
      new: taxNew > 0 ? taxNew : 0,
    };

    setResult(filteredResult);

    setTimeout(() => captureChart(), 100);
  };

  const pieData = result
    ? [
        result.old > 0 && { name: 'Old Regime', value: result.old },
        result.new > 0 && { name: 'New Regime', value: result.new },
      ].filter(Boolean)
    : [];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white/60 backdrop-blur-md shadow-lg rounded-2xl p-6 w-fit">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="max-w-5xl mx-auto p-6"
        >
          <motion.h1
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-4xl font-bold text-blue-800 text-center mb-8"
          >
            Tax Calculator
          </motion.h1>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-medium text-blue-700 mb-1">Annual Income</label>
              <input
                type="number"
                value={income}
                onChange={(e) => setIncome(e.target.value === '' ? '' : +e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block font-medium text-blue-700 mb-1">Deductions (80C, etc.)</label>
              <input
                type="number"
                value={deductions}
                onChange={(e) => setDeductions(e.target.value === '' ? '' : +e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block font-medium text-blue-700 mb-1">HRA</label>
              <input
                type="number"
                value={hra}
                onChange={(e) => setHra(e.target.value === '' ? '' : +e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block font-medium text-blue-700 mb-1">Other Exemptions</label>
              <input
                type="number"
                value={otherExemptions}
                onChange={(e) => setOtherExemptions(e.target.value === '' ? '' : +e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
            <div>
              <label className="block font-medium text-blue-700 mb-1">Age</label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value === '' ? '' : +e.target.value)}
                className="w-full border border-gray-300 rounded-lg p-2"
              />
            </div>
          </div>

          <button
            onClick={handleCalculate}
            className="mt-6 w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Calculate Tax
          </button>

          {result && (
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-10 bg-white rounded-xl shadow p-6"
            >
              <h2 className="text-2xl font-bold text-blue-800 mb-4">Tax Comparison Summary</h2>

              <div ref={chartRef} className="w-full h-80">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={90} label>
                      {pieData.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="mt-6 text-lg">
                {result.old > 0 && <p><strong>Old Regime Tax:</strong> ₹{result.old.toFixed(2)}</p>}
                {result.new > 0 && <p><strong>New Regime Tax:</strong> ₹{result.new.toFixed(2)}</p>}
              </div>

              <PDFDownloadLink
                document={
                  <TaxPdfDocument
                    income={+income || 0}
                    deductions={+deductions || 0}
                    hra={+hra || 0}
                    otherExemptions={+otherExemptions || 0}
                    age={+age || 0}
                    result={result}
                    chartImage={chartImage}
                  />
                }
                fileName="tax-summary.pdf"
                className="mt-6 inline-block bg-blue-700 text-white px-4 py-2 rounded-md hover:bg-blue-800"
              >
                {({ loading }) => (loading ? 'Preparing PDF...' : 'Download PDF')}
              </PDFDownloadLink>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
