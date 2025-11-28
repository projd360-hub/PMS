
import React from 'react';
import { useHotel } from '../context/HotelContext';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';
import { IndianRupee, Users, BedDouble, TrendingUp, ArrowUpRight, ArrowDownRight, Briefcase, Clock } from 'lucide-react';

const Dashboard: React.FC = () => {
  const { bookings, rooms } = useHotel();

  // --- Stats Calculations ---
  const totalRevenue = bookings.reduce((sum, b) => sum + b.totalAmount, 0);
  // Calculate average daily rate (dummy calc for demo)
  const adr = totalRevenue / Math.max(1, bookings.length);
  const occupancyRate = (bookings.filter(b => b.status === 'CHECKED_IN').length / rooms.length) * 100;
  const arrivalsToday = bookings.filter(b => b.checkInDate === new Date().toISOString().split('T')[0]).length;
  const departuresToday = bookings.filter(b => b.checkOutDate === new Date().toISOString().split('T')[0]).length;

  // --- Chart Data ---
  const revenueTrendData = [
    { name: 'Mon', revenue: 14000 },
    { name: 'Tue', revenue: 23000 },
    { name: 'Wed', revenue: 17500 },
    { name: 'Thu', revenue: 35000 },
    { name: 'Fri', revenue: 29000 },
    { name: 'Sat', revenue: 42000 },
    { name: 'Sun', revenue: 38000 },
  ];

  const roomStatusData = [
    { name: 'Clean', value: rooms.filter(r => r.status === 'CLEAN').length, color: '#10b981' }, // emerald-500
    { name: 'Dirty', value: rooms.filter(r => r.status === 'DIRTY').length, color: '#f59e0b' }, // amber-500
    { name: 'Maint.', value: rooms.filter(r => r.status === 'MAINTENANCE').length, color: '#ef4444' }, // red-500
  ];

  const recentBookings = bookings.slice(-5).reverse();

  const StatCard = ({ label, value, subValue, icon: Icon, trend }: any) => (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between h-32">
       <div className="flex justify-between items-start">
          <div>
             <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">{label}</p>
             <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
          </div>
          <div className="p-2 bg-slate-50 rounded-lg text-slate-600 border border-slate-100">
             <Icon size={20} />
          </div>
       </div>
       <div className={`text-xs font-bold flex items-center gap-1 ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trend === 'up' ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
          {subValue}
       </div>
    </div>
  );

  return (
    <div className="p-8 space-y-8 overflow-y-auto h-full bg-slate-50">
      
      {/* Top Header */}
      <div className="flex justify-between items-end">
         <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Property Overview</h1>
            <p className="text-slate-500 text-sm mt-1">Real-time performance metrics and room status.</p>
         </div>
         <div className="text-sm font-medium text-slate-500 bg-white px-3 py-1 rounded border shadow-sm">
            Today: {new Date().toLocaleDateString()}
         </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         <StatCard 
            label="Total Revenue" 
            value={`₹${totalRevenue.toLocaleString()}`} 
            subValue="12.5% vs last week" 
            icon={IndianRupee} 
            trend="up"
         />
         <StatCard 
            label="Occupancy Rate" 
            value={`${occupancyRate.toFixed(0)}%`} 
            subValue="4% vs last week" 
            icon={BedDouble} 
            trend="up"
         />
         <StatCard 
            label="Arrivals" 
            value={arrivalsToday} 
            subValue="2 Pending Check-in" 
            icon={Briefcase} 
            trend="up"
         />
         <StatCard 
            label="ADR" 
            value={`₹${Math.round(adr).toLocaleString()}`} 
            subValue="1.2% vs last week" 
            icon={TrendingUp} 
            trend="down"
         />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Revenue Chart */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="font-bold text-slate-800 text-lg">Revenue Analytics</h3>
                  <p className="text-xs text-slate-500">Income breakdown over the last 7 days</p>
                </div>
                <button className="text-xs font-bold text-slate-600 bg-slate-50 hover:bg-slate-100 px-3 py-1.5 rounded border transition-colors">
                   View Report
                </button>
             </div>
             <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                   <AreaChart data={revenueTrendData} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                      <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                      <Tooltip 
                        contentStyle={{backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}
                        itemStyle={{color: '#0f172a', fontWeight: 'bold'}}
                        formatter={(value: number) => [`₹${value.toLocaleString()}`, 'Revenue']}
                      />
                      <Area type="monotone" dataKey="revenue" stroke="#0f172a" strokeWidth={2} fillOpacity={1} fill="url(#colorRev)" />
                   </AreaChart>
                </ResponsiveContainer>
             </div>
          </div>

          {/* Housekeeping Status Donut */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
             <h3 className="font-bold text-slate-800 text-lg mb-2">Room Status</h3>
             <p className="text-xs text-slate-500 mb-4">Current housekeeping status across all floors</p>
             
             <div className="flex-1 relative">
                <ResponsiveContainer width="100%" height="100%">
                   <PieChart>
                      <Pie
                        data={roomStatusData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        stroke="none"
                      >
                        {roomStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                   </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                   <span className="text-3xl font-bold text-slate-800">{rooms.length}</span>
                   <span className="text-xs font-medium text-slate-400 uppercase">Total</span>
                </div>
             </div>
             
             {/* Legend */}
             <div className="flex justify-center gap-4 mt-2">
                {roomStatusData.map((item) => (
                   <div key={item.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs font-bold text-slate-600">{item.name}</span>
                   </div>
                ))}
             </div>
          </div>
      </div>

      {/* Recent Activity List */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
         <div className="p-6 border-b border-slate-100 flex justify-between items-center">
             <h3 className="font-bold text-slate-800 text-lg">Recent Booking Activity</h3>
             <button className="text-sm font-medium text-brand-600 hover:text-brand-800">See All</button>
         </div>
         <div className="overflow-x-auto">
             <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                   <tr>
                      <th className="px-6 py-4">Guest</th>
                      <th className="px-6 py-4">Room Type</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Amount</th>
                      <th className="px-6 py-4 text-right">Time</th>
                   </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                   {recentBookings.map((booking) => (
                      <tr key={booking.id} className="hover:bg-slate-50 transition-colors">
                         <td className="px-6 py-4">
                            <div className="font-bold text-slate-800">{booking.guest?.fullName}</div>
                            <div className="text-xs text-slate-400">ID: {booking.id}</div>
                         </td>
                         <td className="px-6 py-4 text-slate-600">
                            {rooms.find(r => r.id === booking.roomId)?.type || 'Unknown'}
                         </td>
                         <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase
                                ${booking.status === 'CONFIRMED' ? 'bg-emerald-100 text-emerald-700' : 
                                  booking.status === 'CHECKED_IN' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'}
                            `}>
                               {booking.status}
                            </span>
                         </td>
                         <td className="px-6 py-4 text-right font-medium text-slate-800">
                            ₹{booking.totalAmount.toLocaleString()}
                         </td>
                         <td className="px-6 py-4 text-right text-slate-400 flex items-center justify-end gap-1">
                            <Clock size={14}/>
                            {booking.createdAt ? new Date(booking.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : 'Just now'}
                         </td>
                      </tr>
                   ))}
                </tbody>
             </table>
         </div>
      </div>
    </div>
  );
};

export default Dashboard;
