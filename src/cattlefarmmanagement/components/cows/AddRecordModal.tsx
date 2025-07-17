// src/components/cows/AddRecordModal.tsx
import { useState, useEffect } from 'react'; // Import useEffect for setting initial date
import { X, HeartPulse, Stethoscope, Baby, Syringe, ClipboardList, Droplet } from 'lucide-react'; // Added icons
import { v4 as uuidv4 } from 'uuid'; // Ensure uuid is installed: npm install uuid @types/uuid
import type { HealthRecord, BreedingRecord } from '../../types'; // Assuming this path is correct

// Ensure your types.ts defines these literal string types for record_type and pregnancy_status
// Example:
// export interface HealthRecord {
//   // ... other fields
//   record_type: 'Checkup' | 'Vaccination' | 'Treatment' | 'Medication' | 'Surgery';
//   // ...
// }
// export interface BreedingRecord {
//   // ... other fields
//   record_type: 'AI' | 'Natural' | 'Calving' | 'Pregnancy Check';
//   pregnancy_status: 'Unknown' | 'Confirmed' | 'Not Pregnant';
//   // ...
// }

interface Props {
  type: 'health' | 'breeding';
  cowId: string;
  onClose: () => void;
  // onSave now expects the record type to match what's being saved
  onSave: (record: HealthRecord | BreedingRecord) => Promise<void>;
  // If you wanted to support editing, you'd add:
  // record?: HealthRecord | BreedingRecord;
  // onDelete?: (recordId: string) => Promise<void>;
}

// Separate form states for better type safety and clarity
interface HealthFormState {
  date: string;
  record_type: HealthRecord['record_type'];
  description: string;
  medicines: string;
  vet_name: string;
  next_followup: string;
}

interface BreedingFormState {
  date: string;
  record_type: BreedingRecord['record_type'];
  semen_source: string;
  technician_name: string;
  pregnancy_status: BreedingRecord['pregnancy_status'];
  pregnancy_check_date: string;
  notes: string;
  calving_date?: string; // Optional only if pregnancy_status is not 'Confirmed'
}

