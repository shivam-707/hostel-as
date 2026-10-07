const API_BASE = '/api';

export async function fetchStats() {
  const res = await fetch(`${API_BASE}/stats/dashboard`);
  return res.json();
}

export async function fetchCampusArchitecture() {
  const res = await fetch(`${API_BASE}/stats/campus-architecture`);
  return res.json();
}

export async function fetchHostels() {
  const res = await fetch(`${API_BASE}/hostels`);
  return res.json();
}

export async function fetchRooms(filters = {}) {
  const params = new URLSearchParams();
  if (filters.hostel_id) params.append('hostel_id', filters.hostel_id);
  if (filters.floor !== undefined && filters.floor !== '') params.append('floor', filters.floor);
  if (filters.room_type) params.append('room_type', filters.room_type);
  if (filters.climate_type) params.append('climate_type', filters.climate_type);
  if (filters.status) params.append('status', filters.status);

  const res = await fetch(`${API_BASE}/rooms?${params.toString()}`);
  return res.json();
}

export async function fetchRoomDetails(id) {
  const res = await fetch(`${API_BASE}/rooms/${id}`);
  return res.json();
}

export async function fetchStudents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.hostel_id) params.append('hostel_id', filters.hostel_id);
  if (filters.search) params.append('search', filters.search);
  if (filters.department) params.append('department', filters.department);

  const res = await fetch(`${API_BASE}/students?${params.toString()}`);
  return res.json();
}

export async function admitStudent(data) {
  const res = await fetch(`${API_BASE}/students`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function assignBed(data) {
  const res = await fetch(`${API_BASE}/allocations/assign`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function vacateBed(data) {
  const res = await fetch(`${API_BASE}/allocations/vacate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchFees(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  const res = await fetch(`${API_BASE}/fees?${params.toString()}`);
  return res.json();
}

export async function payFee(data) {
  const res = await fetch(`${API_BASE}/fees/pay`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchComplaints(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.category) params.append('category', filters.category);
  const res = await fetch(`${API_BASE}/complaints?${params.toString()}`);
  return res.json();
}

export async function createComplaint(data) {
  const res = await fetch(`${API_BASE}/complaints`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateComplaint(id, data) {
  const res = await fetch(`${API_BASE}/complaints/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchGatePasses(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  const res = await fetch(`${API_BASE}/gatepasses?${params.toString()}`);
  return res.json();
}

export async function requestGatePass(data) {
  const res = await fetch(`${API_BASE}/gatepasses`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function updateGatePassStatus(id, data) {
  const res = await fetch(`${API_BASE}/gatepasses/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function fetchWardens() {
  const res = await fetch(`${API_BASE}/wardens`);
  return res.json();
}

export async function fetchMessMenu(day) {
  const params = new URLSearchParams();
  if (day) params.append('day', day);
  const res = await fetch(`${API_BASE}/mess/menu?${params.toString()}`);
  return res.json();
}

export async function getDbStatus() {
  const res = await fetch(`${API_BASE}/db/status`);
  return res.json();
}

export async function testDbConnection(config) {
  const res = await fetch(`${API_BASE}/db/test-connect`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
  return res.json();
}
