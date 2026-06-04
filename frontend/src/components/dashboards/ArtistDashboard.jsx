import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { PlusCircle, Clock, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react';

const ArtistDashboard = () => {
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  const { user } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    venue: '',
    date: '',
    time: '',
    price: '',
    availableSeats: '',
    category: 'Music',
    poster: null,
  });

  const [editEventId, setEditEventId] = useState(null);

  const fetchEvents = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const [eventsRes, venuesRes] = await Promise.all([
        axios.get('/api/events/artist/myevents', config),
        axios.get('/api/venues', config),
      ]);
      setEvents(eventsRes.data);
      setVenues(venuesRes.data);
    } catch (error) {
      console.error('Error fetching artist data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, [user]);

  const handleInputChange = (e) => {
    if (e.target.name === 'poster') {
      setFormData({ ...formData, poster: e.target.files[0] });
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleEdit = (event) => {
    setEditEventId(event._id);
    setFormData({
      title: event.title,
      description: event.description || '',
      venue: event.venue?._id || '',
      date: event.date.split('T')[0],
      time: event.time,
      price: event.price,
      availableSeats: event.availableSeats,
      category: event.category || 'Music',
      poster: null,
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const config = {
      headers: {
        Authorization: `Bearer ${user.token}`,
        'Content-Type': 'multipart/form-data',
      },
    };

    const submitData = new FormData();
    Object.keys(formData).forEach((key) => {
      if (key === 'poster' && !formData[key]) return;
      submitData.append(key, formData[key]);
    });

    try {
      if (editEventId) {
        await axios.put(`/api/events/${editEventId}`, submitData, config);
        toast.success('Proposal updated successfully!');
      } else {
        await axios.post('/api/events', submitData, config);
        toast.success('Event request submitted!');
      }
      
      setShowForm(false);
      setEditEventId(null);
      fetchEvents();
      setFormData({
        title: '', description: '', venue: '', date: '', time: '', price: '', availableSeats: '', poster: null, category: 'Music'
      });
    } catch (error) {
      toast.error(error.response?.data?.message || 'Transaction failed');
    }
  };

  const getStatusBadge = (status, reason) => {
    switch (status) {
      case 'Approved': 
        return <span className="flex items-center text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-xl"><CheckCircle className="w-4 h-4 mr-1.5" /> Approved</span>;
      case 'Rejected': 
        return (
          <div className="flex flex-col gap-1">
            <span className="flex items-center text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-xl w-fit"><XCircle className="w-4 h-4 mr-1.5" /> Rejected</span>
            {reason && <p className="text-[10px] text-red-500 font-medium max-w-[150px] leading-tight mt-1 animate-pulse">Feedback: {reason}</p>}
          </div>
        );
      default: 
        return <span className="flex items-center text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1.5 rounded-xl"><Clock className="w-4 h-4 mr-1.5" /> Pending Review</span>;
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to withdraw this event request?')) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`/api/events/${id}`, config);
      toast.success('Event request removed');
      fetchEvents();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete event');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      {/* Header Actions */}
      <div className="flex justify-between items-center bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Performance Desk</h2>
          <p className="text-gray-500 font-medium mt-1">Submit and monitor your live event proposals.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className={`flex items-center px-6 py-3 rounded-2xl font-bold transition-all ${
            showForm 
              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
              : 'bg-primary text-white shadow-lg shadow-rose-200 hover:bg-rose-600'
          }`}
        >
          <PlusCircle className="w-5 h-5 mr-2" />
          {showForm ? 'Discard Draft' : 'New Event Request'}
        </button>
      </div>

      {/* Event Request Form */}
      {showForm && (
        <div className="bg-white p-8 rounded-3xl shadow-xl border border-primary/10 animate-in slide-in-from-top-4 duration-300">
          <h3 className="text-xl font-bold text-gray-900 mb-8 flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-black">?</span>
            Submission Protocol
          </h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8" encType="multipart/form-data">
            
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Title</label>
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-gray-800 transition" placeholder="E.g. Summer Rock Fest 2026" />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Detailed Narrative</label>
              <textarea name="description" value={formData.description} onChange={handleInputChange} required rows="3" className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-gray-800 transition resize-none"></textarea>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Target Venue</label>
              <select name="venue" value={formData.venue} onChange={handleInputChange} required className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-gray-700 transition">
                <option value="">Select a location...</option>
                {venues.map((v) => (
                  <option key={v._id} value={v._id}>{v.name} (Max {v.capacity} pax)</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Ticketing Capacity</label>
              <input type="number" name="availableSeats" value={formData.availableSeats} onChange={handleInputChange} required className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-gray-800 transition" placeholder="e.g. 50" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Event Date</label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-gray-800 transition" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Preferred Slot</label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange} required className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-gray-800 transition" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Base Ticket Price (₹)</label>
              <input type="number" name="price" value={formData.price} onChange={handleInputChange} required className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-emerald-600 transition" />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Genre Optimization</label>
              <select name="category" value={formData.category} onChange={handleInputChange} required className="w-full px-5 py-3.5 rounded-2xl bg-gray-50 border-2 border-transparent focus:border-primary/20 focus:bg-white outline-none font-bold text-gray-700 transition">
                <option value="Music">Music</option>
                <option value="Comedy">Comedy</option>
                <option value="Workshop">Workshop</option>
                <option value="Arts">Arts</option>
                <option value="Tech">Tech</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Promotional Media</label>
              <div className="flex items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-100 border-dashed rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <PlusCircle className="w-8 h-8 text-gray-300 mb-2" />
                    <p className="text-sm text-gray-500 font-bold">{formData.poster ? formData.poster.name : 'Click to upload event poster'}</p>
                  </div>
                  <input type="file" name="poster" onChange={handleInputChange} accept="image/*" className="hidden" />
                </label>
              </div>
            </div>

            <div className="md:col-span-2 pt-8 border-t border-gray-50 flex justify-end">
              <button type="submit" className="w-full md:w-auto px-12 py-4 bg-primary text-white font-black rounded-2xl shadow-xl shadow-rose-200 hover:scale-105 active:scale-95 transition-all">Submit Protocol</button>
            </div>
          </form>
        </div>
      )}

      {/* Events List */}
      <div className="bg-white rounded-[32px] shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Listing Identity</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Logistics</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Timeline</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Governance</th>
                <th className="px-8 py-5 text-left text-[11px] font-black text-gray-400 uppercase tracking-[0.2em]">Control</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {events.map((event) => (
                <tr key={event._id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="flex items-center gap-4">
                      {event.posterUrl ? (
                        <div className="h-14 w-14 rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 shadow-sm flex-shrink-0">
                          <img src={event.posterUrl} alt="" className="h-full w-full object-cover" />
                        </div>
                      ) : (
                        <div className="h-14 w-14 rounded-2xl bg-gray-100 border-2 border-dashed border-gray-200 flex-shrink-0"></div>
                      )}
                      <div>
                        <div className="font-black text-gray-900 leading-tight">{event.title}</div>
                        <div className="text-xs text-emerald-600 font-black mt-0.5 uppercase tracking-tighter">Value: ₹{event.price}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    <div className="font-bold text-gray-800 text-sm">{event.venue?.name}</div>
                    <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">{event.availableSeats} Seats Allocated</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap font-bold text-gray-500 text-sm italic">
                    <div>{new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</div>
                    <div className="text-[10px] text-gray-300 uppercase tracking-widest">{event.time}</div>
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    {getStatusBadge(event.status, event.statusReason)}
                  </td>
                  <td className="px-8 py-6 whitespace-nowrap">
                    {event.status !== 'Approved' ? (
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleEdit(event)}
                          className="p-3 text-gray-300 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                          title="Edit Proposal"
                        >
                          <Pencil className="w-5 h-5" />
                        </button>
                        <button 
                          onClick={() => handleDelete(event._id)}
                          className="p-3 text-gray-300 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
                          title="Withdraw Proposal"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-black text-emerald-500 uppercase flex items-center gap-1">
                        <CheckCircle className="w-3 h-3" /> Locked
                      </span>
                    )}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td colSpan="5" className="px-8 py-20 text-center">
                    <div className="max-w-xs mx-auto">
                      <div className="w-16 h-16 bg-gray-50 rounded-3xl flex items-center justify-center mx-auto mb-4">
                        <PlusCircle className="w-8 h-8 text-gray-200" />
                      </div>
                      <p className="text-gray-900 font-bold text-lg leading-tight">No Active Proposals</p>
                      <p className="text-gray-400 text-sm font-medium mt-2">Initialize your first professional event request using the button above.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ArtistDashboard;
