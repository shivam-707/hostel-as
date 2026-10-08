const API_BASE = '/api';

async function request(endpoint, options = {}) {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, options);
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const data = await res.json();
      return data;
    }
    // Non-JSON response (e.g. gateway error or HTML)
    const text = await res.text();
    console.warn(`[API] Non-JSON response from ${endpoint} (HTTP ${res.status}):`, text.slice(0, 100));
    return {
      success: false,
      error: `Server status ${res.status}: ${text.slice(0, 80) || 'Unexpected response'}`
    };
  } catch (err) {
    console.error(`[API] Request failed for ${endpoint}:`, err);
    return {
      success: false,
      error: err.message || 'Network request failed'
    };
  }
}

export async function fetchStats() {
  return request('/stats/dashboard');
}

export async function fetchCampusArchitecture() {
  return request('/stats/campus-architecture');
}

export async function fetchHostels() {
  return request('/hostels');
}

export async function fetchRooms(filters = {}) {
  const params = new URLSearchParams();
  if (filters.hostel_id) params.append('hostel_id', filters.hostel_id);
  if (filters.floor !== undefined && filters.floor !== '') params.append('floor', filters.floor);
  if (filters.room_type) params.append('room_type', filters.room_type);
  if (filters.climate_type) params.append('climate_type', filters.climate_type);
  if (filters.status) params.append('status', filters.status);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/rooms${query}`);
}

export async function fetchRoomDetails(id) {
  return request(`/rooms/${id}`);
}

export async function fetchStudents(filters = {}) {
  const params = new URLSearchParams();
  if (filters.hostel_id) params.append('hostel_id', filters.hostel_id);
  if (filters.search) params.append('search', filters.search);
  if (filters.department) params.append('department', filters.department);

  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/students${query}`);
}

export async function admitStudent(data) {
  return request('/students', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function assignBed(data) {
  return request('/allocations/assign', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function vacateBed(data) {
  return request('/allocations/vacate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function fetchFees(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/fees${query}`);
}

export async function payFee(data) {
  return request('/fees/pay', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function fetchComplaints(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  if (filters.priority) params.append('priority', filters.priority);
  if (filters.category) params.append('category', filters.category);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/complaints${query}`);
}

export async function createComplaint(data) {
  return request('/complaints', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function updateComplaint(id, data) {
  return request(`/complaints/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function fetchGatePasses(filters = {}) {
  const params = new URLSearchParams();
  if (filters.status) params.append('status', filters.status);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/gatepasses${query}`);
}

export async function requestGatePass(data) {
  return request('/gatepasses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function updateGatePassStatus(id, data) {
  return request(`/gatepasses/${id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
}

export async function fetchWardens() {
  return request('/wardens');
}

export async function fetchMessMenu(day) {
  const params = new URLSearchParams();
  if (day) params.append('day', day);
  const query = params.toString() ? `?${params.toString()}` : '';
  return request(`/mess/menu${query}`);
}

export async function getDbStatus() {
  return request('/db/status');
}

export async function testDbConnection(config) {
  return request('/db/test-connect', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config)
  });
}
