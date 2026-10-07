// Initial Campus Data & In-Memory Store
// 4 Boys Hostels + 1 Girls Hostel
// 80 rooms each (400 rooms total), 20x 2-seater AC, 20x 2-seater Non-AC, 20x 3-seater AC, 20x 3-seater Non-AC
// Total beds: 1,000 beds

const fs = require('fs');
const path = require('path');

const DATA_FILE = path.join(__dirname, '..', '..', 'data', 'hostel_storage.json');

const INITIAL_HOSTELS = [
  { id: 1, name: 'Sukhmani Boys Hostel', code: 'BH-1', type: 'boys', total_floors: 4, total_rooms: 80, total_capacity: 200, warden_id: 2, location_block: 'North Campus, Block A', contact_number: '+91 98765 43211' },
  { id: 2, name: 'Sukhsagar Boys Hostel', code: 'BH-2', type: 'boys', total_floors: 4, total_rooms: 80, total_capacity: 200, warden_id: 3, location_block: 'North Campus, Block B', contact_number: '+91 98765 43212' },
  { id: 3, name: 'Sadbhawna Boys Hostel', code: 'BH-3', type: 'boys', total_floors: 4, total_rooms: 80, total_capacity: 200, warden_id: 4, location_block: 'East Campus, Block C', contact_number: '+91 98765 43213' },
  { id: 4, name: 'Shantikunj Boys Hostel', code: 'BH-4', type: 'boys', total_floors: 4, total_rooms: 80, total_capacity: 200, warden_id: 5, location_block: 'East Campus, Block D', contact_number: '+91 98765 43214' },
  { id: 5, name: 'Kalpana Girls Hostel', code: 'GH-1', type: 'girls', total_floors: 4, total_rooms: 80, total_capacity: 200, warden_id: 6, location_block: 'South Campus, Block G', contact_number: '+91 98765 43215' }
];

const INITIAL_WARDENS = [
  { id: 1, name: 'Dr. Rajesh Sharma', email: 'chief.warden@campus.edu', phone: '+91 98765 43200', role: 'chief_warden', office_room: 'Admin Wing #101', qualification: 'Ph.D. in Mechanical Engg. (Dean Student Affairs)' },
  { id: 2, name: 'Prof. Vikram Malhotra', email: 'warden.sukhmani@campus.edu', phone: '+91 98765 43201', role: 'hostel_warden', office_room: 'Sukhmani Hall #G02', qualification: 'M.Tech, Associate Professor (CSE)' },
  { id: 3, name: 'Dr. Amit Verma', email: 'warden.sukhsagar@campus.edu', phone: '+91 98765 43202', role: 'hostel_warden', office_room: 'Sukhsagar Hall #G02', qualification: 'Ph.D., Associate Professor (ECE)' },
  { id: 4, name: 'Prof. Suresh Kulkarni', email: 'warden.sadbhawna@campus.edu', phone: '+91 98765 43203', role: 'hostel_warden', office_room: 'Sadbhawna Hall #G02', qualification: 'M.Tech, Asst. Professor (Civil)' },
  { id: 5, name: 'Dr. Manoj Nair', email: 'warden.shantikunj@campus.edu', phone: '+91 98765 43204', role: 'hostel_warden', office_room: 'Shantikunj Hall #G02', qualification: 'Ph.D., Associate Professor (Electrical)' },
  { id: 6, name: 'Dr. Sunita Deshmukh', email: 'warden.kalpana@campus.edu', phone: '+91 98765 43205', role: 'hostel_warden', office_room: 'Kalpana Hall #G01', qualification: 'Ph.D., Professor (Humanities)' }
];

