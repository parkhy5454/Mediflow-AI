// src/components/NurseManagement/NurseManagement.jsx
import React, { useState } from 'react';
import { UserPlus } from 'lucide-react';
import AddNurseForm from './AddNurseForm';
import NurseFilters from './NurseFilters';
import NurseTable from './NurseTable';
import { DEPARTMENT_LIST } from '../../constants/nurseOptions';

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
  const [filterDepartment, setFilterDepartment] = useState('all');

  const handleAddNurse = (nurseData) => {
    const success = addNurse(nurseData);
    if (success) {
      setShowAddForm(false);
    }
    return success;
  };

  // [수정] "간호사 추가" 폼과 동일한 공용 부서 목록을 기본으로 쓰고,
  // 직접 입력으로 추가된(목록에 없는) 부서가 실제로 있으면 그것도 필터에 포함시킨다.
  const customDepartmentsInUse = Array.from(
    new Set(nurses.map(n => (n.department || '').trim()).filter(Boolean))
  ).filter(dept => !DEPARTMENT_LIST.includes(dept));

  const departments = [...DEPARTMENT_LIST, ...customDepartmentsInUse].sort((a, b) => a.localeCompare(b, 'ko'));

  const filteredNurses = nurses.filter(nurse => {
    const matchesSearch = nurse.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nurse.qualification.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nurse.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || nurse.status === filterStatus;
    const matchesDepartment = filterDepartment === 'all' || nurse.department === filterDepartment;
    return matchesSearch && matchesStatus && matchesDepartment;
  });

  return (
    
    <div style={{ padding: '20px' }}>
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '20px' 
      }}>
        <h2 style={{ color: '#1f2937' }}>간호사 관리</h2>
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
          간호사 추가
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
        filterDepartment={filterDepartment}
        setFilterDepartment={setFilterDepartment}
        departments={departments}
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