import React, { useState, useEffect } from 'react';
import { Booking, BookingStatus, Room, TravelAgency } from '../types';
import { useHotel } from '../context/HotelContext';
import { X, Sparkles, User, CreditCard, Building, Calendar, FileText, IndianRupee, Check, ChevronRight } from 'lucide-react';
import { generateEmailDraft } from '../services/geminiService';

interface BookingFormProps {
  initialDate?: string;
  initialRoomId?: string;
  initialStatus?: BookingStatus;
  bookingToEdit?: Booking;
  onClose: () => void;
  onSave: (booking: Booking) => void;
}

const BookingForm: React.FC<BookingFormProps> = ({ initialDate, initialRoomId, initialStatus, bookingToEdit, onClose, onSave }) => {
  const { rooms } = useHotel();
  const [activeTab, setActiveTab] = useState<'DETAILS' | 'GUEST' | 'AGENCY' | 'PAYMENT' | 'AI'>('DETAILS');
  const [aiDraft, setAiDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  
  const [formData, setFormData] = useState<Partial<Booking>>({
    checkInDate: initialDate || new Date().toISOString().split('T')[0],
    checkOutDate: initialDate ? new Date(new Date(initialDate).getTime() + 86400000).toISOString().split('T')[0] : '',
    roomId: initialRoomId || rooms[0]?.id,
    status: initialStatus || BookingStatus.CONFIRMED,
    adults: 1,
    children: 0,
    totalAmount: 0,
    paidAmount: 0,
    paymentMethod: 'CASH',
    source: 'WALK_IN',
    guest: {
      id: Math.random().toString(36).substr(2, 9),
      fullName: '',
      email: '',
      phone: '',
      address: '',
      idProofNumber: '',
      notes: ''
    },
    travelAgency: {
      name: '',
      agentName: '',
      contact: '',
      email: '',
      commissionRate: 0
    },
    ...bookingToEdit
  });

  const selectedRoom = rooms.find(r => r.id === formData.roomId);

  useEffect(() => {
    // Auto calculate price only for new bookings or date changes
    if (!bookingToEdit && selectedRoom && formData.checkInDate && formData.checkOutDate) {
      const start = new Date(formData.checkInDate);
      const end = new Date(formData.checkOutDate);
      const nights = Math.ceil((end.getTime() - start.getTime()) / (1000 * 3600 * 24));
      if (nights > 0) {
        setFormData(prev => ({ ...prev, totalAmount: nights * selectedRoom.pricePerNight }));
      }
    }
  }, [formData.checkInDate, formData.checkOutDate, formData.roomId, selectedRoom, bookingToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newBooking: Booking = {
      id: bookingToEdit?.id || Math.random().toString(36).substr(2, 9),
      ...formData as Booking,
      color: formData.status === BookingStatus.BLOCKED ? 'red' : 
             formData.status === BookingStatus.HOLD ? 'amber' : 'emerald'
    };
    onSave(newBooking);
  };

  const handleGenerateEmail = async () => {
    if (!formData.guest?.fullName || !selectedRoom) return;
    setIsGenerating(true);
    const text = await generateEmailDraft(formData as Booking, selectedRoom, 'CONFIRMATION');
    setAiDraft(text);
    setIsGenerating(false);
  };

  const isBlockMode = formData.status === BookingStatus.BLOCKED;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-scale-in border border-white/20">
        
        {/* Header */}
        <div className="h-16 px-8 flex justify-between items-center border-b border-slate-100 bg-white z-20 shrink-0">
          <div className="flex items-center gap-4">
             <div className={`p-2 rounded-lg ${isBlockMode ? 'bg-rose-100 text-rose-600' : 'bg-brand-100 text-brand-600'}`}>
                {isBlockMode ? <Building size={20}/> : <Calendar size={20}/>}
             </div>
             <div>
                <h2 className="text-lg font-bold text-slate-800 leading-none">
                  {isBlockMode ? 'Block Room / Maintenance' : bookingToEdit ? 'Edit Reservation' : 'New Reservation'}
                </h2>
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                   <span>ID: {bookingToEdit?.id || 'New'}</span>
                   {isBlockMode && <span className="px-2 py-0.5 bg-rose-100 text-rose-700 rounded-full font-bold text-[10px]">BLOCKED</span>}
                </div>
             </div>
          </div>
          <button 
            onClick={onClose} 
            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Layout: Sidebar Tabs + Content */}
        <div className="flex flex-1 overflow-hidden bg-slate-50">
          {/* Sidebar Tabs */}
          <div className="w-60 bg-white border-r border-slate-200 py-6 flex flex-col gap-2 shrink-0">
             <div className="px-6 pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Form Sections</div>
             {[
               { id: 'DETAILS', label: 'Stay Details', icon: Calendar, desc: 'Dates, Room, Occupancy' },
               { id: 'GUEST', label: 'Guest Profile', icon: User, desc: 'Name, Contact, ID' },
               { id: 'AGENCY', label: 'Agency & Source', icon: Building, desc: 'OTA, Corporate, Agent' },
               { id: 'PAYMENT', label: 'Billing & Payment', icon: CreditCard, desc: 'Amount, Method, Status' },
               { id: 'AI', label: 'AI Assistant', icon: Sparkles, desc: 'Generate Emails' },
             ].map(tab => (
               (!isBlockMode || tab.id === 'DETAILS') && (
                 <button
                   key={tab.id}
                   onClick={() => setActiveTab(tab.id as any)}
                   className={`px-6 py-3 text-left relative group transition-all
                     ${activeTab === tab.id ? 'bg-brand-50' : 'hover:bg-slate-50'}
                   `}
                 >
                   {activeTab === tab.id && <div className="absolute left-0 top-0 bottom-0 w-1 bg-brand-500 rounded-r-full"></div>}
                   <div className="flex items-start gap-3">
                      <div className={`mt-0.5 transition-colors ${activeTab === tab.id ? 'text-brand-600' : 'text-slate-400 group-hover:text-slate-600'}`}>
                         <tab.icon size={18} />
                      </div>
                      <div>
                         <div className={`text-sm font-bold transition-colors ${activeTab === tab.id ? 'text-brand-900' : 'text-slate-600 group-hover:text-slate-800'}`}>{tab.label}</div>
                         <div className="text-[10px] text-slate-400 font-medium">{tab.desc}</div>
                      </div>
                   </div>
                 </button>
               )
             ))}
          </div>

          {/* Form Content */}
          <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-8 relative">
            
            {activeTab === 'DETAILS' && (
              <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
                <div>
                   <h3 className="text-xl font-bold text-slate-800 mb-1">Stay Details</h3>
                   <p className="text-slate-500 text-sm">Configure check-in dates, room selection and occupancy.</p>
                </div>

                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Room Selection</label>
                      <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-medium text-slate-700"
                        value={formData.roomId}
                        onChange={e => setFormData({...formData, roomId: e.target.value})}
                      >
                        {rooms.map(r => (
                          <option key={r.id} value={r.id}>{r.number} - {r.type} (₹{r.pricePerNight})</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Booking Status</label>
                      <select 
                        className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-brand-500 outline-none transition-all font-medium text-slate-700"
                        value={formData.status}
                        onChange={e => setFormData({...formData, status: e.target.value as BookingStatus})}
                      >
                        <option value={BookingStatus.CONFIRMED}>Confirmed</option>
                        <option value={BookingStatus.HOLD}>Hold (Tentative)</option>
                        <option value={BookingStatus.CHECKED_IN}>Checked In</option>
                        <option value={BookingStatus.CHECKED_OUT}>Checked Out</option>
                        <option value={BookingStatus.BLOCKED}>Block / Maintenance</option>
                        <option value={BookingStatus.CANCELLED}>Cancelled</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Check In Date</label>
                      <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" required 
                        value={formData.checkInDate}
                        onChange={e => setFormData({...formData, checkInDate: e.target.value})}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Check Out Date</label>
                      <input type="date" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" required 
                         value={formData.checkOutDate}
                         onChange={e => setFormData({...formData, checkOutDate: e.target.value})}
                      />
                    </div>
                  </div>

                  {!isBlockMode && (
                    <div className="grid grid-cols-3 gap-6 pt-2 border-t border-slate-100">
                       <div className="col-span-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Adults</label>
                          <input type="number" min="1" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            value={formData.adults}
                            onChange={e => setFormData({...formData, adults: parseInt(e.target.value)})}
                          />
                       </div>
                       <div className="col-span-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Children</label>
                          <input type="number" min="0" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            value={formData.children}
                            onChange={e => setFormData({...formData, children: parseInt(e.target.value)})}
                          />
                       </div>
                       <div className="col-span-1">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Source</label>
                          <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                             value={formData.source}
                             onChange={e => setFormData({...formData, source: e.target.value as any})}
                          >
                             <option value="WALK_IN">Walk In</option>
                             <option value="PHONE">Phone</option>
                             <option value="WEB">Website</option>
                             <option value="OTA">OTA</option>
                          </select>
                       </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'GUEST' && !isBlockMode && (
               <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Guest Profile</h3>
                    <p className="text-slate-500 text-sm">Primary guest contact information and identification.</p>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Full Name</label>
                          <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" required placeholder="e.g. John Doe"
                            value={formData.guest?.fullName}
                            onChange={e => setFormData({...formData, guest: {...formData.guest!, fullName: e.target.value}})}
                          />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Email Address</label>
                         <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="john@example.com"
                            value={formData.guest?.email}
                            onChange={e => setFormData({...formData, guest: {...formData.guest!, email: e.target.value}})}
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Phone Number</label>
                         <input type="tel" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="+91 99999 99999"
                            value={formData.guest?.phone}
                            onChange={e => setFormData({...formData, guest: {...formData.guest!, phone: e.target.value}})}
                         />
                       </div>
                       <div className="col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Address</label>
                         <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="Street address, City, Country"
                            value={formData.guest?.address}
                            onChange={e => setFormData({...formData, guest: {...formData.guest!, address: e.target.value}})}
                         />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">ID Proof Number</label>
                          <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="Passport / Aadhar / DL"
                             value={formData.guest?.idProofNumber}
                             onChange={e => setFormData({...formData, guest: {...formData.guest!, idProofNumber: e.target.value}})}
                          />
                       </div>
                       <div className="col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Notes / Special Requests</label>
                         <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg h-24 focus:ring-2 focus:ring-brand-500 outline-none transition-all resize-none" placeholder="Allergies, preferences, etc."
                            value={formData.guest?.notes}
                            onChange={e => setFormData({...formData, guest: {...formData.guest!, notes: e.target.value}})}
                         />
                       </div>
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'AGENCY' && !isBlockMode && (
               <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Travel Agency</h3>
                    <p className="text-slate-500 text-sm">Booking source details and commission information.</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="col-span-2">
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Agency Name</label>
                         <input type="text" placeholder="e.g., Booking.com, Expedia, Local Agent" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                           value={formData.travelAgency?.name}
                           onChange={e => setFormData({...formData, travelAgency: {...formData.travelAgency!, name: e.target.value}})}
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Agent Contact Person</label>
                         <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                           value={formData.travelAgency?.agentName}
                           onChange={e => setFormData({...formData, travelAgency: {...formData.travelAgency!, agentName: e.target.value}})}
                         />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Contact Phone</label>
                         <input type="tel" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                           value={formData.travelAgency?.contact}
                           onChange={e => setFormData({...formData, travelAgency: {...formData.travelAgency!, contact: e.target.value}})}
                         />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Agent Email</label>
                          <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            value={formData.travelAgency?.email}
                            onChange={e => setFormData({...formData, travelAgency: {...formData.travelAgency!, email: e.target.value}})}
                          />
                       </div>
                       <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Commission Rate (%)</label>
                          <input type="number" min="0" max="100" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                            value={formData.travelAgency?.commissionRate}
                            onChange={e => setFormData({...formData, travelAgency: {...formData.travelAgency!, commissionRate: parseFloat(e.target.value)}})}
                          />
                       </div>
                    </div>
                  </div>
               </div>
            )}

            {activeTab === 'PAYMENT' && !isBlockMode && (
               <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
                  <div>
                    <h3 className="text-xl font-bold text-slate-800 mb-1">Billing & Payment</h3>
                    <p className="text-slate-500 text-sm">Manage total cost, deposits and payment methods.</p>
                  </div>

                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6">
                     <div className="bg-slate-900 p-6 rounded-xl text-white flex flex-col items-center justify-center relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                         <div className="absolute bottom-0 left-0 w-24 h-24 bg-brand-500/20 rounded-full -ml-8 -mb-8 blur-xl"></div>
                         
                         <span className="text-slate-400 text-xs uppercase font-bold tracking-widest mb-1 relative z-10">Total Booking Amount</span>
                         <span className="text-5xl font-bold flex items-center relative z-10"><IndianRupee size={36} strokeWidth={2.5}/>{formData.totalAmount?.toLocaleString()}</span>
                         <span className="text-sm text-slate-400 mt-2 bg-white/10 px-3 py-1 rounded-full relative z-10">
                            {formData.checkInDate && formData.checkOutDate && 
                               `${Math.ceil((new Date(formData.checkOutDate).getTime() - new Date(formData.checkInDate).getTime()) / (86400000))} Nights @ ₹${selectedRoom?.pricePerNight}/night`
                            }
                         </span>
                     </div>
                     
                     <div className="grid grid-cols-2 gap-6 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Paid Amount</label>
                          <div className="relative">
                             <span className="absolute left-3 top-3.5 text-slate-400"><IndianRupee size={16}/></span>
                             <input type="number" className="w-full p-3 pl-9 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all font-bold text-slate-800"
                               value={formData.paidAmount}
                               onChange={e => setFormData({...formData, paidAmount: parseFloat(e.target.value)})}
                             />
                          </div>
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Payment Method</label>
                          <select className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all"
                             value={formData.paymentMethod}
                             onChange={e => setFormData({...formData, paymentMethod: e.target.value as any})}
                          >
                             <option value="CASH">Cash</option>
                             <option value="CREDIT_CARD">Credit Card</option>
                             <option value="BANK_TRANSFER">Bank Transfer</option>
                             <option value="UPI">UPI / Digital</option>
                             <option value="OTA">OTA / Pre-paid</option>
                          </select>
                        </div>
                        <div className="col-span-2">
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Transaction ID / Reference</label>
                          <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-brand-500 outline-none transition-all" placeholder="Optional for Cash"
                             value={formData.transactionId}
                             onChange={e => setFormData({...formData, transactionId: e.target.value})}
                          />
                        </div>
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'AI' && !isBlockMode && (
              <div className="max-w-3xl mx-auto animate-fade-in space-y-8">
                <div>
                   <h3 className="text-xl font-bold text-slate-800 mb-1">AI Assistant</h3>
                   <p className="text-slate-500 text-sm">Use AI to generate professional communications.</p>
                </div>
                
                <div className="bg-indigo-50 p-8 rounded-xl border border-indigo-100 shadow-sm">
                  <div className="flex items-start gap-4 mb-6">
                     <div className="p-3 bg-white rounded-lg shadow-sm text-indigo-600"><Sparkles size={24}/></div>
                     <div>
                        <h4 className="font-bold text-indigo-900 text-lg">Email Generator</h4>
                        <p className="text-sm text-indigo-700/80 mt-1 leading-relaxed">
                          Generate a personalized confirmation email, welcome note, or invoice summary for <b>{formData.guest?.fullName || 'the guest'}</b>.
                        </p>
                     </div>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleGenerateEmail}
                    disabled={isGenerating || !formData.guest?.fullName}
                    className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-indigo-600 text-white rounded-xl text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-200"
                  >
                    {isGenerating ? 'Generating Draft...' : <><Sparkles size={18} /> Generate Confirmation Email</>}
                  </button>
                </div>
                
                {aiDraft && (
                  <div className="space-y-3 animate-slide-up">
                    <div className="flex justify-between items-center">
                       <label className="text-xs font-bold text-slate-500 uppercase">Generated Content</label>
                       <button type="button" className="text-xs text-brand-600 font-bold hover:text-brand-800 hover:underline" onClick={() => navigator.clipboard.writeText(aiDraft)}>Copy to Clipboard</button>
                    </div>
                    <textarea 
                      readOnly 
                      value={aiDraft} 
                      className="w-full h-64 p-5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-mono text-slate-700 resize-none focus:outline-none shadow-inner" 
                    />
                  </div>
                )}
              </div>
            )}
          </form>

          {/* Footer Actions */}
          <div className="h-20 bg-white border-t border-slate-200 px-8 flex items-center justify-between shrink-0 z-20">
             <div className="text-sm text-slate-500">
                {isBlockMode ? (
                  <span className="flex items-center gap-2 text-rose-600 font-medium"><Building size={16}/> Room Block Mode</span>
                ) : (
                   <span>Total: <span className="font-bold text-slate-900">₹{formData.totalAmount?.toLocaleString()}</span></span>
                )}
             </div>
             <div className="flex gap-4">
                <button type="button" onClick={onClose} className="px-6 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-lg transition-colors">Cancel</button>
                <button type="button" onClick={handleSubmit} className={`px-8 py-2.5 text-white font-bold rounded-lg shadow-lg transform active:scale-95 transition-all flex items-center gap-2 ${isBlockMode ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' : 'bg-slate-900 hover:bg-slate-800 shadow-slate-300'}`}>
                  <Check size={18}/>
                  {isBlockMode ? 'Confirm Block' : 'Save Reservation'}
                </button>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default BookingForm;