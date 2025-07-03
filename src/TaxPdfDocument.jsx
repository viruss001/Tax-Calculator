import React from 'react';
import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
    fontFamily: 'Helvetica',
  },
  heading: {
    fontSize: 20,
    textAlign: 'center',
    marginBottom: 20,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 15,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    fontWeight: 'bold',
  },
  row: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  text: {
    fontSize: 12,
  },
  chart: {
    marginTop: 10,
    padding: 10,
    border: '1 solid #ccc',
    borderRadius: 4,
  },
  imageWrapper: {
    marginTop: 20,
    alignItems: 'center',
  },
  image: {
    width: 300,
    height: 200,
    objectFit: 'contain',
    marginTop: 10,
  },
  footer: {
    fontSize: 10,
    marginTop: 20,
    textAlign: 'center',
    color: '#555',
  },
});

const formatNumber = (num) => {
  // Ensure proper number formatting without leading 1s
  if (typeof num === 'string') {
    // Remove any non-numeric characters except decimal point
    const cleaned = num.replace(/[^0-9.]/g, '');
    return parseFloat(cleaned).toFixed(2);
  }
  return num.toFixed(2);
};

const TaxPdfDocument = ({
  result = { old: 0, new: 0 },
  income = 0,
  deductions = 0,
  hra = 0,
  otherExemptions = 0,
  age = 0,
  chartImage = null,
}) => {
  // Safely format all numbers
  const totalOld = formatNumber(result.old);
  const totalNew = formatNumber(result.new);
  const total = formatNumber(parseFloat(totalOld) + parseFloat(totalNew));
  const percentOld = ((result.old / (result.old + result.new)) * 100).toFixed(1);
  const percentNew = ((result.new / (result.old + result.new)) * 100).toFixed(1);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.heading}>Tax Comparison Report</Text>

        <View style={styles.section}>
          <Text style={styles.label}>Personal & Income Details</Text>
          <View style={styles.row}>
            <Text>Annual Income:</Text>
            <Text>{formatNumber(income)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Deductions:</Text>
            <Text>{formatNumber(deductions)}</Text>
          </View>
          <View style={styles.row}>
            <Text>HRA:</Text>
            <Text>{formatNumber(hra)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Other Exemptions:</Text>
            <Text>{formatNumber(otherExemptions)}</Text>
          </View>
          <View style={styles.row}>
            <Text>Age:</Text>
            <Text>{age}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.label}>Tax Payable</Text>
          <View style={styles.row}>
            <Text>Old Regime:</Text>
            <Text>{totalOld}</Text>
          </View>
          <View style={styles.row}>
            <Text>New Regime:</Text>
            <Text>{totalNew}</Text>
          </View>
        </View>

        <View style={styles.chart}>
          <Text style={styles.label}>Tax Distribution Summary</Text>
          <Text>Old Regime: {totalOld} ({percentOld}%)</Text>
          <Text>New Regime: {totalNew} ({percentNew}%)</Text>
          <Text>Total: {total}</Text>
        </View>

        {/* {chartImage && (
          <View style={styles.imageWrapper}>
            <Text style={styles.label}>Pie Chart Visualization</Text>
            <Image src={chartImage} style={styles.image} />
          </View>
        )} */}

        <Text style={styles.footer}>
          Krishna Pathak 
        </Text>
      </Page>
    </Document>
  );
};

export default TaxPdfDocument;