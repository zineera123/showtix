import { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Calendar, CheckCircle, Clock, MapPin, Ticket, Search, Filter, X, Smartphone, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';

const UserDashboard = () => {
  const [bookings, setBookings] = useState([]);
  const [allEvents, setAllEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const [bookingsRes, eventsRes] = await Promise.all([
          axios.get('/api/bookings/mybookings', config),
          axios.get('/api/events')
        ]);
        setBookings(bookingsRes.data);
        // User browse should only show approved events
        setAllEvents(eventsRes.data.filter(ev => ev.status === 'Approved'));
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  if (loading) return (
    <div className="flex justify-center items-center h-[50vh]">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mb-4"></div>
        <p className="text-gray-400 font-bold uppercase tracking-tighter text-[10px]">Retrieving Digital Passes...</p>
      </div>
    </div>
  );

  return (
    <div className="space-y-16 pb-20 animate-in fade-in duration-700">
      {/* My Tickets Section */}
      <section>
        <div className="flex justify-between items-end mb-10 border-b border-gray-100 pb-6">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter flex items-center">
              Personal <span className="text-primary ml-2">Vault</span>
            </h2>
            <p className="text-gray-500 font-medium mt-1 text-sm tracking-tight">Your verified access passes and event history.</p>
          </div>
          {bookings.length > 0 && (
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest mb-1">Active Assets</span>
              <span className="bg-slate-900 text-white px-5 py-2 rounded-2xl text-xs font-black shadow-lg shadow-slate-200">
                {bookings.length} POSSESSIONS
              </span>
            </div>
          )}
        </div>

        {bookings.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200 group">
            <div className="w-24 h-24 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm group-hover:scale-110 transition duration-500">
              <Ticket className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-2xl font-black text-gray-900 tracking-tight">Your vault is currently empty</h3>
            <p className="text-gray-400 font-medium mt-3 max-w-sm mx-auto leading-relaxed">Expand your cultural horizon. Discover and book world-class experiences today.</p>
            <button 
              onClick={() => document.getElementById('explore-shows')?.scrollIntoView({ behavior: 'smooth' })}
              className="mt-10 bg-slate-900 text-white px-10 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-100"
            >
              Enter Marketplace
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {bookings.map((booking) => (
              <div 
                key={booking._id} 
                className="bg-white border-2 border-gray-50 rounded-[32px] p-8 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all duration-500 group cursor-pointer relative overflow-hidden"
                onClick={() => setSelectedTicket(booking)}
              >
                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors"></div>
                
                <div className="flex justify-between items-start mb-8 relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mb-1 flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Digital Ledger Verified
                    </span>
                    <h4 className="font-black text-2xl text-gray-900 group-hover:text-primary transition line-clamp-1 tracking-tighter">{booking.event?.title}</h4>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-8 relative z-10">
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Date</p>
                    <p className="text-xs font-black text-gray-800">{new Date(booking.event?.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100/50">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-1">Slot</p>
                    <p className="text-xs font-black text-gray-800">{booking.event?.time}</p>
                  </div>
                </div>
                
                <div className="flex justify-between items-end relative z-10">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Admissions</span>
                    <div className="flex items-center gap-1.5 mt-1">
                      {[...Array(Math.min(3, booking.seatsBooked))].map((_, i) => (
                        <div key={i} className="h-5 w-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center">
                          <Users className="w-2.5 h-2.5 text-white" />
                        </div>
                      ))}
                      {booking.seatsBooked > 3 && (
                        <span className="text-[10px] font-black text-gray-400">+{booking.seatsBooked - 3}</span>
                      )}
                    </div>
                  </div>
                  <div className="px-5 py-2.5 bg-gray-50 group-hover:bg-primary text-gray-400 group-hover:text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">
                    Reveal Pass
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Ticket Modal */}
      {selectedTicket && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/90 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedTicket(null)}
        >
          <div 
            className="bg-white rounded-[40px] overflow-hidden shadow-2xl max-w-md w-full relative animate-in zoom-in-95 duration-300 pointer-events-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedTicket(null)}
              className="absolute top-6 right-6 p-3 bg-gray-100/50 hover:bg-rose-500 hover:text-white rounded-full transition-all z-[60] backdrop-blur-sm shadow-sm"
              aria-label="Close Ticket"
            >
              <X className="w-5 h-5 font-black" />
            </button>
            
            <div className="bg-slate-900 p-10 text-white relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
              <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em] mb-4 block">Verified Admission Ticket</span>
              <h3 className="text-3xl font-black tracking-tighter leading-tight mb-2">{selectedTicket.event?.title}</h3>
              <div className="flex items-center gap-4 text-gray-400 text-xs font-bold uppercase tracking-widest mt-6">
                <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(selectedTicket.event?.date).toLocaleDateString()}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> {selectedTicket.event?.time}</span>
              </div>
            </div>
            
            <div className="p-10 flex flex-col items-center">
              <div className="bg-white p-6 rounded-[32px] shadow-xl border border-gray-100 mb-10 group relative">
                <div className="absolute inset-x-0 -bottom-4 flex justify-center">
                  <span className="bg-emerald-500 text-white text-[9px] font-black uppercase px-4 py-1.5 rounded-full shadow-lg">Scan Ready</span>
                </div>
                <QRCodeSVG 
                  value={`VERIFY_PASS:${selectedTicket._id}|UID:${user._id}`}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              
              <div className="w-full space-y-5 bg-gray-50 p-8 rounded-[32px] border border-gray-100">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Lead Entity</span>
                  <span className="text-sm font-black text-gray-900">{user.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Allocation</span>
                  <span className="text-sm font-black text-gray-900">{selectedTicket.seatsBooked} Reserved Unit(s)</span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Asset Value</span>
                  <span className="text-xl font-black text-emerald-600">₹{selectedTicket.totalPrice.toLocaleString()}</span>
                </div>
              </div>
              
              <p className="mt-8 text-[9px] text-gray-300 text-center font-black leading-relaxed uppercase tracking-[0.2em] max-w-xs">
                This asset is non-transferable and subject to venue terms. present this digital pass at the security station.
              </p>

              <button
                onClick={() => setSelectedTicket(null)}
                className="mt-10 w-full py-4 bg-slate-100 hover:bg-rose-500 hover:text-white text-slate-500 font-black rounded-2xl transition-all uppercase text-[10px] tracking-widest"
              >
                Close Ticket Pass
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Explore Shows Section */}
      <section id="explore-shows" className="pt-16 border-t border-gray-100">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Marketplace</h2>
            <p className="text-gray-500 font-medium mt-2 text-sm">Discover top-tier experiences currently trending.</p>
          </div>
          <Link to="/" className="group flex items-center gap-3 bg-white border border-gray-200 px-6 py-3 rounded-2xl transition-all hover:border-primary">
            <span className="text-xs font-black text-gray-400 uppercase tracking-widest group-hover:text-primary transition-colors">Global Inventory</span>
            <Search className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {allEvents.slice(0, 4).map((event) => (
            <Link key={event._id} to={`/events/${event._id}`} className="flex flex-col group">
              <div className="relative h-56 rounded-[32px] overflow-hidden mb-5">
                <img 
                  src={event.posterUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2670&auto=format&fit=crop'} 
                  alt={event.title}
                  className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent"></div>
                <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/30 px-3 py-1.5 rounded-xl text-[10px] font-black text-white uppercase tracking-widest">
                  ₹{event.price}
                </div>
              </div>
              <div className="px-2">
                <h3 className="font-black text-gray-900 text-xl tracking-tight leading-tight group-hover:text-primary transition line-clamp-1">{event.title}</h3>
                <div className="flex items-center text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-primary/50" />
                  {new Date(event.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                </div>
              </div>
            </Link>
          ))}
          {allEvents.length === 0 && (
            <div className="col-span-full py-20 text-center bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
               <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Smartphone className="w-6 h-6 text-gray-200" />
              </div>
              <p className="text-gray-400 font-black uppercase tracking-tighter text-xs">No emerging live events found</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default UserDashboard;
