import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useHotel } from '../context/HotelContext';
import { Booking, BookingStatus, Room } from '../types';
import { ChevronLeft, ChevronRight, User, Lock, PauseCircle, CheckCircle, XCircle, AlertTriangle, Edit } from 'lucide-react';
import BookingForm from './BookingForm';
import BookingSummary from './BookingSummary';

const CELL_WIDTH = 60;
const HEADER_HEIGHT = 50;
const ROW_HEIGHT = 60;
const SIDEBAR_WIDTH = 180;

const TapeChart: React.FC = () => {
  const { rooms, bookings, toggleRoomStatus, addBooking, updateBooking, deleteBooking, cancelBooking } = useHotel();
  const [startDate, setStartDate] = useState(new Date());
  const [daysToShow] = useState(14);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // State for Context Menu
  const [contextMenu, setContextMenu] = useState<{ x: number, y: number, roomId: string, date: string, type: 'CELL' | 'ROOM' } | null>(null);
  
  // State for Form/Modal
  const [editingBooking, setEditingBooking] = useState<Booking | undefined>(undefined);
  const [showBookingForm, setShowBookingForm] = useState<{ isOpen: boolean, roomId?: string, date?: string, status?: BookingStatus }>({ isOpen: false });
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);

  // Generate date headers
  const dates = useMemo(() => {
    const arr = [];
    for (let i = 0; i < daysToShow; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      arr.push(d);
    }
    return arr;
  }, [startDate, daysToShow]);

  const handlePrev = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() - 7);
    setStartDate(d);
  };

  const handleNext = () => {
    const d = new Date(startDate);
    d.setDate(d.getDate() + 7);
    setStartDate(d);
  };

  const handleCellClick = (roomId: string, date: Date, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      roomId,
      date: date.toISOString().split('T')[0],
      type: 'CELL'
    });
  };

  const handleRoomClick = (roomId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({
        x: e.clientX,
        y: e.clientY,
        roomId,
        date: startDate.toISOString().split('T')[0],
        type: 'ROOM'
    });
  }

  const handleBookingClick = (booking: Booking, e: React.MouseEvent) => {
      e.stopPropagation();
      setSelectedBooking(booking);
      setContextMenu(null);
  }

  // Close context menu on global click
  useEffect(() => {
    const closeMenu = () => setContextMenu(null);
    window.addEventListener('click', closeMenu);
    return () => window.removeEventListener('click', closeMenu);
  }, []);

  const handleMenuAction = (action: string) => {
    if (!contextMenu) return;

    if (contextMenu.type === 'CELL') {
        // Grid Cell Actions
        const status = action === 'BLOCK' ? BookingStatus.BLOCKED : 
                       action === 'HOLD' ? BookingStatus.HOLD : BookingStatus.CONFIRMED;
        
        setShowBookingForm({
          isOpen: true,
          roomId: contextMenu.roomId,
          date: contextMenu.date,
          status
        });
    } else {
        // Room Sidebar Actions
        if (action === 'TOGGLE_STATUS') {
            toggleRoomStatus(contextMenu.roomId);
        } else if (action === 'BLOCK_ROOM') {
            setShowBookingForm({
                isOpen: true,
                roomId: contextMenu.roomId,
                date: new Date().toISOString().split('T')[0],
                status: BookingStatus.BLOCKED
            });
        }
    }
    setContextMenu(null);
  };

  const getBookingStyles = (booking: Booking) => {
    const start = new Date(booking.checkInDate);
    const end = new Date(booking.checkOutDate);
    const viewStart = dates[0];
    const viewEnd = new Date(dates[dates.length - 1].getTime() + 86400000);

    if (end <= viewStart || start >= viewEnd) return null;

    const diffDaysStart = Math.ceil((start.getTime() - viewStart.getTime()) / (1000 * 60 * 60 * 24));
    const offset = Math.max(0, diffDaysStart) * CELL_WIDTH;
    
    let duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDaysStart < 0) duration += diffDaysStart; 
    
    const daysVisible = Math.min(duration, daysToShow - (diffDaysStart < 0 ? 0 : diffDaysStart));
    const width = daysVisible * CELL_WIDTH;

    return { left: offset, width };
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden relative">
      {/* Toolbar */}
      <div className="p-4 border-b flex justify-between items-center bg-slate-50">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-bold text-slate-800">Tape Chart</h2>
          <div className="flex items-center bg-white border rounded-lg shadow-sm">
            <button onClick={handlePrev} className="p-1.5 hover:bg-slate-100 text-slate-600"><ChevronLeft size={20}/></button>
            <span className="px-4 py-1 font-medium text-sm border-x text-slate-700">{startDate.toLocaleDateString()}</span>
            <button onClick={handleNext} className="p-1.5 hover:bg-slate-100 text-slate-600"><ChevronRight size={20}/></button>
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs font-medium text-slate-600">
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-emerald-500 rounded-sm"></div>Confirmed</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-amber-500 rounded-sm"></div>Hold</div>
          <div className="flex items-center gap-1.5"><div className="w-3 h-3 bg-rose-500 rounded-sm"></div>Blocked</div>
        </div>
      </div>

      {/* Grid Container */}
      <div className="flex-1 overflow-auto relative flex" ref={containerRef}>
        
        {/* Sidebar (Room List) */}
        <div className="sticky left-0 z-20 bg-white border-r shadow-lg" style={{ width: SIDEBAR_WIDTH, minWidth: SIDEBAR_WIDTH }}>
          <div className="h-[50px] border-b bg-slate-100 flex items-center px-4 font-bold text-slate-500 text-xs uppercase tracking-wider">
            Room Type
          </div>
          {rooms.map(room => (
            <div 
                key={room.id} 
                className="border-b flex items-center justify-between px-4 hover:bg-slate-50 group cursor-pointer" 
                style={{ height: ROW_HEIGHT }}
                onClick={(e) => handleRoomClick(room.id, e)}
            >
              <div>
                <div className="font-bold text-slate-800 text-sm">{room.number}</div>
                <div className="text-xs text-slate-500">{room.type}</div>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleRoomStatus(room.id); }}
                className={`text-[10px] px-2 py-0.5 rounded border uppercase font-bold transition-colors
                  ${room.status === 'CLEAN' ? 'bg-emerald-50 text-emerald-600 border-emerald-200' : 
                    room.status === 'DIRTY' ? 'bg-amber-50 text-amber-600 border-amber-200' : 
                    'bg-rose-50 text-rose-600 border-rose-200'}
                `}
              >
                {room.status}
              </button>
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="flex-1 relative">
          {/* Header Row */}
          <div className="sticky top-0 z-10 flex bg-slate-100 border-b shadow-sm" style={{ height: HEADER_HEIGHT }}>
            {dates.map((d, i) => (
               <div key={i} className={`border-r flex flex-col items-center justify-center text-slate-600 ${[0,6].includes(d.getDay()) ? 'bg-slate-100' : 'bg-slate-50'}`} style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}>
                 <span className="text-[10px] font-bold uppercase">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                 <span className="text-sm font-medium">{d.getDate()}</span>
               </div>
            ))}
          </div>

          {/* Body Rows */}
          <div className="relative">
            {rooms.map(room => (
              <div key={room.id} className="flex relative border-b" style={{ height: ROW_HEIGHT }}>
                {/* Background Cells */}
                {dates.map((d, i) => (
                  <div 
                    key={i} 
                    className="border-r hover:bg-blue-50 cursor-pointer transition-colors relative group"
                    style={{ width: CELL_WIDTH, minWidth: CELL_WIDTH }}
                    onClick={(e) => handleCellClick(room.id, d, e)}
                  >
                     {/* Hover plus icon */}
                     <div className="hidden group-hover:flex items-center justify-center h-full w-full opacity-20">
                        <User size={16} className="text-blue-500"/>
                     </div>
                  </div>
                ))}

                {/* Bookings Overlay */}
                {bookings.filter(b => b.roomId === room.id).map(booking => {
                  const style = getBookingStyles(booking);
                  if (!style) return null;

                  const isBlocked = booking.status === BookingStatus.BLOCKED;
                  const isHold = booking.status === BookingStatus.HOLD;
                  const isCancelled = booking.status === BookingStatus.CANCELLED;
                  
                  // Don't show cancelled bookings on tape chart to keep it clean, or show as gray ghost
                  if (isCancelled) return null;

                  const bgColor = isBlocked ? 'bg-rose-500 border-rose-600' : isHold ? 'bg-amber-500 border-amber-600' : 'bg-emerald-500 border-emerald-600';

                  return (
                    <div 
                      key={booking.id}
                      className={`absolute top-1.5 bottom-1.5 rounded shadow-sm border px-2 py-1 text-white text-xs font-medium truncate flex items-center gap-1 cursor-pointer hover:brightness-110 z-10 ${bgColor} transition-all hover:-translate-y-0.5`}
                      style={{ left: style.left, width: style.width - 4 }} 
                      title={`${booking.guest?.fullName} (${booking.status})`}
                      onClick={(e) => handleBookingClick(booking, e)}
                    >
                      {isBlocked ? <Lock size={12}/> : isHold ? <PauseCircle size={12}/> : <User size={12}/>}
                      <span className="truncate">{!isBlocked ? booking.guest?.fullName : "MAINTENANCE"}</span>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Context Menu Popup */}
      {contextMenu && (
        <div 
          className="fixed bg-white rounded-lg shadow-xl border border-slate-200 w-56 z-50 py-1 animate-scale-in"
          style={{ top: contextMenu.y, left: contextMenu.x }}
          onClick={(e) => e.stopPropagation()} 
        >
            {contextMenu.type === 'CELL' ? (
                <>
                    <div className="px-4 py-2 border-b bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                        {contextMenu.date}
                    </div>
                    <button onClick={() => handleMenuAction('BOOK')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors">
                        <CheckCircle size={16} className="text-emerald-500"/> New Reservation
                    </button>
                    <button onClick={() => handleMenuAction('HOLD')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors">
                        <PauseCircle size={16} className="text-amber-500"/> Hold Room
                    </button>
                    <button onClick={() => handleMenuAction('BLOCK')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors border-t">
                        <Lock size={16} className="text-rose-500"/> Block / Maintenance
                    </button>
                </>
            ) : (
                <>
                     <div className="px-4 py-2 border-b bg-slate-50 text-xs font-bold text-slate-500 uppercase">
                        Room {rooms.find(r => r.id === contextMenu.roomId)?.number} Actions
                    </div>
                    <button onClick={() => handleMenuAction('TOGGLE_STATUS')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors">
                        <AlertTriangle size={16} className="text-amber-500"/> Change Clean Status
                    </button>
                    <button onClick={() => handleMenuAction('BLOCK_ROOM')} className="w-full text-left px-4 py-3 text-sm hover:bg-slate-50 text-slate-700 flex items-center gap-2 transition-colors border-t">
                        <Lock size={16} className="text-rose-500"/> Block Room
                    </button>
                </>
            )}
        </div>
      )}

      {/* Booking Form Modal */}
      {showBookingForm.isOpen && (
        <BookingForm 
          initialDate={showBookingForm.date}
          initialRoomId={showBookingForm.roomId}
          initialStatus={showBookingForm.status}
          bookingToEdit={editingBooking}
          onClose={() => {
              setShowBookingForm({ isOpen: false });
              setEditingBooking(undefined);
          }}
          onSave={(booking) => {
             if (editingBooking) {
                 updateBooking(booking.id, booking);
             } else {
                 addBooking(booking);
             }
             setShowBookingForm({ isOpen: false });
             setEditingBooking(undefined);
          }}
        />
      )}

      {/* Booking Summary Card Modal */}
      {selectedBooking && (
          <BookingSummary 
            booking={selectedBooking}
            room={rooms.find(r => r.id === selectedBooking.roomId)}
            onClose={() => setSelectedBooking(null)}
            onEdit={() => {
                setEditingBooking(selectedBooking);
                setSelectedBooking(null);
                setShowBookingForm({ isOpen: true });
            }}
            onCancel={() => {
                cancelBooking(selectedBooking.id);
                setSelectedBooking(null);
            }}
          />
      )}
    </div>
  );
};

export default TapeChart;