import { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns'; // Import parseISO for date parsing
import { FileSpreadsheet, FileText, Calendar, ChevronDown, ChevronRight, BarChart } from 'lucide-react'; // Added BarChart icon
import { DataService } from '../lib/dataService'; // Assuming this path is correct
import type { MilkRecord, MonthlyTotal } from '../types'; // Assuming this path is correct
import { Button } from './ui/Button'; // Assuming this Button component exists and is styled

const Reports = () => {
  const [activeMonth, setActiveMonth] = useState(format(new Date(), 'yyyy-MM'));
  const [records, setRecords] = useState<MilkRecord[]>([]);
  const [archivedMonths, setArchivedMonths] = useState<MonthlyTotal[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedMonth, setExpandedMonth] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [activeMonth]); // Dependency on activeMonth

  const loadData = async () => {
    setLoading(true);
    try {
      // Load current month's records
      const currentRecords = await DataService.getMonthlyRecords(activeMonth);
      // Sort records by date descending for display
      const sortedCurrentRecords = currentRecords.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(sortedCurrentRecords);

      // Load archived months data for the last 12 months
      const archived = await DataService.getMonthlyComparison(12);
      // Sort archived months from newest to oldest
      const sortedArchived = archived.sort((a, b) => new Date(b.month).getTime() - new Date(a.month).getTime());
      setArchivedMonths(sortedArchived);
    } catch (error) {
      console.error('Error loading reports:', error);
      // Optionally, set an error message in state to display to the user
    } finally {
      setLoading(false);
    }
  };

  const generatePDF = async (recordsToExport: MilkRecord[], month: string) => {
    try {
      const { jsPDF } = await import('jspdf');
      const { default: autoTable } = await import('jspdf-autotable');

      const doc = new jsPDF();
      const formattedMonth = format(parseISO(month), 'MMMM yyyy'); // Use parseISO for consistency
      const title = `Milk Production Report - ${formattedMonth}`;

      doc.setFontSize(16);
      doc.setTextColor(52, 58, 64); // Dark gray for title
      doc.text(title, 14, 15);

      const tableData = recordsToExport.map(record => [
        format(parseISO(record.date), 'dd MMM yyyy'), // Use parseISO
        record.morning_milk.toFixed(1), // Format to 1 decimal
        record.evening_milk.toFixed(1), // Format to 1 decimal
        record.total_milk.toFixed(1) // Format to 1 decimal
      ]);

      autoTable(doc, {
        head: [['Date', 'Morning (L)', 'Evening (L)', 'Total (L)']],
        body: tableData,
        startY: 25,
        theme: 'grid',
        styles: { fontSize: 9, cellPadding: 2, textColor: [52, 58, 64] }, // Darker text
        headStyles: { fillColor: [76, 175, 80], textColor: 255, fontStyle: 'bold' }, // Green theme for header
        columnStyles: {
          1: { halign: 'right' }, // Align numbers to right
          2: { halign: 'right' },
          3: { halign: 'right' }
        }
      });

      // Add summary at the bottom
      const finalY = (doc as any).lastAutoTable.finalY + 10; // Get y position after table
      const totals = {
        morning: recordsToExport.reduce((sum, r) => sum + r.morning_milk, 0),
        evening: recordsToExport.reduce((sum, r) => sum + r.evening_milk, 0),
        total: recordsToExport.reduce((sum, r) => sum + r.total_milk, 0)
      };

      doc.setFontSize(10);
      doc.setTextColor(52, 58, 64);
      doc.text('Monthly Totals:', 14, finalY);
      doc.setFontSize(10);
      doc.setTextColor(76, 175, 80); // Green color for totals
      doc.text(`Morning: ${totals.morning.toFixed(1)}L`, 14, finalY + 7);
      doc.text(`Evening: ${totals.evening.toFixed(1)}L`, 14, finalY + 14);
      doc.text(`Total: ${totals.total.toFixed(1)}L`, 14, finalY + 21);


      doc.save(`milk-report-${formattedMonth.replace(/\s/g, '-')}.pdf`); // Clean filename
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Provide user feedback
      alert('Failed to generate PDF. Please try again.');
    }
  };

  const generateExcel = async (recordsToExport: MilkRecord[], month: string) => {
    try {
      const XLSX = await import('xlsx');
      const formattedMonth = format(parseISO(month), 'MMMM yyyy'); // Use parseISO for consistency

      const worksheet = XLSX.utils.json_to_sheet(
        recordsToExport.map(record => ({
          Date: format(parseISO(record.date), 'dd MMM yyyy'),
          'Morning (L)': record.morning_milk.toFixed(1),
          'Evening (L)': record.evening_milk.toFixed(1),
          'Total (L)': record.total_milk.toFixed(1)
        }))
      );

      // Add totals row
      const totals = {
        morning: recordsToExport.reduce((sum, r) => sum + r.morning_milk, 0),
        evening: recordsToExport.reduce((sum, r) => sum + r.evening_milk, 0),
        total: recordsToExport.reduce((sum, r) => sum + r.total_milk, 0)
      };

      XLSX.utils.sheet_add_json(worksheet, [{
        Date: 'Monthly Totals',
        'Morning (L)': totals.morning.toFixed(1),
        'Evening (L)': totals.evening.toFixed(1),
        'Total (L)': totals.total.toFixed(1)
      }], { origin: -1 }); // Append after last row

      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Milk Records');
      XLSX.writeFile(workbook, `milk-report-${formattedMonth.replace(/\s/g, '-')}.xlsx`); // Clean filename
    } catch (error) {
      console.error('Error generating Excel:', error);
      // Provide user feedback
      alert('Failed to generate Excel file. Please try again.');
    }
  };

  // Helper to fetch details for an archived month before export
  const handleExportArchived = async (monthStr: string, type: 'pdf' | 'excel') => {
    setLoading(true); // Indicate loading while fetching archived data
    try {
      const archivedRecords = await DataService.getMonthlyRecords(monthStr); // Fetch full records for the month
      if (type === 'pdf') {
        await generatePDF(archivedRecords, monthStr);
      } else {
        await generateExcel(archivedRecords, monthStr);
      }
    } catch (error) {
      console.error(`Error exporting archived ${monthStr} (${type}):`, error);
      alert(`Failed to export archived records for ${monthStr}.`);
    } finally {
      setLoading(false); // End loading
    }
  };

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen"> {/* Light theme background */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
          <BarChart className="h-8 w-8 mr-3 text-green-600" /> {/* Themed icon */}
          Production Reports
        </h1>

        {/* Month Selection */}
        <div className="relative">
          <input
            type="month"
            value={activeMonth}
            onChange={(e) => setActiveMonth(e.target.value)}
            className="pl-4 pr-10 py-2 border border-gray-300 rounded-lg shadow-sm focus:ring-green-500 focus:border-green-500 bg-white text-gray-800"
          />
          <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 pointer-events-none" /> {/* Calendar icon */}
        </div>
      </div>

      {/* Current Month Section */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Current Month: {format(parseISO(activeMonth), 'MMMM yyyy')}
            </h2>

            <div className="flex flex-wrap gap-3">
              <Button
                variant="secondary" // Assuming these variants are styled green/white
                icon={FileSpreadsheet}
                onClick={() => generateExcel(records, activeMonth)}
                disabled={loading || records.length === 0}
              >
                Export Excel
              </Button>

              <Button
                variant="primary" // Assuming these variants are styled green/white
                icon={FileText}
                onClick={() => generatePDF(records, activeMonth)}
                disabled={loading || records.length === 0}
              >
                Export PDF
              </Button>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div> {/* Green spinner */}
          </div>
        ) : records.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50"> {/* Green table header */}
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Morning (L)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Evening (L)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Total (L)</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {format(parseISO(record.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.morning_milk.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.evening_milk.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-semibold">{record.total_milk.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-green-100"> {/* Green footer for totals */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-800">Monthly Totals</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-800">
                    {records.reduce((sum, record) => sum + record.morning_milk, 0).toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-800">
                    {records.reduce((sum, record) => sum + record.evening_milk, 0).toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-800">
                    {records.reduce((sum, record) => sum + record.total_milk, 0).toFixed(1)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-600">
            No milk records available for {format(parseISO(activeMonth), 'MMMM yyyy')}.
          </div>
        )}
      </div>

      {/* Archived Reports Section */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-100">
        <div className="p-4 sm:p-6 border-b border-gray-100">
          <h2 className="text-xl font-semibold text-gray-800">Past Monthly Summaries</h2>
        </div>

        <div className="divide-y divide-gray-100">
          {archivedMonths.length > 0 ? (
            archivedMonths.map((monthData) => (
              <div key={monthData.month} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors duration-150">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <button
                    onClick={() => setExpandedMonth(expandedMonth === monthData.month ? null : monthData.month)}
                    className="flex items-center text-left w-full sm:w-auto focus:outline-none focus:ring-2 focus:ring-green-500 rounded-md p-1 -ml-1"
                  >
                    <span className="mr-3 text-green-600"> {/* Icon color */}
                      {expandedMonth === monthData.month ? (
                        <ChevronDown className="h-6 w-6" />
                      ) : (
                        <ChevronRight className="h-6 w-6" />
                      )}
                    </span>
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-800">
                        {format(parseISO(monthData.month), 'MMMM yyyy')}
                      </h3>
                      <p className="text-sm text-gray-600">
                        Total: <span className="font-semibold text-green-700">{monthData.total_milk.toFixed(1)}L</span> | Avg Daily: <span className="font-semibold text-green-700">{monthData.average_daily.toFixed(1)}L</span>
                      </p>
                    </div>
                  </button>

                  <div className="flex flex-wrap gap-2 sm:ml-auto">
                    <Button
                      variant="secondary"
                      icon={FileSpreadsheet}
                      onClick={() => handleExportArchived(monthData.month, 'excel')}
                      disabled={loading}
                      size="sm"
                    >
                      Excel
                    </Button>
                    <Button
                      variant="primary"
                      icon={FileText}
                      onClick={() => handleExportArchived(monthData.month, 'pdf')}
                      disabled={loading}
                      size="sm"
                    >
                      PDF
                    </Button>
                  </div>
                </div>

                {expandedMonth === monthData.month && (
                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                    <div className="p-3 rounded bg-white border border-gray-200 shadow-sm">
                      <dt className="text-sm text-gray-600">Morning Total</dt>
                      <dd className="text-lg font-semibold text-green-700">{monthData.morning_total.toFixed(1)} L</dd>
                    </div>
                    <div className="p-3 rounded bg-white border border-gray-200 shadow-sm">
                      <dt className="text-sm text-gray-600">Evening Total</dt>
                      <dd className="text-lg font-semibold text-green-700">{monthData.evening_total.toFixed(1)} L</dd>
                    </div>
                    <div className="p-3 rounded bg-white border border-gray-200 shadow-sm">
                      <dt className="text-sm text-gray-600">Highest Day</dt>
                      <dd className="text-lg font-semibold text-green-700">{monthData.highest_day.toFixed(1)} L</dd>
                    </div>
                    <div className="p-3 rounded bg-white border border-gray-200 shadow-sm">
                      <dt className="text-sm text-gray-600">Lowest Day</dt>
                      <dd className="text-lg font-semibold text-green-700">{monthData.lowest_day.toFixed(1)} L</dd>
                    </div>
                    {/* Placeholder for any additional data fields */}
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-600">
              No archived reports available for the last 12 months.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Reports;