function generateRoomsAndBeds() {
  const rooms = [];
  const beds = [];
  let roomId = 1;
  let bedId = 1;

  for (const hostel of INITIAL_HOSTELS) {
    // 4 floors: 0 (Ground), 1, 2, 3
    // 20 rooms per floor = 80 rooms total
    // Floor 0: 10x 2-seater AC (001-010), 10x 2-seater Non-AC (011-020)
    // Floor 1: 10x 2-seater AC (101-110), 10x 2-seater Non-AC (111-120)
    // Floor 2: 10x 3-seater AC (201-210), 10x 3-seater Non-AC (211-220)
    // Floor 3: 10x 3-seater AC (301-310), 10x 3-seater Non-AC (311-320)
    for (let floor = 0; floor < 4; floor++) {
      const isTwoSeater = floor < 2;
      const roomType = isTwoSeater ? '2_seater' : '3_seater';
      const cap = isTwoSeater ? 2 : 3;

      for (let r = 1; r <= 20; r++) {
        const isAC = r <= 10;
        const climateType = isAC ? 'ac' : 'non_ac';
        const numStr = r < 10 ? `0${r}` : `${r}`;
        const roomNumber = `${floor}${numStr}`;
        const fee = isAC ? (isTwoSeater ? 45000 : 40000) : (isTwoSeater ? 35000 : 30000);

        const currentRoomId = roomId++;
        rooms.push({
          id: currentRoomId,
          hostel_id: hostel.id,
          room_number: roomNumber,
          floor_number: floor,
          room_type: roomType,
          climate_type: climateType,
          capacity: cap,
          occupied_beds: 0,
          status: 'available',
          fee_per_semester: fee
        });

        // Bed assignments ('A', 'B', and optionally 'C')
        const letters = isTwoSeater ? ['A', 'B'] : ['A', 'B', 'C'];
        for (const letter of letters) {
          beds.push({
            id: bedId++,
            room_id: currentRoomId,
            hostel_id: hostel.id,
            bed_letter: letter,
            status: 'vacant',
            student_id: null
          });
        }
      }
    }
  }

  return { rooms, beds };
}

const INITIAL_STUDENTS = [
  { id: 1, roll_number: '2024CS101', name: 'Aarav Sharma', email: 'aarav.sharma@campus.edu', phone: '+91 98111 22331', gender: 'male', department: 'Computer Science', year_of_study: 2, guardian_name: 'Mahesh Sharma', guardian_phone: '+91 98111 22300', blood_group: 'B+', address: 'New Delhi, India', hostel_id: 1, room_id: 1, bed_id: 1, admission_date: '2024-08-01', status: 'active' },
  { id: 2, roll_number: '2024CS102', name: 'Rohan Gupta', email: 'rohan.gupta@campus.edu', phone: '+91 98111 22332', gender: 'male', department: 'Computer Science', year_of_study: 2, guardian_name: 'Dinesh Gupta', guardian_phone: '+91 98111 22301', blood_group: 'O+', address: 'Jaipur, Rajasthan', hostel_id: 1, room_id: 1, bed_id: 2, admission_date: '2024-08-01', status: 'active' },
  { id: 3, roll_number: '2023ME204', name: 'Kabir Patel', email: 'kabir.patel@campus.edu', phone: '+91 98222 33441', gender: 'male', department: 'Mechanical Engg.', year_of_study: 3, guardian_name: 'Sanjay Patel', guardian_phone: '+91 98222 33400', blood_group: 'A+', address: 'Ahmedabad, Gujarat', hostel_id: 2, room_id: 81, bed_id: 201, admission_date: '2023-08-05', status: 'active' },
  { id: 4, roll_number: '2024EE305', name: 'Aditya Verma', email: 'aditya.verma@campus.edu', phone: '+91 98333 44551', gender: 'male', department: 'Electrical Engg.', year_of_study: 2, guardian_name: 'Rajeev Verma', guardian_phone: '+91 98333 44500', blood_group: 'AB+', address: 'Lucknow, Uttar Pradesh', hostel_id: 3, room_id: 161, bed_id: 401, admission_date: '2024-08-01', status: 'active' },
  { id: 5, roll_number: '2025CE401', name: 'Devendra Singh', email: 'devendra.s@campus.edu', phone: '+91 98444 55661', gender: 'male', department: 'Civil Engg.', year_of_study: 1, guardian_name: 'Hardeep Singh', guardian_phone: '+91 98444 55600', blood_group: 'B+', address: 'Chandigarh, Punjab', hostel_id: 4, room_id: 241, bed_id: 601, admission_date: '2025-08-10', status: 'active' },
  { id: 6, roll_number: '2024CS201', name: 'Ananya Iyer', email: 'ananya.iyer@campus.edu', phone: '+91 98555 66771', gender: 'female', department: 'Computer Science', year_of_study: 2, guardian_name: 'R. Iyer', guardian_phone: '+91 98555 66700', blood_group: 'O+', address: 'Bengaluru, Karnataka', hostel_id: 5, room_id: 321, bed_id: 801, admission_date: '2024-08-01', status: 'active' },
  { id: 7, roll_number: '2024EC202', name: 'Pooja Reddy', email: 'pooja.reddy@campus.edu', phone: '+91 98555 66772', gender: 'female', department: 'Electronics & Comm.', year_of_study: 2, guardian_name: 'K. V. Reddy', guardian_phone: '+91 98555 66701', blood_group: 'A+', address: 'Hyderabad, Telangana', hostel_id: 5, room_id: 321, bed_id: 802, admission_date: '2024-08-01', status: 'active' },
  { id: 8, roll_number: '2025IT203', name: 'Sneha Roy', email: 'sneha.roy@campus.edu', phone: '+91 98555 66773', gender: 'female', department: 'Information Tech.', year_of_study: 1, guardian_name: 'Subhash Roy', guardian_phone: '+91 98555 66702', blood_group: 'B-', address: 'Kolkata, West Bengal', hostel_id: 5, room_id: 322, bed_id: 803, admission_date: '2025-08-10', status: 'active' }
];

