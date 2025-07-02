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
    className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm"
  >
    <motion.button
      layout
      onClick={toggle}
      className="flex justify-between items-center w-full px-4 py-3 text-base font-semibold text-gray-800 bg-gray-100 hover:bg-gray-200"
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
          className="px-4 pb-4 pt-2 space-y-3"
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
  const [taxRegime, setTaxRegime] = useState('new');
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

  const calculateTaxOldRegime = (income) => {
    income = income - 50000;
    let tax = 0;
    if (income <= 250000) tax = 0;
    else if (income <= 500000) tax = 0.05 * (income - 250000);
    else if (income <= 1000000) tax = 12500 + 0.2 * (income - 500000);
    else tax = 112500 + 0.3 * (income - 1000000);
    return Math.max(tax, 0);
  };

  const calculateTaxNewRegime = (income) => {
    income = income - 75000;
    let tax = 0;
    if (income <= 300000) tax = 0;
    else if (income <= 600000) tax = 0.05 * (income - 300000);
    else if (income <= 900000) tax = 15000 + 0.1 * (income - 600000);
    else if (income <= 1200000) tax = 45000 + 0.15 * (income - 900000);
    else if (income <= 1500000) tax = 90000 + 0.2 * (income - 1200000);
    else tax = 150000 + 0.3 * (income - 1500000);
    return Math.max(tax, 0);
  };

  const handleCalculate = () => {
    const totalIncome = Number(salary) + Number(otherIncome);
    const deduction80CValue = Number(deduction80C) || 0;
    const deduction80DValue = Number(deduction80D) || 0;
    const hraReceived = Number(hra) || 0;
    const rentPaid = Number(rent) || 0;
    const basicSalary = Number(basic) || 0;

    const actualHRA = hraReceived;
    const rentExcess = Math.max(rentPaid - 0.1 * basicSalary, 0);
    const fortyPercentOfBasic = 0.4 * basicSalary;
    const hraExemption = Math.min(actualHRA, rentExcess, fortyPercentOfBasic);

    const totalDeductions = deduction80CValue + deduction80DValue + hraExemption;
    const taxableIncomeOld = Math.max(totalIncome - totalDeductions, 0);
    const taxableIncomeNew = totalIncome;

    const taxOld = calculateTaxOldRegime(taxableIncomeOld);
    const taxNew = calculateTaxNewRegime(taxableIncomeNew);
    const selectedTax = taxRegime === 'old' ? taxOld : taxNew;

    setChartData({
      totalIncome,
      totalDeductions,
      hraExemption,
      taxableIncome: taxRegime === 'old' ? taxableIncomeOld : taxableIncomeNew,
      taxOld,
      taxNew,
      selectedTax,
    });
  };

  const handleExportPDF = async () => {
    if (!exportRef.current) return;
    const element = exportRef.current;
    const canvas = await html2canvas(element, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('tax-calculation.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex flex-col items-center mt-auto">
      <div className="w-full max-w-3xl bg-white p-6 rounded-2xl shadow-xl space-y-6">
        <h1 className="text-3xl font-bold text-center text-gray-800">Income Tax Calculator</h1>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm text-gray-600">Assessment Year</label>
            <select value={year} onChange={(e) => setYear(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded">
              <option>2025 - 2026</option>
              <option>2024 - 2025</option>
            </select>
          </div>
          <div>
            <label className="block text-sm text-gray-600">Age Category</label>
            <select value={age} onChange={(e) => setAge(e.target.value)} className="w-full mt-1 border px-3 py-2 rounded">
              <option>Below 60</option>
              <option>60 - 80</option>
              <option>Above 80</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm text-gray-600 mb-1">Choose Tax Regime</label>
          <select value={taxRegime} onChange={(e) => setTaxRegime(e.target.value)} className="w-full border px-3 py-2 rounded">
            <option value="new">New Regime</option>
            <option value="old">Old Regime</option>
          </select>
        </div>

        <div className="space-y-2">
          <CollapsibleSection
            title="Income"
            isOpen={openSection === 'income'}
            toggle={() => setOpenSection(openSection === 'income' ? null : 'income')}
          >
            <input type="number" placeholder="Salary" value={salary} onChange={(e) => setSalary(e.target.value)} className="w-full border px-3 py-2 rounded" />
            <input type="number" placeholder="Other Income" value={otherIncome} onChange={(e) => setOtherIncome(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </CollapsibleSection>

          <CollapsibleSection
            title="Deductions"
            isOpen={openSection === 'deductions'}
            toggle={() => setOpenSection(openSection === 'deductions' ? null : 'deductions')}
          >
            <input type="number" placeholder="Section 80C" value={deduction80C} onChange={(e) => setDeduction80C(e.target.value)} className="w-full border px-3 py-2 rounded" />
            <input type="number" placeholder="Section 80D" value={deduction80D} onChange={(e) => setDeduction80D(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </CollapsibleSection>

          <CollapsibleSection
            title="HRA Exemption"
            isOpen={openSection === 'hra'}
            toggle={() => setOpenSection(openSection === 'hra' ? null : 'hra')}
          >
            <input type="number" placeholder="HRA Received" value={hra} onChange={(e) => setHRA(e.target.value)} className="w-full border px-3 py-2 rounded" />
            <input type="number" placeholder="Rent Paid" value={rent} onChange={(e) => setRent(e.target.value)} className="w-full border px-3 py-2 rounded" />
            <input type="number" placeholder="Basic Salary" value={basic} onChange={(e) => setBasic(e.target.value)} className="w-full border px-3 py-2 rounded" />
          </CollapsibleSection>
        </div>

        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={handleCalculate}
          className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-3 rounded-lg"
        >
          Calculate Tax
        </motion.button>
      </div>

      {chartData && (
        <>
          <div ref={exportRef} className="w-full max-w-6xl mt-8 space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-white p-5 rounded-xl shadow-md">
                <h3 className="text-lg font-semibold text-gray-700 mb-3">Income vs Deductions</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart
                    data={[
                      { name: 'Income', value: chartData.totalIncome },
                      { name: 'Deductions', value: chartData.totalDeductions }
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis tickFormatter={(v) => v.toLocaleString()} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="value" fill="#3B82F6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white p-5 rounded-xl shadow-md">
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
                    >
                      {COLORS.map((color, i) => <Cell key={i} fill={color} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white p-5 rounded-xl shadow-md">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Tax Comparison</h3>
              <p><strong>Old Regime Tax:</strong> ₹{chartData.taxOld.toLocaleString()}</p>
              <p><strong>New Regime Tax:</strong> ₹{chartData.taxNew.toLocaleString()}</p>
              <p className="mt-2">
                <strong>Best Option:</strong> {
                  chartData.taxOld < chartData.taxNew ? 'Old Regime' :
                    chartData.taxNew < chartData.taxOld ? 'New Regime' : 'Both are equal'
                }
              </p>
            </div>
          </div>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleExportPDF}
            className="mt-6 w-full max-w-6xl px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg"
          >
            Export as PDF
          </motion.button>
        </>
      )}
    </div>
  );
}
