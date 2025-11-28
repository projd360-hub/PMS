import React, { useState, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { Booking, BookingStatus } from '../types';
import { Calendar, ArrowDownCircle, ArrowUpCircle, Filter, Search, User, BedDouble, CheckCircle, Clock, FileText, IndianRupee } from 'lucide-react';
import BookingSummary from './BookingSummary';
import BookingForm from './BookingForm';

type FilterType = 'ALL' | 'CHECK_IN' | 'CHECK_OUT' | 'IN_HOUSE' | 'CANCELLED';

const BookingList: React.FC = () => {
  const { bookings, rooms, addBooking, updateBooking, cancelBooking } = useHotel();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [filterType, setFilterType] = useState<FilterType>('CHECK_IN');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>(undefined);
  const [isFormOpen, setIsFormOpen] = useState(false);

  // --- Derived Data ---

  // 1. Filter by Date & Type
  const filteredBookings = useMemo(() => {
    return bookings.filter(b => {
      const matchesSearch = b.guest?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            b.guest?.phone.includes(searchTerm) ||
                            b.id.includes(searchTerm);
      
      if (!matchesSearch) return false;

      // Date Logic
      const isCheckIn = b.checkInDate === selectedDate;
      const isCheckOut = b.checkOutDate === selectedDate;
      // In house: starts before or on today, ends after today
      const start = new Date(b.checkInDate);
      const end = new Date(b.checkOutDate);
      const current = new Date(selectedDate);
      const isInHouse = start <= current && end > current && b.status !== BookingStatus.CANCELLED && b.status !== BookingStatus.CHECKED_OUT;

      switch (filterType) {
        case 'CHECK_IN': return isCheckIn && b.status !== BookingStatus.CANCELLED;
        case 'CHECK_OUT': return isCheckOut && b.status !== BookingStatus.CANCELLED;
        case 'IN_HOUSE': return isInHouse;
        case 'CANCELLED': return b.status === BookingStatus.CANCELLED;
        case 'ALL': return true;
        default: return true;
      }
    });
  }, [bookings, selectedDate, filterType, searchTerm]);

  // 2. Financial Stats for the FILTERED list (Daily View)
  const dailyStats = useMemo(() => {
    return filteredBookings.reduce((acc, curr) => ({
      totalSell: acc.totalSell + curr.totalAmount,
      advance: acc.advance + curr.paidAmount,
      due: acc.due + (curr.totalAmount - curr.paidAmount)
    }), { totalSell: 0, advance: 0, due: 0 });
  }, [filteredBookings]);

  // 3. Monthly Total Sell (Global Context)
  const monthlyStats = useMemo(() => {
    const year = new Date(selectedDate).getFullYear();
    const month = new Date(selectedDate).getMonth();
    
    const monthlyBookings = bookings.filter(b => {
      const d = new Date(b.checkInDate);
      return d.getFullYear() === year && d.getMonth() === month && b.status !== BookingStatus.CANCELLED;
    });

    return monthlyBookings.reduce((acc, curr) => acc + curr.totalAmount, 0);
  }, [bookings, selectedDate]);

  const getRoomNumber = (id: string) => rooms.find(r => r.id === id)?.number || '??';

  return (
    <div className="flex flex-col h-full bg-slate-50/50 p-6 space-y-6 overflow-hidden">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
         <div>
            <h1 className="text-2xl font-bold text-slate-800">Daily Operations</h1>
            <p className="text-sm text-slate-500">Manage daily arrivals, departures, and financials.</p>
         </div>
         
         <div className="flex items-center gap-3 bg-white p-2 rounded-lg border shadow-sm">
            <Calendar size={18} className="text-slate-400 ml-2" />
            <input 
              type="date" 
              className="outline-none text-slate-700 font-medium bg-transparent"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            />
         </div>
      </div>

      {/* Financial Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         {/* Daily Stats based on Filter */}
         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
               {filterType === 'ALL' ? 'Total Value' : filterType === 'CHECK_IN' ? 'Arrivals Value' : filterType === 'CHECK_OUT' ? 'Departures Value' : 'In-House Value'}
               <FileText size={14}/>
            </span>
            <div className="text-2xl font-bold text-slate-800 mt-2 flex items-center"><IndianRupee size={20}/>{dailyStats.totalSell.toLocaleString()}</div>
         </div>

         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
               Collected / Advance
               <CheckCircle size={14} className="text-emerald-500"/>
            </span>
            <div className="text-2xl font-bold text-emerald-600 mt-2 flex items-center"><IndianRupee size={20}/>{dailyStats.advance.toLocaleString()}</div>
         </div>

         <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase flex items-center gap-2">
               Pending Due
               <Clock size={14} className="text-amber-500"/>
            </span>
            <div className="text-2xl font-bold text-amber-600 mt-2 flex items-center"><IndianRupee size={20}/>{dailyStats.due.toLocaleString()}</div>
         </div>

         {/* Monthly Context */}
         <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between text-white">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-2">
               Total Sell ({new Date(selectedDate).toLocaleString('default', { month: 'long' })})
               <IndianRupee size={14}/>
            </span>
            <div className="text-2xl font-bold text-white mt-2 flex items-center"><IndianRupee size={20}/>{monthlyStats.toLocaleString()}</div>
         </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col overflow-hidden">
         
         {/* Tabs & Search */}
         <div className="p-4 border-b flex flex-col sm:flex-row justify-between gap-4 items-center bg-slate-50">
            <div className="flex bg-slate-200 p-1 rounded-lg">
               {[
                 { id: 'CHECK_IN', label: 'Arrivals', icon: ArrowDownCircle },
                 { id: 'CHECK_OUT', label: 'Departures', icon: ArrowUpCircle },
                 { id: 'IN_HOUSE', label: 'In House', icon: BedDouble },
                 { id: 'ALL', label: 'All', icon: Filter },
               ].map(tab => (
                 <button
                    key={tab.id}
                    onClick={() => setFilterType(tab.id as FilterType)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-all
                      ${filterType === tab.id ? 'bg-white text-brand-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}
                    `}
                 >
                    <tab.icon size={16}/>
                    <span className="hidden sm:inline">{tab.label}</span>
                 </button>
               ))}
            </div>

            <div className="relative w-full sm:w-64">
               <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/>
               <input 
                 type="text" 
                 placeholder="Search guest, room..." 
                 className="w-full pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                 value={searchTerm}
                 onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
         </div>

         {/* Table List */}
         <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
               <thead className="bg-slate-50 sticky top-0 z-10 shadow-sm text-xs font-bold text-slate-500 uppercase">
                  <tr>
                     <th className="p-4">Guest Name</th>
                     <th className="p-4">Room</th>
                     <th className="p-4">Status</th>
                     <th className="p-4">Check In</th>
                     <th className="p-4">Check Out</th>
                     <th className="p-4 text-right">Total</th>
                     <th className="p-4 text-right">Paid</th>
                     <th className="p-4 text-right">Due</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredBookings.length === 0 ? (
                     <tr>
                        <td colSpan={8} className="p-8 text-center text-slate-400 italic">
                           No bookings found for this filter.
                        </td>
                     </tr>
                  ) : (
                     filteredBookings.map(booking => (
                        <tr 
                           key={booking.id} 
                           className="hover:bg-blue-50 cursor-pointer transition-colors"
                           onClick={() => setSelectedBooking(booking)}
                        >
                           <td className="p-4">
                              <div className="font-bold text-slate-800">{booking.guest?.fullName}</div>
                              <div className="text-xs text-slate-500 flex items-center gap-1"><User size={10}/> {booking.guest?.phone}</div>
                           </td>
                           <td className="p-4 font-medium text-slate-700">
                              {getRoomNumber(booking.roomId)}
                           </td>
                           <td className="p-4">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase border
                                 ${booking.status === BookingStatus.CONFIRMED ? 'bg-emerald-50 text-emerald-600 border-emerald-200' :
                                   booking.status === BookingStatus.CHECKED_IN ? 'bg-blue-50 text-blue-600 border-blue-200' :
                                   booking.status === BookingStatus.CHECKED_OUT ? 'bg-slate-100 text-slate-500 border-slate-200' :
                                   booking.status === BookingStatus.HOLD ? 'bg-amber-50 text-amber-600 border-amber-200' :
                                   'bg-rose-50 text-rose-600 border-rose-200'}
                              `}>
                                 {booking.status}
                              </span>
                           </td>
                           <td className="p-4 text-slate-600">{booking.checkInDate}</td>
                           <td className="p-4 text-slate-600">{booking.checkOutDate}</td>
                           <td className="p-4 text-right font-medium text-slate-900">₹{booking.totalAmount.toLocaleString()}</td>
                           <td className="p-4 text-right text-emerald-600">₹{booking.paidAmount.toLocaleString()}</td>
                           <td className={`p-4 text-right font-bold ${(booking.totalAmount - booking.paidAmount) > 0 ? 'text-rose-500' : 'text-slate-400'}`}>
                              ₹{(booking.totalAmount - booking.paidAmount).toLocaleString()}
                           </td>
                        </tr>
                     ))
                  )}
               </tbody>
            </table>
         </div>
      </div>

      {/* Modals */}
      {selectedBooking && (
        <BookingSummary 
           booking={selectedBooking}
           room={rooms.find(r => r.id === selectedBooking.roomId)}
           onClose={() => setSelectedBooking(null)}
           onEdit={() => {
              setEditingBooking(selectedBooking);
              setIsFormOpen(true);
              setSelectedBooking(null);
           }}
           onCancel={() => {
              cancelBooking(selectedBooking.id);
              setSelectedBooking(null);
           }}
        />
      )}

      {isFormOpen && (
         <BookingForm 
            bookingToEdit={editingBooking}
            onClose={() => {
               setIsFormOpen(false);
               setEditingBooking(undefined);
            }}
            onSave={(b) => {
               if (editingBooking) updateBooking(b.id, b);
               else addBooking(b);
               setIsFormOpen(false);
               setEditingBooking(undefined);
            }}
         />
      )}
    </div>
  );
};

export default BookingList;