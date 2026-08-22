import { useState } from 'react';
import { staffData as initialStaff, type Staff } from '@/mocks/staff';
import StaffCard from './components/StaffCard';
import StaffDetailsDrawer from './components/StaffDetailsDrawer';
import AddStaffModal from './components/AddStaffModal';

export default function StaffPage() {
  const [staffList, setStaffList] = useState<Staff[]>(initialStaff);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedStaff, setSelectedStaff] = useState<Staff | null>(null);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const handleAddStaff = (data: any) => {
    const newStaff: Staff = {
      id: `S${Date.now()}`,
      firstName: data.firstName,
      lastName: data.lastName,
      name: `${data.firstName} ${data.lastName}`,
      initials: `${data.firstName.charAt(0)}${data.lastName.charAt(0)}`.toUpperCase(),
      role: data.role,
      status: 'Active',
      email: data.email,
      phone: '', // Can add to modal if needed, or remove
      lastActive: new Date().toISOString(),
      activity: []
    };
    setStaffList([newStaff, ...staffList]);
    setIsAddModalOpen(false);
    showToast(`${newStaff.name} has been invited successfully.`);
  };

  return (
    <div className="p-4 sm:p-6 space-y-5">
      {toast && <div className="fixed top-4 right-4 z-50 px-4 py-2.5 rounded-lg text-[13px] font-body text-white bg-success shadow-lg">{toast}</div>}

      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="font-heading font-700 text-[22px]" style={{ color: 'var(--text-primary)' }}>Internal Staff</h1>
          <p className="text-[13px] mt-0.5 font-body" style={{ color: 'var(--text-secondary)' }}>Manage platform access and administrators.</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="h-9 px-4 rounded-lg bg-primary text-white text-[13px] font-body font-medium transition-colors hover:brightness-110 cursor-pointer flex items-center gap-1.5"
        >
          <i className="ri-user-add-line"></i> Invite Staff
        </button>
      </div>

      {/* Grid of Staff Members */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {staffList.map(staff => (
          <StaffCard 
            key={staff.id} 
            staff={staff} 
            onViewActivity={() => setSelectedStaff(staff)} 
          />
        ))}
      </div>

      {/* Modals & Drawers */}
      <AddStaffModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onSubmit={handleAddStaff} 
      />
      
      {selectedStaff && (
        <StaffDetailsDrawer 
          staff={selectedStaff} 
          onClose={() => setSelectedStaff(null)} 
        />
      )}
    </div>
  );
}
