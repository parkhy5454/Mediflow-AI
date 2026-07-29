// src/components/NurseManagement/NurseManagement.jsx
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import AddNurseForm from './AddNurseForm';
import NurseFilters from './NurseFilters';
import NurseTable from './NurseTable';

const NurseManagement = ({ 
  nurses, 
  addNurse, 
  updateNurseStatus, 
  deleteNurse, 
  getFilteredNurses 
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const handleAddNurse = (nurseData) => {
    const success = addNurse(nurseData);
    if (success) {
      setShowAddForm(false);
    }
    return success;
  };

  const filteredNurses = nurses.filter(nurse => {
    const matchesSearch = nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nurse.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nurse.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || nurse.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  return (
    
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ color: '#1f2937' }}>Nurse Management</h2>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          style={{
            backgroundColor: '#3b82f6',
            color: 'white',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <UserPlus size={18} />
          Add Nurse
        </button>
      </div>

      {showAddForm && (
        <AddNurseForm 
          onAddNurse={handleAddNurse}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      <NurseFilters 
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        filterStatus={filterStatus}
        setFilterStatus={setFilterStatus}
      />

      <NurseTable 
        nurses={filteredNurses}
        updateNurseStatus={updateNurseStatus}
        deleteNurse={deleteNurse}
      />
    </div>
  );
};

export default NurseManagement;