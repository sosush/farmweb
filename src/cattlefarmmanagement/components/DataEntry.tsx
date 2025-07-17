import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Save, Trash2, Edit2, PlusCircle, Milk } from 'lucide-react';
import { DataService } from '../lib/dataService';
import type { MilkRecord } from '../types';

const DataEntry = () => {
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [morningMilk, setMorningMilk] = useState('');
  const [eveningMilk, setEveningMilk] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: string; text: string } | null>(null);
  const [editingRecord, setEditingRecord] = useState<MilkRecord | null>(null);
  const [records, setRecords] = useState<MilkRecord[]>([]);

  useEffect(() => {
    loadRecords();
  }, [date]);

  const loadRecords = async () => {
    try {
      setLoading(true);
      const month = format(new Date(date), 'yyyy-MM');
      const data = await DataService.getMonthlyRecords(month);
      const sortedData = data.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setRecords(sortedData);
    } catch (error) {
      console.error("Failed to load records:", error);
      setMessage({ type: 'error', text: 'Failed to load records.' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      if (!morningMilk || !eveningMilk) {
        throw new Error('Please enter both morning and evening milk values.');
      }
      if (parseFloat(morningMilk) < 0 || parseFloat(eveningMilk) < 0) {
        throw new Error('Milk values cannot be negative.');
      }

      const recordData = {
        date,
        morning_milk: parseFloat(morningMilk),
        evening_milk: parseFloat(eveningMilk),
        total_milk: parseFloat(morningMilk) + parseFloat(eveningMilk),
        user_id: '1',
        created_at: editingRecord?.created_at || new Date().toISOString(),
        updated_at: new Date().toISOString(),
        ...(editingRecord && { id: editingRecord.id })
      };

      await DataService.saveRecord(recordData);
      setMessage({
        type: 'success',
        text: editingRecord ? 'Milk record updated successfully!' : 'Milk record saved successfully!'
      });

      resetForm();
      loadRecords();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error.message || 'Failed to save record.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (record: MilkRecord) => {
    setDate(record.date);
    setMorningMilk(record.morning_milk.toString());
    setEveningMilk(record.evening_milk.toString());
    setEditingRecord(record);
    setMessage(null);
  };

  const handleDelete = async (recordId: string) => {
    if (!window.confirm('Are you sure you want to delete this record?')) {
      return;
    }
    setLoading(true);
    setMessage(null);
    try {
      await DataService.deleteRecord(recordId);
      setMessage({ type: 'success', text: 'Record deleted successfully!' });
      loadRecords();
    } catch (error: any) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete record.' });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setDate(format(new Date(), 'yyyy-MM-dd'));
    setMorningMilk('');
    setEveningMilk('');
    setMessage(null);
    setEditingRecord(null);
  };

  const inputClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";
  const labelClassName = "block text-sm font-medium text-gray-700"; // Removed dark:text-black since it's redundant/not always needed with dark:text-gray-200 on inputs

  return (
    <div className="space-y-8 p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-extrabold text-gray-800 flex items-center">
        <Milk className="h-8 w-8 mr-3 text-green-600" />
        Milk Production Entry
      </h1>

      {message && (
        <div
          className={`p-4 rounded-lg text-white font-medium ${
            message.type === 'success' ? 'bg-green-500' : 'bg-red-500'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800 flex items-center">
          <PlusCircle className="h-5 w-5 mr-2 text-green-600" />
          {editingRecord ? 'Edit Milk Record' : 'Add New Milk Record'}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="date" className={labelClassName}>
                Date
              </label>
              <input
                type="date"
                id="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label htmlFor="morningMilk" className={labelClassName}>
                Morning Milk (Liters)*
              </label>
              <input
                type="number"
                id="morningMilk"
                value={morningMilk}
                onChange={(e) => setMorningMilk(e.target.value)}
                step="0.1"
                min="0"
                className={inputClassName}
                required
              />
            </div>

            <div>
              <label htmlFor="eveningMilk" className={labelClassName}>
                Evening Milk (Liters)*
              </label>
              <input
                type="number"
                id="eveningMilk"
                value={eveningMilk}
                onChange={(e) => setEveningMilk(e.target.value)}
                step="0.1"
                min="0"
                className={inputClassName}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 mt-6">
            <button
              type="button"
              onClick={resetForm}
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              <Trash2 className="h-5 w-5 mr-2" />
              Clear Form
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2.5 border border-transparent shadow-sm text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Save className="h-5 w-5 mr-2" />
              {loading ? 'Saving...' : editingRecord ? 'Update Record' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <h2 className="text-xl font-semibold mb-6 text-gray-800">Past 30 Days Records</h2>
        <div className="overflow-x-auto">
          {records.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                {/* REMOVED WHITESPACE: This line must be immediately followed by <tr> */}
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Morning (L)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Evening (L)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Total (L)</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-green-800 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {/* REMOVED WHITESPACE: This line must be immediately followed by <tr>, or the map result */}
                {records.map((record) => (
                  <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-800">
                      {format(new Date(record.date), 'dd MMM yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.morning_milk.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{record.evening_milk.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-green-700 font-semibold">{record.total_milk.toFixed(1)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEdit(record)}
                          className="text-green-600 hover:text-green-800 transition-colors"
                          title="Edit Record"
                        >
                          <Edit2 className="h-5 w-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(record.id)}
                          className="text-red-600 hover:text-red-800 transition-colors"
                          title="Delete Record"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="bg-green-100">
                {/* REMOVED WHITESPACE: This line must be immediately followed by <tr> */}
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-800">Total</td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-800">
                    {records.reduce((sum, record) => sum + record.morning_milk, 0).toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-800">
                    {records.reduce((sum, record) => sum + record.evening_milk, 0).toFixed(1)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-base font-bold text-green-800">
                    {records.reduce((sum, record) => sum + record.total_milk, 0).toFixed(1)}
                  </td>
                  {/* Empty cell for Actions column in footer */}
                  <td className="px-6 py-4"></td>
                </tr>
              </tfoot>
            </table>
          ) : (
            <p className="text-gray-600 text-center py-8">No milk records available for this month.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default DataEntry;