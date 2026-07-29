// src/components/NurseManagement/NurseTable.jsx
import React from 'react';
import { Eye, EyeOff, Archive, Trash2 } from 'lucide-react';
import StatusBadge from '../Common/StatusBadge';

const NurseTable = ({ nurses, updateNurseStatus, deleteNurse }) => {
  return (
    <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div className="scroll-container">
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '800px' }}>
          <thead style={{ backgroundColor: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Name</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Qualification</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Experience</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Department</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Status</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Last Shift</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {nurses.map(nurse => (
              <tr key={nurse.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                <td style={{ padding: '12px', fontWeight: '500' }}>{nurse.name}</td>
                <td style={{ padding: '12px' }}>
                  <StatusBadge 
                    text={nurse.qualification}
                    type="qualification"
                    qualification={nurse.qualification}
                  />
                </td>
                <td style={{ padding: '12px' }}>{nurse.experience}</td>
                <td style={{ padding: '12px' }}>{nurse.department}</td>
                <td style={{ padding: '12px' }}>
                  <StatusBadge 
                    text={nurse.status}
                    type="status"
                    status={nurse.status}
                  />
                </td>
                <td style={{ padding: '12px' }}>
                  {nurse.lastShiftType || 'None'}
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'center' }}>
                    {nurse.status === 'active' && (
                      <button
                        onClick={() => updateNurseStatus(nurse.id, 'disabled')}
                        style={{
                          backgroundColor: '#f59e0b',
                          color: 'white',
                          padding: '6px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Disable"
                      >
                        <EyeOff size={14} />
                      </button>
                    )}
                    {nurse.status === 'disabled' && (
                      <button
                        onClick={() => updateNurseStatus(nurse.id, 'active')}
                        style={{
                          backgroundColor: '#10b981',
                          color: 'white',
                          padding: '6px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center'
                        }}
                        title="Enable"
                      >
                        <Eye size={14} />
                      </button>
                    )}
                    <button
                      onClick={() => updateNurseStatus(nurse.id, 'archived')}
                      style={{
                        backgroundColor: '#6b7280',
                        color: 'white',
                        padding: '6px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Archive"
                    >
                      <Archive size={14} />
                    </button>
                    <button
                      onClick={() => deleteNurse(nurse.id)}
                      style={{
                        backgroundColor: '#ef4444',
                        color: 'white',
                        padding: '6px',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center'
                      }}
                      title="Delete"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default NurseTable;

