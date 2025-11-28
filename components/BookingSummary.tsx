import React, { useState } from 'react';
import { Booking, Room, BookingStatus } from '../types';
import { X, Mail, Printer, Star, Info, IndianRupee, ArrowLeft, AlertTriangle } from 'lucide-react';

interface BookingSummaryProps {
  booking: Booking;
  room?: Room;
  onClose: () => void;
  onEdit: () => void;
  onCancel: () => void;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ booking, room, onClose, onEdit, onCancel }) => {
  const [activeTab, setActiveTab] = useState('GENERAL');
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const checkIn = new Date(booking.checkInDate);
  const checkOut = new Date(booking.checkOutDate);
  const start = new Date(checkIn); start.setHours(12, 0, 0, 0);
  const end = new Date(checkOut); end.setHours(12, 0, 0, 0);
  const nights = Math.max(1, Math.ceil((end.getTime() - start.getTime()) / (86400000)));

  // Financial calculations
  const totalBill = booking.totalAmount;
  const taxes = booking.taxAmount || 0;
  const discount = booking.discountAmount || 0;
  // Assuming totalAmount in data is the final amount including taxes for simplicity in other views, 
  // but here we break it down. Let's assume totalAmount = Room Charges + Taxes - Discount.
  // Reverse calc for display if needed, or just use fields.
  const roomCharges = totalBill - taxes + discount; 
  
  const subTotal = roomCharges; // + Addons if any
  const netPayable = subTotal + taxes - discount;
  const outstanding = netPayable - booking.paidAmount;

  const isCancelled = booking.status === BookingStatus.CANCELLED;
  
  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-scale-in relative font-sans text-slate-800">
        
        {/* Header Bar */}
        <div className="flex h-14 shrink-0">
          <div className="bg-[#8cc63f] w-48 flex flex-col justify-center px-4 relative">
             <span className="font-bold text-lg">#{booking.id}</span>
             {/* Triangle pointer */}
             <div className="absolute top-0 right-[-10px] w-0 h-0 border-t-[56px] border-t-[#8cc63f] border-r-[15px] border-r-transparent"></div>
          </div>
          <div className="bg-slate-900 flex-1 flex items-center justify-between px-6 text-white">
             <div>
                <div className="text-[10px] uppercase font-bold text-slate-400">REF I.D.</div>
                <div className="text-sm font-bold">{booking.travelAgency?.name ? 'N.A.' : 'N.A.'}</div>
             </div>
             <button onClick={onClose} className="p-1 hover:bg-slate-700 rounded transition-colors"><X size={24} /></button>
          </div>
        </div>

        {/* Sub Header Dates */}
        <div className="flex bg-white border-b py-4 px-8 items-center justify-between shadow-sm z-10">
           <div className="flex items-center gap-8">
              <div className="text-center">
                 <div className="text-4xl font-bold text-slate-800">{checkIn.getDate()}</div>
                 <div className="text-xs font-bold uppercase text-slate-500">{checkIn.toLocaleString('default', { month: 'short' })} {checkIn.getFullYear()}</div>
              </div>
              <div className="flex flex-col items-center px-4">
                 <span className="text-xs font-bold text-slate-400 mb-1">{nights} Nights</span>
                 <div className="flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                   <span className="w-16 border-t-2 border-dotted border-slate-300"></span>
                   <span className="w-2 h-2 rounded-full bg-slate-300"></span>
                 </div>
              </div>
              <div className="text-center">
                 <div className="text-4xl font-bold text-slate-800">{checkOut.getDate()}</div>
                 <div className="text-xs font-bold uppercase text-slate-500">{checkOut.toLocaleString('default', { month: 'short' })} {checkOut.getFullYear()}</div>
              </div>
           </div>
           
           <div className="bg-slate-100 rounded-full px-6 py-2 flex items-center gap-2 font-bold text-slate-700 text-sm">
              <span>{booking.adults + booking.children + (booking.infants || 0)} - {room?.type || 'Room'} - {booking.mealPlan || 'CP'} X {nights}</span>
           </div>
        </div>

        {/* Toolbar */}
        <div className="bg-slate-100 px-6 py-2 border-b flex items-center gap-4">
           <button className="px-3 py-1 bg-white border rounded shadow-sm text-xs font-bold text-slate-600 hover:bg-slate-50">Go Back</button>
           <div className="flex gap-1 ml-4">
              <button 
                onClick={() => setActiveTab('GENERAL')}
                className={`px-4 py-1.5 text-xs font-bold uppercase rounded-t-lg border-x border-t transition-colors ${activeTab === 'GENERAL' ? 'bg-white border-b-white text-slate-800' : 'bg-slate-200 border-slate-300 text-slate-500'}`}
              >
                General
              </button>
              <button className="px-4 py-1.5 text-xs font-bold uppercase rounded-t-lg border border-transparent text-slate-500 hover:bg-slate-200">
                + Outlet
              </button>
           </div>
           
           <div className="ml-auto flex gap-2">
              <button onClick={onEdit} className="px-3 py-1.5 bg-white border border-slate-300 rounded shadow-sm text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1">
                 EDIT
              </button>
           </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto bg-white p-8">
           <div className="max-w-4xl mx-auto space-y-8">
              
              {/* Booking Details Section */}
              <section>
                 <h3 className="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4">Booking Details</h3>
                 <div className="grid grid-cols-2 gap-y-6 gap-x-12">
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Booking source</label>
                       <div className="text-sm text-slate-700">{booking.source === 'OTA' ? booking.travelAgency?.name : booking.source}</div>
                       <div className="text-xs text-slate-400 mt-0.5">{booking.travelAgency?.name || 'Direct'}</div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Agent</label>
                       <div className="text-sm text-slate-700">{booking.travelAgency?.agentName || 'N.A.'}</div>
                       <div className="text-xs text-slate-400 mt-0.5">{booking.travelAgency?.contact || '--'}</div>
                    </div>
                    
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Pay At Hotel</label>
                       <div className="text-sm text-slate-700">{booking.totalAmount - booking.paidAmount > 0 ? 'Yes' : 'No'}</div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Booking Type</label>
                       <div className="text-sm text-slate-700">{booking.bookingType || 'FIT'}</div>
                    </div>

                    <div className="col-span-2 border-t border-dotted my-2"></div>

                    <div className="col-span-2">
                       <label className="block text-xs font-bold text-slate-500 mb-1">Date</label>
                       <div className="text-sm text-slate-700">{formatDate(booking.checkInDate)} -- {formatDate(booking.checkOutDate)}</div>
                    </div>

                    <div className="col-span-2 border-t border-dotted my-2"></div>

                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-slate-400 flex items-center justify-center text-[8px]">L</span> Check-in Time</label>
                       <div className="text-sm text-slate-700">{booking.checkInTime || '13:00'}</div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1 flex items-center gap-1"><span className="w-3 h-3 rounded-full border border-slate-400 flex items-center justify-center text-[8px]">L</span> Check-out Time</label>
                       <div className="text-sm text-slate-700">{booking.checkOutTime || '11:00'}</div>
                    </div>

                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Rooms</label>
                       <div className="text-sm text-slate-700">1</div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Meal Plan</label>
                       <div className="text-sm text-slate-700">{booking.mealPlan || 'CP'}</div>
                    </div>
                    <div>
                       <label className="block text-xs font-bold text-slate-500 mb-1">Rate Plan</label>
                       <div className="text-sm text-slate-700">{booking.ratePlan || 'Best Available Rates'}</div>
                    </div>
                 </div>
              </section>

              {/* Requirements Section */}
              <section>
                 <h3 className="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4">Requirements</h3>
                 <div className="bg-slate-50 p-4 rounded-lg">
                    <h4 className="font-bold text-sm text-slate-800 mb-2">Room 1 | {room?.type || 'Deluxe'}</h4>
                    <div className="flex justify-between items-start text-sm">
                       <div className="flex gap-8">
                          <div>
                             <span className="block text-xs font-bold text-slate-500 uppercase">Adults</span>
                             <span>{booking.adults}</span>
                          </div>
                          <div>
                             <span className="block text-xs font-bold text-slate-500 uppercase">Children</span>
                             <span>{booking.children}</span>
                          </div>
                          <div>
                             <span className="block text-xs font-bold text-slate-500 uppercase">Infant</span>
                             <span>{booking.infants || 0}</span>
                          </div>
                          <div>
                             <span className="block text-xs font-bold text-slate-500 uppercase">Room No.</span>
                             <span>{room?.number || 'TBD'}</span>
                          </div>
                       </div>
                       <div className="text-right">
                          <div className="font-bold">₹ {roomCharges.toLocaleString('en-IN', {minimumFractionDigits: 2})} / {nights} nt</div>
                       </div>
                    </div>
                    <div className="border-t border-slate-200 mt-3 pt-2 text-right text-xs space-y-1">
                        <div className="flex justify-between">
                            <span>Room Total</span>
                            <span>{roomCharges.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Discount</span>
                            <span>({discount.toLocaleString('en-IN', {minimumFractionDigits: 2})})</span>
                        </div>
                        <div className="flex justify-between text-slate-500">
                            <span>Taxes</span>
                            <span>{taxes.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between font-bold text-slate-800 border-t border-slate-200 pt-1 mt-1">
                            <span>Total</span>
                            <span className="flex items-center justify-end"><Info size={12} className="mr-1 text-blue-400"/> {netPayable.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                        </div>
                    </div>
                 </div>
              </section>

              {/* Billing Preferences */}
              <section>
                 <h3 className="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4 flex items-center gap-2">
                    Billing Preferences <Info size={16} className="text-blue-400"/>
                 </h3>
                 <div className="grid grid-cols-2 gap-8">
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Room Bill</label>
                        <div className="text-sm text-slate-700">To {booking.billingPreferences?.roomCharges || 'Guest'} {booking.billingPreferences?.roomCharges === 'COMPANY' && `(${booking.travelAgency?.name || 'Company'})`}</div>
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Extras</label>
                        <div className="text-sm text-slate-700">To {booking.billingPreferences?.extras || 'Guest'}</div>
                    </div>
                 </div>
              </section>

              {/* Guest Details */}
              <section className="bg-slate-50 p-6 rounded-lg border border-slate-100 relative">
                 <h3 className="text-lg font-bold text-slate-800 border-b pb-2 mb-4">Guest Details</h3>
                 <div className="flex justify-between items-start">
                    <div>
                       <div className="flex items-center gap-2">
                          <h4 className="font-bold text-base text-slate-800">{booking.guest?.fullName}</h4>
                          <Star size={14} className="text-yellow-400 fill-yellow-400"/>
                          <Printer size={14} className="text-slate-400 cursor-pointer hover:text-slate-600"/>
                       </div>
                       <div className="text-sm text-slate-600 mt-1">{booking.guest?.phone}</div>
                       <div className="border-t border-dashed border-slate-300 w-full my-2"></div>
                    </div>
                    <div className="text-right">
                       <span className="font-bold text-slate-800 text-sm">{room?.number || 'TBA'}</span>
                    </div>
                 </div>
                 
                 {/* Status Stamp */}
                 {!isCancelled && (
                     <div className="absolute top-16 right-6 border-[2px] border-emerald-500 text-emerald-500 rounded-full w-24 h-24 flex items-center justify-center transform -rotate-12 opacity-80 pointer-events-none">
                        <div className="border border-emerald-500 rounded-full w-20 h-20 flex items-center justify-center">
                            <span className="font-bold text-[10px] uppercase tracking-wider">{booking.status}</span>
                        </div>
                     </div>
                 )}
                 {isCancelled && (
                     <div className="absolute top-16 right-6 border-[2px] border-red-500 text-red-500 rounded-full w-24 h-24 flex items-center justify-center transform -rotate-12 opacity-80 pointer-events-none">
                        <div className="border border-red-500 rounded-full w-20 h-20 flex items-center justify-center">
                            <span className="font-bold text-[10px] uppercase tracking-wider">CANCELLED</span>
                        </div>
                     </div>
                 )}
              </section>

              {/* Addons Section Header */}
              <section>
                 <h3 className="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4">Addons</h3>
                 <div className="text-sm text-slate-400 italic">No addons selected.</div>
              </section>

              {/* Payments */}
              <section>
                 <h3 className="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4">Payments</h3>
                 <div className="flex justify-end gap-2">
                    <button className="flex items-center gap-2 bg-white border border-slate-300 px-4 py-1.5 rounded text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm">
                       <span className="bg-orange-500 text-white rounded-full w-4 h-4 flex items-center justify-center text-[10px] italic font-serif">e</span> COLLECT
                    </button>
                    <button className="bg-white border border-slate-300 px-4 py-1.5 rounded text-sm font-bold text-slate-700 hover:bg-slate-50 shadow-sm">ADD</button>
                 </div>
              </section>
              
              {/* Allowance */}
              <section className="bg-slate-50 p-3 rounded">
                 <h3 className="text-base font-bold text-slate-800 mb-1">Allowance</h3>
                 <p className="text-xs text-slate-400 text-right italic">*Allowance can be created after CheckIn and before CheckOut</p>
              </section>

              {/* Bill Summary */}
              <section>
                 <h3 className="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4">Bill Summary</h3>
                 <div className="space-y-2 text-sm">
                    <div className="flex justify-between text-slate-600">
                       <span>Room Charges</span>
                       <span>{roomCharges.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                       <span>Addons</span>
                       <span>0.00</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                       <span>Discount</span>
                       <span>({discount.toLocaleString('en-IN', {minimumFractionDigits: 2})})</span>
                    </div>
                    
                    <div className="border-t border-slate-200 border-dashed my-2"></div>
                    
                    <div className="flex justify-between text-slate-800 font-medium">
                       <span>Sub Total</span>
                       <span>{subTotal.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                       <span className="flex items-center gap-1">Taxes <Info size={12} className="text-blue-400"/></span>
                       <span>{taxes.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                       <span>Payments</span>
                       <span>{booking.paidAmount.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                       <span>Credit Note</span>
                       <span>0.00</span>
                    </div>
                    <div className="flex justify-between text-slate-800 font-bold mt-2">
                       <span>Net Payable by Guest</span>
                       <span>{(booking.billingPreferences?.roomCharges === 'GUEST' ? netPayable : 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="flex justify-between text-slate-800 font-bold">
                       <span>Net Payable by Company</span>
                       <span>{(booking.billingPreferences?.roomCharges === 'COMPANY' || booking.billingPreferences?.roomCharges === 'AGENT' ? netPayable : 0).toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                    <div className="border-t-2 border-slate-200 border-dashed my-2"></div>
                    <div className="flex justify-between text-slate-800 font-bold text-base">
                       <span>Net Payable at Hotel</span>
                       <span>{outstanding.toLocaleString('en-IN', {minimumFractionDigits: 2})}</span>
                    </div>
                 </div>
              </section>

              {/* Credit Note */}
              <section className="bg-slate-50 p-3 rounded">
                 <h3 className="text-base font-bold text-slate-800 mb-1">Credit Note</h3>
                 <p className="text-xs text-slate-400 text-right italic">*Credit note can be issued after invoice is generated</p>
              </section>

              {/* Sales Executive */}
              <section className="bg-slate-50 p-3 rounded">
                  <h3 className="text-base font-bold text-slate-800 mb-1 flex items-center gap-1">Sales Executive <Info size={14} className="text-black"/></h3>
              </section>

              {/* Attachments */}
              <section className="bg-slate-50 p-3 rounded">
                  <h3 className="text-base font-bold text-slate-800 mb-1">Attachments</h3>
              </section>

              {/* Others */}
              <section>
                  <h3 className="text-lg font-bold text-slate-800 border-b-2 border-slate-100 pb-2 mb-4">Others</h3>
                  
                  <div className="space-y-6">
                     <div>
                        <h4 className="font-bold text-slate-700 text-sm mb-1">Inclusions</h4>
                        <ul className="text-sm text-slate-600 space-y-0.5">
                           {booking.inclusions?.map((inc, i) => (
                              <li key={i}>{inc}</li>
                           )) || <li>No specific inclusions.</li>}
                        </ul>
                        <div className="text-right">
                           <button className="text-xs text-blue-500 hover:underline">...View more</button>
                        </div>
                     </div>

                     <div className="border-t border-dashed border-slate-300"></div>

                     <div>
                        <h4 className="font-bold text-slate-700 text-sm mb-1">Special Instructions <span className="text-slate-400 font-normal italic">(shared with guest)</span></h4>
                        <p className="text-sm text-slate-600">{booking.specialInstructions || 'None'}</p>
                     </div>

                     <div className="border-t border-dashed border-slate-300"></div>

                     <div>
                        <h4 className="font-bold text-slate-700 text-sm mb-1">Internal Notes</h4>
                        <div className="text-sm text-slate-600 space-y-1 italic">
                           <p>Hotel Booking Request</p>
                           <p>Guest Name - {booking.guest?.fullName}</p>
                           <p>Pax: adults: {booking.adults.toString().padStart(2,'0')} adults</p>
                           <p>No of room - 01 Room</p>
                           <br/>
                           <p>Hotel Name (NovaStay)</p>
                           <p>Darjeeling ( {room?.type} )</p>
                           <p>Ch in - {formatDate(booking.checkInDate)}</p>
                           <p>Ch out - {formatDate(booking.checkOutDate)}</p>
                           <br/>
                           <p>Meal Plan - {booking.mealPlan}</p>
                           <p>{booking.travelAgency?.name ? booking.travelAgency.name.toUpperCase() : 'DIRECT'}</p>
                           <p>{room?.pricePerNight}/- Per Night</p>
                           <p>{booking.internalNotes}</p>
                        </div>
                     </div>

                     <div className="border-t border-dashed border-slate-300"></div>
                     
                     <div>
                        <h4 className="font-bold text-slate-700 text-sm mb-1">Cancellation Policy</h4>
                        <p className="text-sm text-slate-600 italic">Cancellation Charges of 100% will be applicable if cancelled/No Show on or after {new Date(new Date(booking.checkInDate).getTime() - 86400000*2).toLocaleDateString()}</p>
                     </div>

                     <div className="border-t border-dashed border-slate-300"></div>

                     <div>
                        <h4 className="font-bold text-slate-700 text-sm mb-1">Copy To:</h4>
                     </div>

                     <div className="border-t border-dashed border-slate-300"></div>

                     <div className="text-xs text-slate-500 space-y-1">
                        <p>Last updated on {booking.updatedAt ? new Date(booking.updatedAt).toLocaleString() : 'N/A'}, by {booking.updatedBy || 'System'}</p>
                        <p>Created on {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}, by {booking.createdBy || 'System'}</p>
                     </div>
                  </div>
              </section>

           </div>
           
           <div className="mt-8 flex justify-center pb-8">
              {!isCancelled && (
                 <button 
                   onClick={() => setShowCancelConfirm(true)} 
                   className="bg-orange-600 text-white font-bold px-8 py-2 rounded shadow hover:bg-orange-700 transition-colors uppercase text-sm"
                 >
                    CANCEL BOOKING
                 </button>
              )}
           </div>
        </div>

        {/* Confirmation Modal Overlay */}
        {showCancelConfirm && (
           <div className="absolute inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-fade-in">
              <div className="bg-white rounded-xl shadow-2xl p-6 w-96 max-w-full text-center animate-scale-in">
                 <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <AlertTriangle size={24} />
                 </div>
                 <h3 className="text-lg font-bold text-slate-800 mb-2">Cancel Reservation?</h3>
                 <p className="text-sm text-slate-500 mb-6 leading-relaxed">
                    Are you sure you want to cancel this booking for <b>{booking.guest?.fullName}</b>? This action cannot be undone.
                 </p>
                 <div className="flex gap-3">
                    <button 
                       onClick={() => setShowCancelConfirm(false)}
                       className="flex-1 py-2.5 bg-slate-100 text-slate-700 font-bold rounded-lg hover:bg-slate-200 transition-colors text-sm"
                    >
                       No, Keep
                    </button>
                    <button 
                       onClick={() => {
                          onCancel();
                          setShowCancelConfirm(false);
                       }}
                       className="flex-1 py-2.5 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                       Yes, Cancel
                    </button>
                 </div>
              </div>
           </div>
        )}
      </div>
    </div>
  );
};

export default BookingSummary;