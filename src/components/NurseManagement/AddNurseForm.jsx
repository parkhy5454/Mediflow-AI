// src/components/NurseManagement/AddNurseForm.jsx
import React, { useState } from 'react';

const AddNurseForm = ({ onAddNurse, onCancel }) => {
  const [newNurse, setNewNurse] = useState({
    name: '',
    qualification: 'RN',
    experience: 'Junior',
    department: 'ICU'
  });

  const handleSubmit = () => {
    if (!newNurse.name.trim()) {
      alert('Please enter a nurse name');
      return;
    }
    
    const success = onAddNurse(newNurse);
    if (success) {
      setNewNurse({ 
        name: '', 
        qualification: 'RN', 
        experience: 'Junior', 
        department: 'ICU' 
      });
    }
  };

  return (
    <div style={{ 
      backgroundColor: 'white', 
      padding: '20px', 
      borderRadius: '8px', 
      border: '1px solid #e5e7eb',
      marginBottom: '20px'
    }}>
      <h3 style={{ marginBottom: '15px', color: '#1f2937' }}>Add New Nurse</h3>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '15px' 
      }}>
        <input
          type="text"
          placeholder="Nurse Name"
          value={newNurse.name}
          onChange={(e) => setNewNurse({ ...newNurse, name: e.target.value })}
          style={{
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        />
        <select
          value={newNurse.qualification}
          onChange={(e) => setNewNurse({ ...newNurse, qualification: e.target.value })}
          style={{
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="RN">RN (Registered Nurse)</option>
          <option value="MW">MW (Midwife)</option>
          <option value="RN-MW">RN-MW (Both)</option>
        </select>
        <select
          value={newNurse.experience}
          onChange={(e) => setNewNurse({ ...newNurse, experience: e.target.value })}
          style={{
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="Junior">Junior</option>
          <option value="Mid-level">Mid-level</option>
          <option value="Senior">Senior</option>
        </select>
        <select
          value={newNurse.department}
          onChange={(e) => setNewNurse({ ...newNurse, department: e.target.value })}
          style={{
            padding: '10px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            fontSize: '14px'
          }}
        >
          <option value="ICU">ICU</option>
          <option value="Emergency">Emergency</option>
          <option value="Surgery">Surgery</option>
          <option value="Maternity">Maternity</option>
        </select>
      </div>
      <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
        <button 
          onClick={handleSubmit}
          style={{
            backgroundColor: '#10b981',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Add Nurse
        </button>
        <button 
          onClick={onCancel}
          style={{
            backgroundColor: '#6b7280',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
};

export default AddNurseForm;