const INITIAL_FEES = [
  { id: 1, student_id: 1, semester: 'Fall 2026', fee_type: 'Hostel & Mess Fee', total_amount: 45000, paid_amount: 45000, due_amount: 0, due_date: '2026-09-15', status: 'paid', payment_method: 'UPI / NetBanking', transaction_ref: 'TXN9928341' },
  { id: 2, student_id: 2, semester: 'Fall 2026', fee_type: 'Hostel & Mess Fee', total_amount: 45000, paid_amount: 30000, due_amount: 15000, due_date: '2026-10-15', status: 'partial', payment_method: 'Credit Card', transaction_ref: 'TXN8839201' },
  { id: 3, student_id: 3, semester: 'Fall 2026', fee_type: 'Hostel & Mess Fee', total_amount: 35000, paid_amount: 35000, due_amount: 0, due_date: '2026-09-15', status: 'paid', payment_method: 'Debit Card', transaction_ref: 'TXN7710293' },
  { id: 4, student_id: 4, semester: 'Fall 2026', fee_type: 'Hostel & Mess Fee', total_amount: 45000, paid_amount: 0, due_amount: 45000, due_date: '2026-10-20', status: 'pending', payment_method: null, transaction_ref: null },
  { id: 5, student_id: 5, semester: 'Fall 2026', fee_type: 'Hostel & Mess Fee', total_amount: 35000, paid_amount: 35000, due_amount: 0, due_date: '2026-09-15', status: 'paid', payment_method: 'UPI', transaction_ref: 'TXN6629182' },
  { id: 6, student_id: 6, semester: 'Fall 2026', fee_type: 'Hostel & Mess Fee', total_amount: 45000, paid_amount: 45000, due_amount: 0, due_date: '2026-09-15', status: 'paid', payment_method: 'NetBanking', transaction_ref: 'TXN5519283' },
  { id: 7, student_id: 7, semester: 'Fall 2026', fee_type: 'Hostel & Mess Fee', total_amount: 45000, paid_amount: 45000, due_amount: 0, due_date: '2026-09-15', status: 'paid', payment_method: 'UPI', transaction_ref: 'TXN4428172' },
  { id: 8, student_id: 8, semester: 'Fall 2026', fee_type: 'Hostel & Mess Fee', total_amount: 45000, paid_amount: 25000, due_amount: 20000, due_date: '2026-10-25', status: 'partial', payment_method: 'UPI', transaction_ref: 'TXN3318274' }
];

