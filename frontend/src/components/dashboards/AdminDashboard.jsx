import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import {
  Users as UsersIcon, Ticket, BarChart3, Building2,
  CheckCircle, XCircle, PlusCircle, Trash2, Pencil,
  CalendarDays, TrendingUp, DollarSign, UserCheck, ShieldCheck, MapPin
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Legend
} from 'recharts';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState('overview');

  const [stats, setStats] = useState({ 
    totalRevenue: 0, 
    totalBookings: 0, 
    totalUsers: 0, 
    totalEvents: 0,
    approvalRate: 0,
    venueUtilization: 0,
    repeatCustomerRate: 0,
    recentRevenue: []
  });
  
  const [events, setEvents] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [venues, setVenues] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  const [showVenueForm, setShowVenueForm] = useState(false);
  const [editVenue, setEditVenue] = useState(null);
  const [venueForm, setVenueForm] = useState({ name: '', location: '', capacity: '', description: '' });

  const [rejectModal, setRejectModal] = useState({ show: false, eventId: null, reason: '' });

  const config = { headers: { Authorization: `Bearer ${user.token}` } };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [eventsRes, bookingsRes, venuesRes, usersRes, statsRes] = await Promise.all([
        axios.get('/api/events/admin/allevents', config),
        axios.get('/api/bookings', config),
        axios.get('/api/venues', config),
        axios.get('/api/admin/users', config),
        axios.get('/api/admin/stats', config)
      ]);

      setEvents(eventsRes.data);
      setBookings(bookingsRes.data);
      setVenues(venuesRes.data);
      setAllUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error('Failed to load admin data', err);
      toast.error('Session expired or unauthorized');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (id) => {
    try {
      await axios.put(`/api/events/${id}/status`, { status: 'Approved' }, config);
      toast.success('Event approved successfully');
      fetchData();
    } catch (err) { 
      toast.error(err.response?.data?.message || 'Failed to approve'); 
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    try {
      await axios.put(`/api/events/${rejectModal.eventId}/status`, { 
        status: 'Rejected', 
        reason: rejectModal.reason 
      }, config);
      toast.success('Event rejected with feedback');
      setRejectModal({ show: false, eventId: null, reason: '' });
      fetchData();
    } catch { 
      toast.error('Failed to reject event'); 
    }
  };

  const toggleUserBlock = async (userId) => {
    try {
      const res = await axios.put(`/api/admin/users/${userId}/block`, {}, config);
      toast.success(res.data.message);
      fetchData();
    } catch {
      toast.error('Failed to update user status');
    }
  };

  const handleVenueSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editVenue) {
        await axios.put(`/api/venues/${editVenue._id}`, venueForm, config);
        toast.success('Venue updated!');
      } else {
        await axios.post('/api/venues', venueForm, config);
        toast.success('Venue created!');
      }
      setShowVenueForm(false);
      setEditVenue(null);
      setVenueForm({ name: '', location: '', capacity: '', description: '' });
      fetchData();
    } catch { toast.error('Failed to save venue'); }
  };

  const handleDeleteVenue = async (id) => {
    if (!window.confirm('Delete this venue?')) return;
    try {
      await axios.delete(`/api/venues/${id}`, config);
      toast.success('Venue deleted!');
      fetchData();
    } catch { toast.error('Failed to delete'); }
  };

  const openEditVenue = (venue) => {
    setEditVenue(venue);
    setVenueForm({ name: venue.name, location: venue.location, capacity: venue.capacity, description: venue.description || '' });
    setShowVenueForm(true);
  };

  const filteredUsers = allUsers.filter(u => {
    const matchesSearch = u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase());
    const matchesRole = roleFilter === 'All' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const statCards = [
    { label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <DollarSign />, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Total Sales', value: stats.totalBookings, icon: <Ticket />, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Active Events', value: stats.totalEvents, icon: <CalendarDays />, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Global Users', value: stats.totalUsers, icon: <UsersIcon />, color: 'text-orange-600', bg: 'bg-orange-50' },
  ];

  const tabs = [
    { id: 'overview', label: 'Overview', icon: <BarChart3 className="w-4 h-4" /> },
    { id: 'events', label: 'Event Requests', icon: <CalendarDays className="w-4 h-4" /> },
    { id: 'users', label: 'User Management', icon: <UsersIcon className="w-4 h-4" /> },
    { id: 'venues', label: 'Venues', icon: <Building2 className="w-4 h-4" /> },
    { id: 'bookings', label: 'Full Ledger', icon: <Ticket className="w-4 h-4" /> },
  ];

  if (loading) return (
    <div className="flex justify-center items-center h-[60vh]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-500 font-medium">Loading production data...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-6 max-w-[1600px] mx-auto pb-12">
      {/* Tab Navigation */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 flex flex-wrap gap-2 sticky top-[72px] z-20 backdrop-blur-md bg-white/90">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-primary text-white shadow-md'
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map(card => (
              <div key={card.label} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition">
                <div className={`p-3 rounded-xl ${card.bg} ${card.color}`}>
                  {card.icon}
                </div>
                <div>
                  <p className="text-sm text-gray-500 font-medium">{card.label}</p>
                  <p className="text-2xl font-extrabold text-gray-900">{card.value}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Chart */}
            <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <h3 className="text-lg font-bold text-gray-800 mb-6 flex justify-between items-center">
                <span>Revenue Performance</span>
                <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                  <TrendingUp className="w-3 h-3" /> Live Updates
                </div>
              </h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.recentRevenue.length > 0 ? stats.recentRevenue.map(it => ({ 
                    name: new Date(it.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), 
                    value: it.amount 
                  })) : []}>
                    <defs>
                      <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#e11d48" stopOpacity={0.1}/>
                        <stop offset="95%" stopColor="#e11d48" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                    <YAxis axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#9ca3af'}} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ fontWeight: 'bold' }}
                    />
                    <Area type="monotone" dataKey="value" stroke="#e11d48" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Platform Metrics */}
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
              <h3 className="text-lg font-bold text-gray-800 mb-6">Real-world Integrity</h3>
              <div className="space-y-6">
                {[
                  { label: 'Approval Rate', val: `${Math.round(stats.approvalRate)}%`, color: 'bg-emerald-500' },
                  { label: 'Venue Utilization', val: `${Math.round(stats.venueUtilization)}%`, color: 'bg-blue-500' },
                  { label: 'Repeat Customers', val: `${Math.round(stats.repeatCustomerRate)}%`, color: 'bg-purple-500' },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-500 font-semibold">{item.label}</span>
                      <span className="font-bold text-gray-900">{item.val}</span>
                    </div>
                    <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div className={`${item.color} h-full rounded-full transition-all duration-1000`} style={{ width: item.val }}></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-8 p-5 bg-primary/5 rounded-2xl border border-primary/10">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                  <div>
                    <p className="text-xs font-bold text-primary uppercase mb-1">Security Status</p>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">All sessions are JWT encrypted. Venue slot blocking is enforced at the DB level.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Events Approval Tab */}
      {activeTab === 'events' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-lg font-bold text-gray-800">Operational Requests</h3>
              <p className="text-sm text-gray-500">Pending events from artists that require venue verification</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/50">
                <tr>
                  {['Event', 'Artist', 'Venue', 'Date Slot', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {events.map(event => (
                  <tr key={event._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-xl bg-gray-100 overflow-hidden border border-gray-200 flex-shrink-0 shadow-sm">
                          {event.posterUrl
                            ? <img src={event.posterUrl} className="h-full w-full object-cover" alt="" />
                            : <div className="h-full w-full flex items-center justify-center text-[10px] text-gray-400 font-bold uppercase p-1 text-center leading-tight">No<br/>Poster</div>
                          }
                        </div>
                        <div>
                          <p className="font-bold text-gray-900">{event.title}</p>
                          <p className="text-xs text-gray-500 font-medium">Category: {event.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-600 font-semibold">{event.artist?.name}</td>
                    <td className="px-8 py-5 text-gray-500 font-medium">{event.venue?.name}</td>
                    <td className="px-8 py-5">
                      <p className="text-gray-900 font-bold">{new Date(event.date).toLocaleDateString()}</p>
                      <p className="text-xs text-gray-400">{event.time}</p>
                    </td>
                    <td className="px-8 py-5">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold tracking-tight ${
                        event.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' :
                        event.status === 'Rejected' ? 'bg-rose-100 text-rose-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>{event.status.toUpperCase()}</span>
                    </td>
                    <td className="px-8 py-5">
                      {event.status === 'Pending' && (
                        <div className="flex gap-2">
                          <button onClick={() => handleApprove(event._id)} className="flex items-center gap-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl hover:bg-emerald-600 hover:text-white font-bold text-xs transition-all shadow-sm">
                            <CheckCircle className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button onClick={() => setRejectModal({ show: true, eventId: event._id, reason: '' })} className="flex items-center gap-1 px-4 py-2 bg-rose-50 text-rose-700 rounded-xl hover:bg-rose-600 hover:text-white font-bold text-xs transition-all shadow-sm">
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      )}
                      {event.status !== 'Pending' && <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Historical Record</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="px-8 py-6 border-b border-gray-100 space-y-4 bg-gray-50/50">
            <h3 className="text-lg font-bold text-gray-800">Platform Participants</h3>
            <div className="flex flex-col md:flex-row gap-4">
              <input 
                type="text" 
                placeholder="Search name or email..." 
                className="flex-grow px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary outline-none font-medium shadow-sm"
                value={userSearch}
                onChange={e => setUserSearch(e.target.value)}
              />
              <select 
                className="px-4 py-2.5 bg-white border border-gray-100 rounded-xl font-bold text-gray-600 shadow-sm"
                value={roleFilter}
                onChange={e => setRoleFilter(e.target.value)}
              >
                <option value="All">All Roles</option>
                <option value="User">User</option>
                <option value="Artist">Artist</option>
                <option value="Admin">Admin</option>
              </select>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50/30">
                <tr>
                  {['Participant', 'Details', 'Privileges', 'Created', 'Security'].map(h => (
                    <th key={h} className="px-8 py-4 text-left text-xs font-bold text-gray-400 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredUsers.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`h-10 w-10 rounded-full flex items-center justify-center font-extrabold text-sm border-2 ${u.isBlocked ? 'bg-gray-100 text-gray-400 border-gray-200' : 'bg-primary/10 text-primary border-primary/20'}`}>
                          {u.name.charAt(0)}
                        </div>
                        <span className={`font-bold ${u.isBlocked ? 'text-gray-400' : 'text-gray-900'}`}>{u.name} {u.isBlocked && '(Blocked)'}</span>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-gray-500 font-medium text-sm">{u.email}</td>
                    <td className="px-8 py-5">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-widest ${
                        u.role === 'Admin' ? 'bg-slate-900 text-white shadow-sm' :
                        u.role === 'Artist' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-600'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-gray-400 text-sm font-medium">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-8 py-5">
                      {u.role !== 'Admin' ? (
                        <button 
                          onClick={() => toggleUserBlock(u._id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all ${
                            u.isBlocked 
                            ? 'bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white' 
                            : 'bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white'
                          }`}
                        >
                          {u.isBlocked ? 'UNBLOCK ACCOUNT' : 'SUSPEND ACCESS'}
                        </button>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-300 italic">Self Proteced</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Venues Tab */}
      {activeTab === 'venues' && (
        <div className="space-y-6 animate-in slide-in-from-right-4 duration-500 overflow-visible">
          <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Physical Venues</h3>
              <p className="text-sm text-gray-500">Manage seating constraints and location distribution</p>
            </div>
            <button
              onClick={() => { setShowVenueForm(!showVenueForm); setEditVenue(null); setVenueForm({ name: '', location: '', capacity: '', description: '' }); }}
              className="px-6 py-2.5 bg-primary text-white rounded-xl font-bold flex items-center gap-2 hover:bg-rose-600 transition shadow-lg shadow-rose-200"
            >
              <PlusCircle className="w-5 h-5" /> {showVenueForm ? 'Cancel Operation' : 'Register New Venue'}
            </button>
          </div>

          {showVenueForm && (
            <div className="bg-white p-8 rounded-2xl border-2 border-primary/10 shadow-xl animate-in zoom-in-95 duration-200">
              <h4 className="font-extrabold text-gray-900 mb-6 flex items-center gap-2">
                <PlusCircle className="text-primary w-5 h-5" /> {editVenue ? 'Update Institutional Space' : 'New Strategic Location Registration'}
              </h4>
              <form onSubmit={handleVenueSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Primary Listing Name</label>
                  <input value={venueForm.name} onChange={e => setVenueForm({...venueForm, name: e.target.value})} required className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl outline-none font-bold text-gray-700 transition" placeholder="Golden Jubilee Hall" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Geo-Location / Cluster</label>
                  <input value={venueForm.location} onChange={e => setVenueForm({...venueForm, location: e.target.value})} required className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl outline-none font-bold text-gray-700 transition" placeholder="South Campus, Block A" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Certified Capacity</label>
                  <input type="number" value={venueForm.capacity} onChange={e => setVenueForm({...venueForm, capacity: e.target.value})} required className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl outline-none font-bold text-gray-700 transition" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Logistical Description</label>
                  <input value={venueForm.description} onChange={e => setVenueForm({...venueForm, description: e.target.value})} className="w-full px-5 py-3 bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white rounded-xl outline-none font-bold text-gray-700 transition" placeholder="Tech-enabled, central cooling..." />
                </div>
                <div className="md:col-span-2 flex justify-end gap-3 mt-4 pt-6 border-t border-gray-50">
                  <button type="submit" className="px-12 py-3 bg-slate-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-md">
                    {editVenue ? 'Save Modifications' : 'Finalize Registration'}
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {venues.map(v => (
              <div key={v._id} className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:shadow-lg hover:border-primary/20 transition group">
                <div className="flex items-start justify-between mb-5">
                  <div className="p-3.5 bg-primary/5 rounded-2xl group-hover:bg-primary transition-all duration-300">
                    <Building2 className="w-7 h-7 text-primary group-hover:text-white" />
                  </div>
                  <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => openEditVenue(v)} className="p-2.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => handleDeleteVenue(v._id)} className="p-2.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h4 className="font-extrabold text-gray-900 text-[19px] leading-tight mb-1">{v.name}</h4>
                <p className="text-sm text-gray-400 font-bold mb-5 flex items-center gap-1"><MapPin className="w-3 h-3" /> {v.location}</p>
                <div className="flex items-center gap-2 py-2 px-4 bg-gray-50 rounded-xl w-fit border border-gray-100">
                  <span className="text-[11px] font-extrabold text-gray-400 uppercase tracking-tighter">Capacity</span>
                  <span className="text-sm font-black text-gray-700">{v.capacity.toLocaleString()}</span>
                </div>
                {v.description && <p className="text-xs text-gray-500 mt-5 font-medium leading-relaxed italic line-clamp-2 border-l-2 border-primary/10 pl-3">{v.description}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Bookings Tab */}
      {activeTab === 'bookings' && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden animate-in fade-in duration-500">
          <div className="px-8 py-7 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div>
              <h3 className="text-xl font-bold text-gray-800">Operational Ledger</h3>
              <p className="text-sm text-gray-400 font-medium">Verified completed transactions across the platform</p>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest bg-emerald-50 px-3 py-1 rounded-full mb-1">Authenticated Volume</span>
              <span className="text-2xl font-black text-gray-900">₹{stats.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-white">
                <tr>
                  {['Customer Entity', 'Core Event', 'Venue', 'Tickets', 'Investment', 'Timestamp'].map(h => (
                    <th key={h} className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.1em]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {bookings.map(b => (
                  <tr key={b._id} className="hover:bg-gray-50/50 transition">
                    <td className="px-8 py-5">
                      <div className="font-bold text-gray-900">{b.user?.name || 'Archived Identity'}</div>
                      <div className="text-[10px] text-gray-400 font-extrabold tracking-tight uppercase">{b.user?.email}</div>
                    </td>
                    <td className="px-8 py-5 text-gray-700 font-bold">{b.event?.title || 'Expunged Event'}</td>
                    <td className="px-8 py-5 text-gray-400 text-xs font-bold leading-tight">{b.event?.venue?.name || 'TBD'}</td>
                    <td className="px-8 py-5">
                      <div className="h-9 w-9 bg-gray-100 rounded-lg flex items-center justify-center font-black text-gray-800 text-sm">
                        {b.seatsBooked}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <p className="text-emerald-600 font-black text-sm">₹{b.totalPrice.toLocaleString()}</p>
                      <span className="text-[9px] font-bold text-gray-300 uppercase">Paid - Completed</span>
                    </td>
                    <td className="px-8 py-5 text-gray-400 text-[11px] font-bold font-mono uppercase italic border-r-2 border-transparent hover:border-primary transition-all">
                      {new Date(b.createdAt).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {rejectModal.show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-in zoom-in-95 duration-200">
            <h3 className="text-2xl font-black text-gray-900 mb-2">Denial Protocol</h3>
            <p className="text-sm text-gray-500 mb-6 font-medium">Please provide a legitimate reason for rejecting this artist's request. This will be sent as formal feedback.</p>
            <form onSubmit={handleReject}>
              <textarea 
                required
                className="w-full h-32 px-5 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-200 focus:bg-white rounded-2xl outline-none font-bold text-gray-700 transition resize-none mb-6"
                placeholder="E.g. Technical limitations, scheduling clash, or incomplete documentation..."
                value={rejectModal.reason}
                onChange={e => setRejectModal({...rejectModal, reason: e.target.value})}
              ></textarea>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  type="button" 
                  onClick={() => setRejectModal({ show: false, eventId: null, reason: '' })}
                  className="py-3.5 bg-gray-100 text-gray-600 font-bold rounded-xl hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="py-3.5 bg-rose-600 text-white font-bold rounded-xl hover:bg-rose-700 transition shadow-lg shadow-rose-200"
                >
                  Confirm Rejection
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
