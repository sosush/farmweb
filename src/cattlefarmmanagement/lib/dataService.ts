// src/lib/dataService.ts
// This is a simplified in-memory/localStorage mock service.
// In a real application, these would be API calls.

import { v4 as uuidv4 } from 'uuid'; // Assuming you use uuid for IDs
import { format } from 'date-fns'; // Assuming date-fns is used for formatting dates

interface MilkRecord {
  id: string;
  date: string;
  morning_milk: number;
  evening_milk: number;
  total_milk: number;
  user_id: string;
  created_at: string;
  updated_at: string;
}

// DataService for Milk Records
export const DataService = {
  // Mock data stored in localStorage for persistence across sessions
  _getRecordsFromStorage(): MilkRecord[] {
    if (typeof window === 'undefined') return []; // Server-side safety
    const recordsJson = localStorage.getItem('milkRecords');
    return recordsJson ? JSON.parse(recordsJson) : [];
  },

  _saveRecordsToStorage(records: MilkRecord[]): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('milkRecords', JSON.stringify(records));
    }
  },

  async getMonthlyRecords(month: string): Promise<MilkRecord[]> {
    console.log(`[DataService] Fetching records for month: ${month}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay
    const allRecords = this._getRecordsFromStorage();
    return allRecords.filter(record => record.date.startsWith(month));
  },

  async saveRecord(record: Partial<MilkRecord> & { id?: string }): Promise<MilkRecord> {
    console.log(`[DataService] Saving record:`, record);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

    let allRecords = this._getRecordsFromStorage();
    let savedRecord: MilkRecord;

    if (record.id) {
      // Update existing record
      allRecords = allRecords.map(r =>
        r.id === record.id ? { ...r, ...record, updated_at: new Date().toISOString() } as MilkRecord : r
      );
      savedRecord = allRecords.find(r => r.id === record.id) || record as MilkRecord;
    } else {
      // Add new record
      savedRecord = {
        id: uuidv4(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: record.user_id || 'default_user', // Ensure user_id if not provided
        // Ensure all required fields are present and typed correctly
        date: record.date || format(new Date(), 'yyyy-MM-dd'),
        morning_milk: record.morning_milk || 0,
        evening_milk: record.evening_milk || 0,
        total_milk: record.total_milk || 0,
        ...record, // Spread record to override defaults if explicitly provided
      };
      allRecords.push(savedRecord);
    }

    this._saveRecordsToStorage(allRecords);
    return savedRecord;
  },

  // === THIS IS THE CRITICAL PART FOR YOUR DELETE FUNCTIONALITY ===
  async deleteRecord(recordId: string): Promise<void> {
    console.log(`[DataService] Attempting to delete record with ID: ${recordId}`);
    await new Promise(resolve => setTimeout(resolve, 300)); // Simulate API delay

    let allRecords = this._getRecordsFromStorage();
    const initialLength = allRecords.length;
    allRecords = allRecords.filter(record => record.id !== recordId);

    if (allRecords.length < initialLength) {
      this._saveRecordsToStorage(allRecords);
      console.log(`[DataService] Successfully deleted record ${recordId}`);
    } else {
      console.warn(`[DataService] Record with ID ${recordId} not found for deletion.`);
      throw new Error(`Record with ID ${recordId} not found.`); // Or handle more gracefully
    }
  },

  // Add mock implementations for CowService methods if they are in the same file
  // This is a common pattern for simple mock backends. If CowService is separate, ignore.
  async getCows(filters?: any): Promise<any[]> {
    console.log('[CowService - Mock] Fetching cows with filters:', filters);
    await new Promise(resolve => setTimeout(resolve, 300));
    const mockCows = JSON.parse(localStorage.getItem('mockCows') || '[]');
    let filteredCows = mockCows;

    if (filters?.status) {
      filteredCows = filteredCows.filter((cow: any) => cow.status === filters.status);
    }
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filteredCows = filteredCows.filter((cow: any) =>
        cow.tag_number.toLowerCase().includes(searchTerm) ||
        (cow.name && cow.name.toLowerCase().includes(searchTerm))
      );
    }
    return filteredCows;
  },

  async saveCow(cow: any): Promise<any> {
    console.log('[CowService - Mock] Saving cow:', cow);
    await new Promise(resolve => setTimeout(resolve, 300));
    let mockCows = JSON.parse(localStorage.getItem('mockCows') || '[]');
    if (cow.id) {
      mockCows = mockCows.map((c: any) => c.id === cow.id ? { ...c, ...cow, updated_at: new Date().toISOString() } : c);
    } else {
      const newCow = { ...cow, id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockCows.push(newCow);
    }
    localStorage.setItem('mockCows', JSON.stringify(mockCows));
    return cow;
  },

  async deleteCow(cowId: string): Promise<void> {
    console.log('[CowService - Mock] Deleting cow:', cowId);
    await new Promise(resolve => setTimeout(resolve, 300));
    let mockCows = JSON.parse(localStorage.getItem('mockCows') || '[]');
    mockCows = mockCows.filter((c: any) => c.id !== cowId);
    localStorage.setItem('mockCows', JSON.stringify(mockCows));
  },
  // Add other CowService methods like getCowById, getHealthRecords, getBreedingRecords, getUpcomingAlerts
  // ... (ensure these are also correctly implemented if used by your components)
  async getCowById(id: string): Promise<any | undefined> {
    const cows = await this.getCows(); // Reuse getCows to fetch
    return cows.find(cow => cow.id === id);
  },
  async getHealthRecords(cowId: string): Promise<any[]> {
    console.log(`[CowService - Mock] Fetching health records for cow: ${cowId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    const allHealthRecords = JSON.parse(localStorage.getItem('mockHealthRecords') || '[]');
    return allHealthRecords.filter((r: any) => r.cow_id === cowId);
  },
  async saveHealthRecord(record: any): Promise<any> {
    console.log('[CowService - Mock] Saving health record:', record);
    await new Promise(resolve => setTimeout(resolve, 200));
    let records = JSON.parse(localStorage.getItem('mockHealthRecords') || '[]');
    if (record.id) {
        records = records.map((r: any) => r.id === record.id ? { ...r, ...record, updated_at: new Date().toISOString() } : r);
    } else {
        const newRecord = { ...record, id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        records.push(newRecord);
    }
    localStorage.setItem('mockHealthRecords', JSON.stringify(records));
    return record;
  },
  async getBreedingRecords(cowId: string): Promise<any[]> {
    console.log(`[CowService - Mock] Fetching breeding records for cow: ${cowId}`);
    await new Promise(resolve => setTimeout(resolve, 200));
    const allBreedingRecords = JSON.parse(localStorage.getItem('mockBreedingRecords') || '[]');
    return allBreedingRecords.filter((r: any) => r.cow_id === cowId);
  },
  async saveBreedingRecord(record: any): Promise<any> {
    console.log('[CowService - Mock] Saving breeding record:', record);
    await new Promise(resolve => setTimeout(resolve, 200));
    let records = JSON.parse(localStorage.getItem('mockBreedingRecords') || '[]');
    if (record.id) {
        records = records.map((r: any) => r.id === record.id ? { ...r, ...record, updated_at: new Date().toISOString() } : r);
    } else {
        const newRecord = { ...record, id: uuidv4(), created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
        records.push(newRecord);
    }
    localStorage.setItem('mockBreedingRecords', JSON.stringify(records));
    return record;
  },
  async getMonthlyComparison(numMonths: number): Promise<any[]> {
    console.log(`[DataService - Mock] Getting monthly comparison for ${numMonths} months`);
    await new Promise(resolve => setTimeout(resolve, 200));
    const records = this._getRecordsFromStorage();
    const monthlyDataMap: { [key: string]: { total_milk: number, morning_total: number, evening_total: number, record_count: number, highest_day: number, lowest_day: number } } = {};

    records.forEach(record => {
      const month = record.date.substring(0, 7); // YYYY-MM
      if (!monthlyDataMap[month]) {
        monthlyDataMap[month] = { total_milk: 0, morning_total: 0, evening_total: 0, record_count: 0, highest_day: 0, lowest_day: Infinity };
      }
      monthlyDataMap[month].total_milk += record.total_milk;
      monthlyDataMap[month].morning_total += record.morning_milk;
      monthlyDataMap[month].evening_total += record.evening_milk;
      monthlyDataMap[month].record_count += 1;
      monthlyDataMap[month].highest_day = Math.max(monthlyDataMap[month].highest_day, record.total_milk);
      monthlyDataMap[month].lowest_day = Math.min(monthlyDataMap[month].lowest_day, record.total_milk);
    });

    const result = Object.keys(monthlyDataMap).map(month => ({
      month,
      total_milk: monthlyDataMap[month].total_milk,
      morning_total: monthlyDataMap[month].morning_total,
      evening_total: monthlyDataMap[month].evening_total,
      average_daily: monthlyDataMap[month].record_count > 0 ? monthlyDataMap[month].total_milk / monthlyDataMap[month].record_count : 0,
      highest_day: monthlyDataMap[month].highest_day,
      lowest_day: monthlyDataMap[month].lowest_day === Infinity ? 0 : monthlyDataMap[month].lowest_day // Handle no records
    }));

    // Sort by month (descending, newest first)
    return result.sort((a, b) => b.month.localeCompare(a.month)).slice(0, numMonths);
  },

  async checkAndArchiveOldMonth(): Promise<void> {
    console.log('[DataService - Mock] Checking and archiving old month data (mock).');
    await new Promise(resolve => setTimeout(resolve, 100)); // Simulate delay
    // In a real app, this would involve a backend process
    // For local storage, we simply keep all records for simplicity,
    // as getMonthlyRecords already filters by month.
  },

  async getUpcomingAlerts(): Promise<any> {
    console.log('[CowService - Mock] Fetching upcoming alerts.');
    await new Promise(resolve => setTimeout(resolve, 200));

    const mockCows = JSON.parse(localStorage.getItem('mockCows') || '[]');
    const mockBreedingRecords = JSON.parse(localStorage.getItem('mockBreedingRecords') || '[]');
    const mockHealthRecords = JSON.parse(localStorage.getItem('mockHealthRecords') || '[]');
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // For "soon" alerts

    const calvingAlerts: any[] = [];
    mockBreedingRecords.forEach((record: any) => {
      if (record.calving_date && record.pregnancy_status === 'Confirmed') {
        const calvingDate = new Date(record.calving_date);
        const diffTime = calvingDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Alert if calving is within the next 30 days
        if (diffDays >= 0 && diffDays <= 30) {
          const cow = mockCows.find((c: any) => c.id === record.cow_id);
          if (cow) {
            calvingAlerts.push({ cow, date: record.calving_date });
          }
        }
      }
    });

    const followupAlerts: any[] = [];
    mockHealthRecords.forEach((record: any) => {
      if (record.next_followup) {
        const followupDate = new Date(record.next_followup);
        const diffTime = followupDate.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        // Alert if follow-up is within the next 7 days
        if (diffDays >= 0 && diffDays <= 7) {
          const cow = mockCows.find((c: any) => c.id === record.cow_id);
          if (cow) {
            followupAlerts.push({ cow, record, date: record.next_followup });
          }
        }
      }
    });

    return { calvingAlerts, followupAlerts };
  }
};

// --- Initial Mock Data (Run once to populate localStorage if empty) ---
function initializeMockData() {
    if (typeof window === 'undefined') return;

    if (!localStorage.getItem('milkRecords')) {
        const initialMilkRecords = [
            { id: uuidv4(), date: '2025-06-01', morning_milk: 10.5, evening_milk: 9.8, total_milk: 20.3, user_id: '1', created_at: new Date('2025-06-01').toISOString(), updated_at: new Date('2025-06-01').toISOString() },
            { id: uuidv4(), date: '2025-06-02', morning_milk: 11.0, evening_milk: 10.2, total_milk: 21.2, user_id: '1', created_at: new Date('2025-06-02').toISOString(), updated_at: new Date('2025-06-02').toISOString() },
            { id: uuidv4(), date: '2025-06-03', morning_milk: 9.5, evening_milk: 9.0, total_milk: 18.5, user_id: '1', created_at: new Date('2025-06-03').toISOString(), updated_at: new Date('2025-06-03').toISOString() },
            { id: uuidv4(), date: '2025-07-01', morning_milk: 12.0, evening_milk: 11.5, total_milk: 23.5, user_id: '1', created_at: new Date('2025-07-01').toISOString(), updated_at: new Date('2025-07-01').toISOString() },
            { id: uuidv4(), date: '2025-07-02', morning_milk: 12.5, evening_milk: 11.8, total_milk: 24.3, user_id: '1', created_at: new Date('2025-07-02').toISOString(), updated_at: new Date('2025-07-02').toISOString() },
            { id: uuidv4(), date: '2025-07-03', morning_milk: 11.8, evening_milk: 11.0, total_milk: 22.8, user_id: '1', created_at: new Date('2025-07-03').toISOString(), updated_at: new Date('2025-07-03').toISOString() },
            { id: uuidv4(), date: format(new Date(), 'yyyy-MM-dd'), morning_milk: 15.0, evening_milk: 14.5, total_milk: 29.5, user_id: '1', created_at: new Date().toISOString(), updated_at: new Date().toISOString() },
        ];
        localStorage.setItem('milkRecords', JSON.stringify(initialMilkRecords));
    }

    if (!localStorage.getItem('mockCows')) {
        const initialCows = [
            { id: uuidv4(), tag_number: 'C001', gender: 'Female', date_of_birth: '2022-03-15', color: 'Brown', markings: 'White star on forehead', age_category: 'Adult', status: 'Active', name: 'Daisy', created_at: new Date('2023-01-01').toISOString(), updated_at: new Date('2023-01-01').toISOString() },
            { id: uuidv4(), tag_number: 'C002', gender: 'Female', date_of_birth: '2023-01-20', color: 'Black and White', markings: 'Spotty', age_category: 'Calf', status: 'Active', name: 'Buttercup', created_at: new Date('2023-02-01').toISOString(), updated_at: new Date('2023-02-01').toISOString() },
            { id: uuidv4(), tag_number: 'C003', gender: 'Male', date_of_birth: '2024-05-10', color: 'White', markings: 'No markings', age_category: 'Calf', status: 'Active', name: 'Buster', created_at: new Date('2024-05-10').toISOString(), updated_at: new Date('2024-05-10').toISOString() },
            { id: uuidv4(), tag_number: 'C004', gender: 'Female', date_of_birth: '2021-08-01', color: 'Red', markings: 'Left ear tag missing', age_category: 'Adult', status: 'Sold', name: 'Rosie', created_at: new Date('2022-01-01').toISOString(), updated_at: new Date('2024-01-15').toISOString() },
            { id: uuidv4(), tag_number: 'C005', gender: 'Female', date_of_birth: '2020-02-28', color: 'Spotted', markings: 'Distinctive large spots', age_category: 'Adult', status: 'Deceased', name: 'Bella', created_at: new Date('2021-01-01').toISOString(), updated_at: new Date('2024-03-01').toISOString() },
        ];
        localStorage.setItem('mockCows', JSON.stringify(initialCows));
    }

    if (!localStorage.getItem('mockHealthRecords')) {
        const initialHealthRecords = [
            { id: uuidv4(), cow_id: 'C001', date: '2025-06-10', record_type: 'Vaccination', description: 'Annual FMD Vaccine', medicines: 'FMDVax', vet_name: 'Dr. Smith', next_followup: '', created_at: new Date('2025-06-10').toISOString(), updated_at: new Date('2025-06-10').toISOString() },
            { id: uuidv4(), cow_id: 'C001', date: '2025-07-05', record_type: 'Checkup', description: 'Routine checkup', medicines: '', vet_name: 'Dr. Smith', next_followup: '2025-08-05', created_at: new Date('2025-07-05').toISOString(), updated_at: new Date('2025-07-05').toISOString() },
            { id: uuidv4(), cow_id: 'C002', date: '2025-06-20', record_type: 'Treatment', description: 'Treated for mild fever', medicines: 'PainRelief', vet_name: 'Dr. Jones', next_followup: '', created_at: new Date('2025-06-20').toISOString(), updated_at: new Date('2025-06-20').toISOString() },
            { id: uuidv4(), cow_id: 'C004', date: '2025-01-10', record_type: 'Checkup', description: 'Pre-sale health check', medicines: '', vet_name: 'Dr. Smith', next_followup: '', created_at: new Date('2025-01-10').toISOString(), updated_at: new Date('2025-01-10').toISOString() },
        ];
        localStorage.setItem('mockHealthRecords', JSON.stringify(initialHealthRecords));
    }

    if (!localStorage.getItem('mockBreedingRecords')) {
        // Find C001 to ensure it exists for breeding records
        const c001 = JSON.parse(localStorage.getItem('mockCows') || '[]').find((c: any) => c.tag_number === 'C001');
        const c001Id = c001 ? c001.id : uuidv4(); // Fallback if C001 wasn't in mockCows

        const initialBreedingRecords = [
            { id: uuidv4(), cow_id: c001Id, date: '2025-03-01', record_type: 'AI', semen_source: 'Bull A', technician_name: 'Tech 1', pregnancy_status: 'Confirmed', pregnancy_check_date: '2025-04-01', calving_date: '2025-12-07', notes: 'Successful insemination', created_at: new Date('2025-03-01').toISOString(), updated_at: new Date('2025-03-01').toISOString() },
            { id: uuidv4(), cow_id: c001Id, date: '2024-06-15', record_type: 'Calving', semen_source: '', technician_name: '', pregnancy_status: 'Confirmed', pregnancy_check_date: '', calving_date: '2024-06-15', notes: 'Calved a healthy male calf', created_at: new Date('2024-06-15').toISOString(), updated_at: new Date('2024-06-15').toISOString() },
        ];
        localStorage.setItem('mockBreedingRecords', JSON.stringify(initialBreedingRecords));
    }
}

// Call initialization when the module is loaded (only on client-side)
if (typeof window !== 'undefined') {
  initializeMockData();
}