const INITIAL_COMPLAINTS = [
  { id: 1, student_id: 1, hostel_id: 1, room_id: 1, category: 'electrical', title: 'AC Cooling Fan Vibration Noise', description: 'The AC indoor unit makes a rattling noise on fan speed 2.', priority: 'medium', status: 'in_progress', assigned_to: 'Technician Ramesh (Aircon Team)', resolution_notes: 'Inspected on Oct 6. Part ordered.', created_at: '2026-10-05 10:30:00' },
  { id: 2, student_id: 3, hostel_id: 2, room_id: 81, category: 'plumbing', title: 'Bathroom Tap Leaking Water', description: 'The washbasin tap does not shut completely, constant dripping.', priority: 'high', status: 'open', assigned_to: 'Plumber Kailash', resolution_notes: null, created_at: '2026-10-06 14:15:00' },
  { id: 3, student_id: 6, hostel_id: 5, room_id: 321, category: 'wifi', title: 'Low Signal in Corner Desk', description: 'Wi-Fi access point #GH-3-2 loses connection intermittently.', priority: 'medium', status: 'resolved', assigned_to: 'IT Support (Mr. Anand)', resolution_notes: 'Rebooted AP router and adjusted power transmission. Verified 80Mbps.', created_at: '2026-10-04 09:00:00', resolved_at: '2026-10-05 16:00:00' },
  { id: 4, student_id: 5, hostel_id: 4, room_id: 241, category: 'carpentry', title: 'Wardrobe Latch Stuck', description: 'The wooden wardrobe lock does not engage properly.', priority: 'low', status: 'open', assigned_to: null, resolution_notes: null, created_at: '2026-10-07 11:20:00' }
];

const INITIAL_GATE_PASSES = [
  { id: 1, student_id: 2, hostel_id: 1, destination: 'Jaipur Home Visit', reason: 'Family function over the weekend', out_time: '2026-10-09 17:00:00', expected_in_time: '2026-10-12 08:00:00', actual_in_time: null, status: 'approved', approved_by_warden_id: 2, guard_notes: 'Parent confirmation verified' },
  { id: 2, student_id: 6, hostel_id: 5, destination: 'City Center Library', reason: 'Procuring reference books for project', out_time: '2026-10-07 15:00:00', expected_in_time: '2026-10-07 20:30:00', actual_in_time: '2026-10-07 20:15:00', status: 'returned', approved_by_warden_id: 6, guard_notes: 'Returned on time' },
  { id: 3, student_id: 4, hostel_id: 3, destination: 'Market Place', reason: 'Medical prescription purchase', out_time: '2026-10-08 16:30:00', expected_in_time: '2026-10-08 19:30:00', actual_in_time: null, status: 'pending', approved_by_warden_id: null, guard_notes: null }
];

const INITIAL_MESS_MENU = [
  { id: 1, day_of_week: 'monday', meal_type: 'breakfast', items: 'Idli, Sambar, Coconut Chutney, Boiled Eggs / Banana, Tea / Coffee', timing: '07:30 AM - 09:30 AM' },
  { id: 2, day_of_week: 'monday', meal_type: 'lunch', items: 'Jeera Rice, Dal Tadka, Paneer Butter Masala / Chicken Curry, Phulka, Salad, Curd', timing: '12:30 PM - 02:30 PM' },
  { id: 3, day_of_week: 'monday', meal_type: 'snacks', items: 'Veg Cutlet, Green Chutney, Tea / Coffee', timing: '05:00 PM - 06:15 PM' },
  { id: 4, day_of_week: 'monday', meal_type: 'dinner', items: 'Roti, Mixed Veg Sabzi, Dal Makhani, Steamed Rice, Gulab Jamun', timing: '07:45 PM - 09:45 PM' },
  { id: 5, day_of_week: 'tuesday', meal_type: 'breakfast', items: 'Aloo Paratha, Curd, Pickle, Sprout Salad, Tea / Coffee', timing: '07:30 AM - 09:30 AM' },
  { id: 6, day_of_week: 'tuesday', meal_type: 'lunch', items: 'Steamed Rice, Rajma Masala, Aloo Gobi, Roti, Boondi Raita, Salad', timing: '12:30 PM - 02:30 PM' },
  { id: 7, day_of_week: 'tuesday', meal_type: 'snacks', items: 'Samosa, Mint Chutney, Masala Tea', timing: '05:00 PM - 06:15 PM' },
  { id: 8, day_of_week: 'tuesday', meal_type: 'dinner', items: 'Veg Pulao, Kadhi Pakora, Chapati, Bhindi Fry, Kheer', timing: '07:45 PM - 09:45 PM' }
];

