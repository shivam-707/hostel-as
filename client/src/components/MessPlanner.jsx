import React, { useState, useEffect } from 'react';
import { UtensilsCrossed, Clock, Sun, Coffee, Moon, Sparkles } from 'lucide-react';
import { fetchMessMenu } from '../services/api';

export default function MessPlanner() {
  const [menuItems, setMenuItems] = useState([]);
  const [selectedDay, setSelectedDay] = useState('monday');
  const [loading, setLoading] = useState(false);

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

  useEffect(() => {
    loadMenu();
  }, [selectedDay]);

  const loadMenu = async () => {
    setLoading(true);
    try {
      const res = await fetchMessMenu(selectedDay);
      if (res.success) {
        setMenuItems(res.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getMealIcon = (meal) => {
    switch (meal) {
      case 'breakfast': return <Coffee size={18} color="#f59e0b" />;
      case 'lunch': return <Sun size={18} color="#38bdf8" />;
      case 'snacks': return <Sparkles size={18} color="#a855f7" />;
      case 'dinner': return <Moon size={18} color="#6366f1" />;
      default: return <UtensilsCrossed size={18} />;
    }
  };

  return (
    <div>
      {/* Day Selector Tabs */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '12px',
        marginBottom: '20px'
      }}>
        {days.map(d => (
          <button
            key={d}
            className={`btn-sm ${selectedDay === d ? 'btn-primary' : 'btn-secondary'}`}
            onClick={() => setSelectedDay(d)}
            style={{ textTransform: 'capitalize', padding: '8px 18px', fontWeight: '700' }}
          >
            {d}
          </button>
        ))}
      </div>

      {/* Meals Grid for Selected Day */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>Loading dining menu...</div>
      ) : menuItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>No menu records listed for {selectedDay}.</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '20px' }}>
          {menuItems.map(item => (
            <div
              key={item.id}
              style={{
                background: 'var(--bg-card)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-lg)',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                boxShadow: 'var(--shadow-sm)'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {getMealIcon(item.meal_type)}
                  <h4 style={{ fontSize: '1.15rem', fontWeight: '800', textTransform: 'capitalize' }}>
                    {item.meal_type}
                  </h4>
                </div>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  background: 'var(--bg-surface)',
                  padding: '3px 8px',
                  borderRadius: 'var(--radius-sm)'
                }}>
                  <Clock size={12} /> {item.timing}
                </div>
              </div>

              <div style={{
                background: 'var(--bg-surface)',
                borderRadius: 'var(--radius-md)',
                padding: '16px',
                flex: 1,
                fontSize: '0.9rem',
                lineHeight: '1.6',
                color: 'var(--text-primary)'
              }}>
                {item.items}
              </div>

              <div style={{ marginTop: '14px', fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
                <span>Hostel Dining Halls 1 - 5</span>
                <span style={{ color: 'var(--accent-emerald)', fontWeight: '700' }}>Nutritious & Hygienic</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
