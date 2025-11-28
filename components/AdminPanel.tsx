import React, { useState } from 'react';
import { useHotel } from '../context/HotelContext';
import { RoomType, Room, BookingStatus } from '../types';
import { Plus, Trash2, Edit2, Lock, Unlock, CheckCircle, IndianRupee } from 'lucide-react';

const AdminPanel: React.FC = () => {
  const { rooms, updateRoom, toggleRoomStatus, bookings, deleteBooking } = useHotel();
  const [activeTab, setActiveTab] = useState<'ROOMS' | 'BLOCKS'>('ROOMS');

  // Blocks are just bookings with status BLOCKED
  const blocks = bookings.filter(b => b.status === BookingStatus.BLOCKED);

  const getRoomNumber = (id: string) => rooms.find(r => r.id === id)?.number || 'Unknown';

  return (
    <div className="p-6 h-full flex flex-col space-y-6 bg-slate-50/50">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-slate-800">Admin Control Panel</h1>
        <div className="flex bg-slate-200 p-1 rounded-lg">
           <button 
             onClick={() => setActiveTab('ROOMS')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'ROOMS' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Room Management
           </button>
           <button 
             onClick={() => setActiveTab('BLOCKS')}
             className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'BLOCKS' ? 'bg-white shadow text-slate-800' : 'text-slate-500 hover:text-slate-700'}`}
           >
             Active Blocks
           </button>
        </div>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
         {activeTab === 'ROOMS' && (
           <div className="flex-1 overflow-auto">
             <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                 <tr>
                   <th className="p-4 text-xs font-bold text-slate-500 uppercase">Room No</th>
                   <th className="p-4 text-xs font-bold text-slate-500 uppercase">Type</th>
                   <th className="p-4 text-xs font-bold text-slate-500 uppercase">Price</th>
                   <th className="p-4 text-xs font-bold text-slate-500 uppercase">Status</th>
                   <th className="p-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {rooms.map(room => (
                   <tr key={room.id} className="hover:bg-slate-50">
                     <td className="p-4 font-medium text-slate-800">{room.number}</td>
                     <td className="p-4 text-slate-600">
                        <span className="px-2 py-1 bg-slate-100 rounded text-xs">{room.type}</span>
                     </td>
                     <td className="p-4 text-slate-600 flex items-center"><IndianRupee size={14}/>{room.pricePerNight}</td>
                     <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-bold uppercase
                           ${room.status === 'CLEAN' ? 'bg-emerald-100 text-emerald-700' : 
                             room.status === 'DIRTY' ? 'bg-amber-100 text-amber-700' : 
                             'bg-rose-100 text-rose-700'}
                        `}>
                          {room.status}
                        </span>
                     </td>
                     <td className="p-4">
                        <button 
                          onClick={() => toggleRoomStatus(room.id)}
                          className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                        >
                           Toggle Status
                        </button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
         )}

         {activeTab === 'BLOCKS' && (
            <div className="flex-1 overflow-auto">
               {blocks.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                     <Lock size={48} className="mb-4 opacity-20"/>
                     <p>No active room blocks.</p>
                  </div>
               ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm">
                      <tr>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Room</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">From</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">To</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Reason</th>
                        <th className="p-4 text-xs font-bold text-slate-500 uppercase">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {blocks.map(block => (
                        <tr key={block.id} className="hover:bg-rose-50/30">
                          <td className="p-4 font-bold text-slate-800">{getRoomNumber(block.roomId)}</td>
                          <td className="p-4 text-slate-600">{block.checkInDate}</td>
                          <td className="p-4 text-slate-600">{block.checkOutDate}</td>
                          <td className="p-4 text-slate-500 text-sm italic">Maintenance / Block</td>
                          <td className="p-4">
                             <button 
                               onClick={() => deleteBooking(block.id)}
                               className="flex items-center gap-2 px-3 py-1 bg-white border border-rose-200 text-rose-600 rounded hover:bg-rose-50 transition-colors text-sm"
                             >
                                <Unlock size={14} /> Unblock
                             </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               )}
            </div>
         )}
      </div>
    </div>
  );
};

export default AdminPanel;