class MemoryDataStore {
  constructor() {
    this.hostels = [...INITIAL_HOSTELS];
    this.wardens = [...INITIAL_WARDENS];
    const generated = generateRoomsAndBeds();
    this.rooms = generated.rooms;
    this.beds = generated.beds;
    this.students = [...INITIAL_STUDENTS];
    this.fees = [...INITIAL_FEES];
    this.complaints = [...INITIAL_COMPLAINTS];
    this.gatePasses = [...INITIAL_GATE_PASSES];
    this.messMenu = [...INITIAL_MESS_MENU];

    // Mark beds occupied for initial students
    for (const student of this.students) {
      if (student.bed_id) {
        const bed = this.beds.find(b => b.id === student.bed_id);
        if (bed) {
          bed.status = 'occupied';
          bed.student_id = student.id;
        }
        const room = this.rooms.find(r => r.id === student.room_id);
        if (room) {
          room.occupied_beds = (room.occupied_beds || 0) + 1;
          if (room.occupied_beds >= room.capacity) {
            room.status = 'full';
          }
        }
      }
    }

    this.ensureDataDir();
    this.loadFromDisk();
  }

  ensureDataDir() {
    const dir = path.dirname(DATA_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  }

  saveToDisk() {
    try {
      this.ensureDataDir();
      const state = {
        hostels: this.hostels,
        wardens: this.wardens,
        rooms: this.rooms,
        beds: this.beds,
        students: this.students,
        fees: this.fees,
        complaints: this.complaints,
        gatePasses: this.gatePasses,
        messMenu: this.messMenu
      };
      fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2));
    } catch (err) {
      console.error('Failed to persist to disk:', err.message);
    }
  }

  loadFromDisk() {
    try {
      if (fs.existsSync(DATA_FILE)) {
        const raw = fs.readFileSync(DATA_FILE, 'utf-8');
        const state = JSON.parse(raw);
        if (state.hostels && state.rooms && state.beds) {
          this.hostels = state.hostels;
          this.wardens = state.wardens;
          this.rooms = state.rooms;
          this.beds = state.beds;
          this.students = state.students;
          this.fees = state.fees;
          this.complaints = state.complaints;
          this.gatePasses = state.gatePasses;
          this.messMenu = state.messMenu;
        }
      }
    } catch (err) {
      console.error('Error reading saved state:', err.message);
    }
  }

  getStats() {
    const totalHostels = this.hostels.length;
    const totalRooms = this.rooms.length;
    const totalBeds = this.beds.length;
    const occupiedBeds = this.beds.filter(b => b.status === 'occupied').length;
    const availableBeds = totalBeds - occupiedBeds;
    const totalStudents = this.students.filter(s => s.status === 'active').length;
    const totalWardens = this.wardens.length;
    const pendingComplaints = this.complaints.filter(c => c.status === 'open' || c.status === 'in_progress').length;
    const activeGatePasses = this.gatePasses.filter(g => g.status === 'approved' || g.status === 'checked_out').length;
    
    const totalFeeDue = this.fees.reduce((acc, f) => acc + Number(f.due_amount || 0), 0);
    const totalFeeCollected = this.fees.reduce((acc, f) => acc + Number(f.paid_amount || 0), 0);

    return {
      totalHostels,
      totalRooms,
      totalBeds,
      occupiedBeds,
      availableBeds,
      occupancyRate: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
      totalStudents,
      totalWardens,
      pendingComplaints,
      activeGatePasses,
      totalFeeDue,
      totalFeeCollected
    };
  }
}

const memoryStore = new MemoryDataStore();

module.exports = {
  memoryStore,
  INITIAL_HOSTELS,
  INITIAL_WARDENS,
  generateRoomsAndBeds,
  INITIAL_STUDENTS,
  INITIAL_FEES,
  INITIAL_COMPLAINTS,
  INITIAL_GATE_PASSES,
  INITIAL_MESS_MENU
};
