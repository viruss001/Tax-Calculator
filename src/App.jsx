import React, { useState, useRef } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
  PieChart, Pie, Cell
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, ChevronUp } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const COLORS = ['#10B981', '#F59E0B'];

const CollapsibleSection = ({ title, isOpen, toggle, children }) => (
  <motion.div
    layout
    transition={{ layout: { duration: 0.3, ease: 'easeInOut' } }}
    className="border rounded-md bg-white overflow-hidden"
  >
    <motion.button
      layout
      onClick={toggle}
      className="flex justify-between items-center w-full px-4 py-3 text-base font-medium text-gray-800 hover:bg-gray-100"
    >
      {title}
      {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
    </motion.button>

    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          key="content"
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="px-4 pb-4 pt-1"
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  </motion.div>
);

export default function TaxCalculator() {
  const [year, setYear] = useState('2025 - 2026');
  const [age, setAge] = useState('Below 60');
  const [salary, setSalary] = useState('');
  const [otherIncome, setOtherIncome] = useState('');
  const [deduction80C, setDeduction80C] = useState('');
  const [deduction80D, setDeduction80D] = useState('');
  const [hra, setHRA] = useState('');
  const [rent, setRent] = useState('');
  const [basic, setBasic] = useState('');

  const [openSection, setOpenSection] = useState(null);
  const [chartData, setChartData] = useState(null);
  const exportRef = useRef(null);

 const handleCalculate = () => {
  const totalIncome = Number(salary) + Number(otherIncome);

  // Parse values with fallback to 0
  const deduction80CValue = Number(deduction80C) || 0;
  const deduction80DValue = Number(deduction80D) || 0;
  const hraReceived = Number(hra) || 0;
  const rentPaid = Number(rent) || 0;
  const basicSalary = Number(basic) || 0;

  // -------------------------
  // HRA Exemption Calculation
  // -------------------------

  // 1. Actual HRA received
  const actualHRA = hraReceived;

  // 2. Rent paid minus 10% of basic salary
  const rentExcess = Math.max(rentPaid - 0.1 * basicSalary, 0);

  // 3. 40% of basic salary (for non-metro cities)
  const fortyPercentOfBasic = 0.4 * basicSalary;

  // HRA Exemption = Least of the above three
  const hraExemption = Math.min(actualHRA, rentExcess, fortyPercentOfBasic);

  // -------------------------
  // Total Deductions
  // -------------------------

  const totalDeductions = deduction80CValue + deduction80DValue + hraExemption;

  // -------------------------
  // Taxable Income
  // -------------------------

  const taxableIncome = Math.max(totalIncome - totalDeductions, 0);

  // -------------------------
  // Set Chart Data
  // -------------------------

  setChartData({
    totalIncome,
    totalDeductions,
    taxableIncome,
    hraExemption, // optional, for display
  });
};


  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    const element = exportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4',
    });

    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('tax-calculation.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 flex-col">
      <div className="bg-white p-6 rounded-2xl shadow-lg w-full max-w-lg">
        <h1 className="text-2xl font-bold text-gray-800 mb-4 text-center">Income Tax Calculator</h1>

        {/* Year & Age */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm text-gray-600">Assessment Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded">
              <option>2025 - 2026</option>
              <option>2024 - 2025</option>
            </select>
          </div>
          <div>
            <label className="text-sm text-gray-600">Age Category</label>
            <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full px-3 py-2 mt-1 border rounded">
              <option>Below 60</option>
              <option>60 - 80</option>
              <option>Above 80</option>
            </select>
          </div>
        </div>

        {/* Collapsible Sections */}
        <div className="space-y-2 mb-4">
          <CollapsibleSection
            title="Income"
            isOpen={openSection === 'income'}
            toggle={() => setOpenSection(openSection === 'income' ? null : 'income')}
          >
            <input
              type="number"
              placeholder="Salary"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
              className="w-full mt-2 border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Other Income"
              value={otherIncome}
              onChange={(e) => setOtherIncome(e.target.value)}
              className="w-full mt-2 border px-3 py-2 rounded"
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="Deductions"
            isOpen={openSection === 'deductions'}
            toggle={() => setOpenSection(openSection === 'deductions' ? null : 'deductions')}
          >
            <input
              type="number"
              placeholder="Section 80C"
              value={deduction80C}
              onChange={(e) => setDeduction80C(e.target.value)}
              className="w-full mt-2 border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Section 80D"
              value={deduction80D}
              onChange={(e) => setDeduction80D(e.target.value)}
              className="w-full mt-2 border px-3 py-2 rounded"
            />
          </CollapsibleSection>

          <CollapsibleSection
            title="HRA Exemption"
            isOpen={openSection === 'hra'}
            toggle={() => setOpenSection(openSection === 'hra' ? null : 'hra')}
          >
            <input
              type="number"
              placeholder="HRA Received"
              value={hra}
              onChange={(e) => setHRA(e.target.value)}
              className="w-full mt-2 border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Rent Paid"
              value={rent}
              onChange={(e) => setRent(e.target.value)}
              className="w-full mt-2 border px-3 py-2 rounded"
            />
            <input
              type="number"
              placeholder="Basic Salary"
              value={basic}
              onChange={(e) => setBasic(e.target.value)}
              className="w-full mt-2 border px-3 py-2 rounded"
            />
          </CollapsibleSection>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCalculate}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-md transition"
        >
          Calculate Tax
        </motion.button>
      </div>

      {chartData && (
        <>
          <div ref={exportRef} className="mt-10 w-full max-w-6xl px-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Income vs Deductions</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Income', value: chartData.totalIncome },
                      { name: 'Deductions', value: chartData.totalDeductions }
                    ]}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }} // <- Added margin
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(value) => value.toLocaleString()} /> {/* Optional formatting */}
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-4 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Taxable Income Breakdown</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Taxable Income', value: chartData.taxableIncome },
                        { name: 'Deductions', value: chartData.totalDeductions }
                      ]}
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      dataKey="value"
                    // label
                    >
                      {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExportPDF}
            className="mt-6 w-full max-w-6xl px-4 bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2.5 rounded-md transition"
          >
            Export as PDF
          </motion.button>
        </>
      )}
    </div>
  );
}