const AddRecordModal = ({ type, cowId, onClose, onSave }: Props) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Initialize form state with current date for new records
  const initialFormState =
    type === 'health'
      ? {
          date: format(new Date(), 'yyyy-MM-dd'), // Set default to today's date
          record_type: 'Checkup', // Default health record type
          description: '',
          medicines: '',
          vet_name: '',
          next_followup: '',
        }
      : {
          date: format(new Date(), 'yyyy-MM-dd'), // Set default to today's date
          record_type: 'AI', // Default breeding record type
          semen_source: '',
          technician_name: '',
          pregnancy_status: 'Unknown',
          pregnancy_check_date: '',
          notes: '',
          calving_date: '',
        };

  const [form, setForm] = useState<HealthFormState | BreedingFormState>(initialFormState);

  // Set initial date only once on mount for "Add" scenario
  useEffect(() => {
    setForm(initialFormState);
  }, [type, cowId]); // Reset form if type or cowId changes (e.g., modal is reused)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(''); // Clear previous errors

    try {
      const now = new Date().toISOString();

      let recordToSave: HealthRecord | BreedingRecord;

      if (type === 'health') {
        const healthForm = form as HealthFormState;
        if (!healthForm.date || !healthForm.description || !healthForm.record_type) {
          throw new Error('Please fill all required health record fields.');
        }
        recordToSave = {
          id: uuidv4(), // Generate unique ID
          cow_id: cowId,
          date: healthForm.date,
          record_type: healthForm.record_type,
          description: healthForm.description,
          medicines: healthForm.medicines,
          vet_name: healthForm.vet_name,
          next_followup: healthForm.next_followup,
          created_at: now,
          updated_at: now,
        };
      } else {
        const breedingForm = form as BreedingFormState;
        if (!breedingForm.date || !breedingForm.record_type || !breedingForm.pregnancy_status) {
          throw new Error('Please fill all required breeding record fields.');
        }
        if (breedingForm.pregnancy_status === 'Confirmed' && !breedingForm.calving_date) {
          throw new Error('Expected Calving Date is required for confirmed pregnancies.');
        }
        recordToSave = {
          id: uuidv4(), // Generate unique ID
          cow_id: cowId,
          date: breedingForm.date,
          record_type: breedingForm.record_type,
          semen_source: breedingForm.semen_source,
          technician_name: breedingForm.technician_name,
          pregnancy_status: breedingForm.pregnancy_status,
          pregnancy_check_date: breedingForm.pregnancy_check_date,
          notes: breedingForm.notes,
          calving_date: breedingForm.calving_date, // This will be undefined if not confirmed, which is fine based on type
          created_at: now,
          updated_at: now,
        };
      }

      await onSave(recordToSave); // Call the onSave prop with the correctly typed record
      onClose(); // Close modal on success
    } catch (err: any) {
      console.error('Error saving record:', err);
      setError(err.message || 'Failed to save record.');
    } finally {
      setLoading(false);
    }
  };

  // Helper for consistent input styling
  const inputClassName = "mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 bg-gray-50 text-gray-800 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200";
  const labelClassName = "block text-sm font-medium text-gray-700 dark:text-gray-200";

  return (
    <div className="fixed inset-0 bg-gray-900 bg-opacity-70 flex items-center justify-center p-4 z-50"> {/* Darker overlay */}
      <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md border border-gray-100 dark:bg-gray-800 dark:border-gray-700"> {/* Themed modal card */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white flex items-center">
            {type === 'health' ? (
              <>
                <Stethoscope className="h-6 w-6 mr-2 text-green-600" /> Add Health Record
              </>
            ) : (
              <>
                <Baby className="h-6 w-6 mr-2 text-green-600" /> Add Breeding Record
              </>
            )}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:text-gray-200"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg border border-red-200 dark:bg-red-900/20 dark:text-red-300">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5"> {/* Increased spacing */}
          <div>
            <label htmlFor="recordDate" className={labelClassName}>Date*</label>
            <input
              type="date"
              id="recordDate"
              required
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              className={inputClassName}
            />
          </div>

          <div>
            <label htmlFor="recordType" className={labelClassName}>Record Type*</label>
            <select
              id="recordType"
              required
              value={form.record_type}
              onChange={e => setForm(f => ({ ...f, record_type: e.target.value as any }))} // Type assertion for onChange
              className={inputClassName}
            >
              {type === 'health' ? (
                <>
                  <option value="Checkup">Checkup</option>
                  <option value="Vaccination">Vaccination</option>
                  <option value="Treatment">Treatment</option>
                  <option value="Medication">Medication</option>
                  <option value="Surgery">Surgery</option>
                  {/* Add more specific health record types if needed */}
                </>
              ) : (
                <>
                  <option value="AI">Artificial Insemination (AI)</option>
                  <option value="Natural">Natural Service</option>
                  <option value="Pregnancy Check">Pregnancy Check</option>
                  <option value="Calving">Calving</option>
                </>
              )}
            </select>
          </div>

          {type === 'health' ? (
            <>
              <div>
                <label htmlFor="description" className={labelClassName}>Description*</label>
                <textarea
                  id="description"
                  required
                  value={'description' in form ? form.description : ''}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  className={inputClassName}
                  rows={3}
                  placeholder="Describe the health event, symptoms, etc."
                />
              </div>

              <div>
                <label htmlFor="medicines" className={labelClassName}>
                  Medicines (comma-separated)
                </label>
                <input
                  type="text"
                  id="medicines"
                  value={'medicines' in form ? form.medicines : ''}
                  onChange={e => setForm(f => ({ ...f, medicines: e.target.value }))}
                  className={inputClassName}
                  placeholder="e.g. Antibiotic X, Vitamin Y"
                />
              </div>

              <div>
                <label htmlFor="vetName" className={labelClassName}>Veterinarian Name</label>
                <input
                  type="text"
                  id="vetName"
                  value={'vet_name' in form ? form.vet_name : ''}
                  onChange={e => setForm(f => ({ ...f, vet_name: e.target.value }))}
                  className={inputClassName}
                  placeholder="e.g. Dr. John Doe"
                />
              </div>

              <div>
                <label htmlFor="nextFollowup" className={labelClassName}>Next Follow-up Date</label>
                <input
                  type="date"
                  id="nextFollowup"
                  value={'next_followup' in form ? form.next_followup : ''}
                  onChange={e => setForm(f => ({ ...f, next_followup: e.target.value }))}
                  className={inputClassName}
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="semenSource" className={labelClassName}>Semen Source (for AI)</label>
                <input
                  type="text"
                  id="semenSource"
                  value={'semen_source' in form ? form.semen_source : ''}
                  onChange={e => setForm(f => ({ ...f, semen_source: e.target.value }))}
                  className={inputClassName}
                  placeholder="e.g. AI Centre, Bull Name"
                />
              </div>

              <div>
                <label htmlFor="technicianName" className={labelClassName}>Technician Name</label>
                <input
                  type="text"
                  id="technicianName"
                  value={'technician_name' in form ? form.technician_name : ''}
                  onChange={e => setForm(f => ({ ...f, technician_name: e.target.value }))}
                  className={inputClassName}
                  placeholder="e.g. Jane Smith"
                />
              </div>

              <div>
                <label htmlFor="pregnancyStatus" className={labelClassName}>Pregnancy Status*</label>
                <select
                  id="pregnancyStatus"
                  required
                  value={'pregnancy_status' in form ? form.pregnancy_status : 'Unknown'}
                  onChange={e => setForm(f => ({ ...f, pregnancy_status: e.target.value as any }))}
                  className={inputClassName}
                >
                  <option value="Unknown">Unknown</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Not Pregnant">Not Pregnant</option>
                </select>
              </div>

              {('pregnancy_status' in form && form.pregnancy_status === 'Confirmed') && (
                <div>
                  <label htmlFor="calvingDate" className={labelClassName}>
                    Expected Calving Date*
                  </label>
                  <input
                    type="date"
                    id="calvingDate"
                    required // Make required when status is Confirmed
                    value={form.calving_date || ''}
                    onChange={e => setForm(f => ({ ...f, calving_date: e.target.value }))}
                    className={inputClassName}
                  />
                </div>
              )}

              {('record_type' in form && form.record_type === 'Pregnancy Check') && (
                <div>
                  <label htmlFor="pregnancyCheckDate" className={labelClassName}>
                    Pregnancy Check Date
                  </label>
                  <input
                    type="date"
                    id="pregnancyCheckDate"
                    value={form.pregnancy_check_date || ''}
                    onChange={e => setForm(f => ({ ...f, pregnancy_check_date: e.target.value }))}
                    className={inputClassName}
                  />
                </div>
              )}

              <div>
                <label htmlFor="notes" className={labelClassName}>Notes</label>
                <textarea
                  id="notes"
                  value={'notes' in form ? form.notes : ''}
                  onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
                  className={inputClassName}
                  rows={3}
                  placeholder="Any additional details about this breeding event"
                />
              </div>
            </>
          )}

          <div className="pt-4 flex justify-end space-x-3"> {/* Added padding top */}
            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center px-5 py-2.5 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors dark:border-gray-600 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="inline-flex items-center px-5 py-2.5 border border-transparent text-base font-medium rounded-lg text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Record'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddRecordModal;