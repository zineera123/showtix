import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Calendar, MapPin, Ticket, Users, Search, Filter } from 'lucide-react';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [filteredEvents, setFilteredEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [visibleCount, setVisibleCount] = useState(8);

  const categories = ['All', 'Music', 'Comedy', 'Workshop', 'Arts', 'Tech', 'Other'];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await axios.get('/api/events');
        // Only show approved events on the home page for users
        const approvedOnly = res.data.filter(ev => ev.status === 'Approved');
        setEvents(approvedOnly);
        setFilteredEvents(approvedOnly);
      } catch (error) {
        console.error('Failed to fetch events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  useEffect(() => {
    let result = events;

    if (searchTerm) {
      result = result.filter(event => 
        event.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.venue?.name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      result = result.filter(event => event.category === selectedCategory);
    }

    setFilteredEvents(result);
  }, [searchTerm, selectedCategory, events]);

  const handleShowMore = () => {
    setVisibleCount(prev => prev + 4);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[60vh]">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mb-4"></div>
          <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Syncing Live Events...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-16 pb-20">
      {/* Hero / Portal Section */}
      <section className="relative py-20 px-8 bg-slate-900 rounded-[40px] shadow-2xl overflow-hidden group">
        {/* Abstract Background Blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] -mr-64 -mt-64 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] -ml-48 -mb-48"></div>
        
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md mb-8 animate-in slide-in-from-top duration-700">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span className="text-[10px] font-black text-white/70 uppercase tracking-[0.2em]">Next-Gen Ticketing Ecosystem</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6 leading-[0.9] max-w-4xl mx-auto">
            Where Artists Meets <span className="text-transparent bg-clip-text bg-gradient-to-r from-rose-400 to-rose-600">The Ultimate Stage.</span>
          </h1>
          
          <p className="text-lg text-gray-400 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
            The only tri-party ecosystem connecting world-class artists, premium venues, and passionate fans in one seamless digital arena.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto mb-20">
            {/* User Card */}
            <Link to="/register?role=User" className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 hover:border-primary/50 hover:bg-white/10 transition-all group/card">
              <div className="bg-primary/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover/card:scale-110 transition duration-500">
                <Ticket className="text-primary w-8 h-8" />
              </div>
              <h3 className="font-black text-white text-xl uppercase tracking-tight">Become a Spectator</h3>
              <p className="text-sm text-gray-400 mt-3 font-medium">Access exclusive tickets to the most anticipated live shows.</p>
            </Link>

            {/* Artist Card */}
            <Link to="/register?role=Artist" className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all group/card">
              <div className="bg-blue-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover/card:scale-110 transition duration-500">
                <Users className="text-blue-400 w-8 h-8" />
              </div>
              <h3 className="font-black text-white text-xl uppercase tracking-tight">Professional Artist</h3>
              <p className="text-sm text-gray-400 mt-3 font-medium">Pitch your performances directly to premium venue networks.</p>
            </Link>

            {/* Admin Card */}
            <Link to="/login?role=Admin" className="bg-white/5 backdrop-blur-xl p-8 rounded-[32px] border border-white/10 hover:border-emerald-500/50 hover:bg-white/10 transition-all group/card">
              <div className="bg-emerald-500/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6 group-hover/card:scale-110 transition duration-500">
                <MapPin className="text-emerald-400 w-8 h-8" />
              </div>
              <h3 className="font-black text-white text-xl uppercase tracking-tight">Venue Governance</h3>
              <p className="text-sm text-gray-400 mt-3 font-medium">Optimize your space utilization with high-integrity booking logic.</p>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative group">
            <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-2xl opacity-0 group-focus-within:opacity-100 transition duration-500"></div>
            <div className="relative">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-primary transition-colors w-6 h-6" />
              <input 
                type="text" 
                placeholder="Find your next core memory..."
                className="w-full pl-16 pr-8 py-6 bg-white/5 backdrop-blur-md rounded-3xl border-2 border-white/10 focus:border-primary focus:bg-white focus:text-gray-900 outline-none transition-all font-bold text-lg text-white placeholder:text-gray-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Events Listing Section */}
      <section className="px-4">
        <div className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-gray-100 pb-10">
          <div>
            <h2 className="text-4xl font-black text-gray-900 tracking-tighter">Live Experiences</h2>
            <p className="text-gray-500 mt-2 font-medium">Curated shows that meet our strict quality standards.</p>
          </div>
          
          <div className="flex flex-wrap gap-3">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                  selectedCategory === cat 
                    ? 'bg-primary text-white shadow-xl shadow-rose-200' 
                    : 'bg-white border border-gray-200 text-gray-400 hover:border-primary hover:text-primary'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center py-32 bg-gray-50 rounded-[40px] border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
              <Calendar className="w-10 h-10 text-gray-200" />
            </div>
            <h3 className="text-3xl font-black text-gray-900 tracking-tight">Stage is currently empty</h3>
            <p className="text-gray-400 mt-3 font-medium max-w-md mx-auto">We couldn't find any events matching your current search parameters. Try broad categories.</p>
            <button 
              onClick={() => { setSearchTerm(''); setSelectedCategory('All'); }}
              className="mt-10 px-8 py-3 bg-gray-900 text-white font-black rounded-2xl hover:scale-105 transition shadow-lg shadow-gray-200 uppercase text-xs tracking-[0.2em]"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
              {filteredEvents.slice(0, visibleCount).map((event) => (
                <Link key={event._id} to={`/events/${event._id}`} className="group relative">
                  <div className="bg-white rounded-[32px] overflow-hidden flex flex-col transition-all duration-500 hover:-translate-y-2">
                    <div className="relative h-80 overflow-hidden">
                      <img
                        src={event.posterUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2670&auto=format&fit=crop'}
                        alt={event.title}
                        className="w-full h-full object-cover transition duration-700 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-transparent to-transparent opacity-60"></div>
                      <div className="absolute top-6 right-6">
                        <span className="bg-white/20 backdrop-blur-md border border-white/30 px-4 py-2 rounded-2xl text-[10px] font-black text-white uppercase tracking-widest">
                          {event.category || 'Event'}
                        </span>
                      </div>
                      
                      <div className="absolute bottom-6 left-6 right-6">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                          <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{event.availableSeats} Remaining</span>
                        </div>
                        <h3 className="text-2xl font-black text-white tracking-tight leading-tight group-hover:text-primary transition duration-300">{event.title}</h3>
                      </div>
                    </div>
                    
                    <div className="p-8 bg-white border-x border-b border-gray-100 rounded-b-[32px] group-hover:border-primary/20 transition-colors">
                      <div className="flex flex-col gap-4 mb-8">
                        <div className="flex items-center text-gray-400 font-bold text-xs uppercase tracking-wider">
                          <Calendar className="w-4 h-4 mr-3 text-primary" />
                          <span>{new Date(event.date).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })} at {event.time}</span>
                        </div>
                        <div className="flex items-center text-gray-400 font-bold text-xs uppercase tracking-wider">
                          <MapPin className="w-4 h-4 mr-3 text-primary" />
                          <span className="line-clamp-1">{event.venue?.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex flex-col">
                          <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Pricing</span>
                          <span className="text-2xl font-black text-gray-900 tracking-tighter">₹{event.price.toLocaleString()}</span>
                        </div>
                        <div className="px-6 py-3 bg-slate-900 group-hover:bg-primary text-white rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-500 shadow-xl shadow-slate-200 group-hover:shadow-rose-200">
                          Book Now
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {visibleCount < filteredEvents.length && (
              <div className="mt-20 text-center">
                <button 
                  onClick={handleShowMore}
                  className="px-12 py-4 bg-white border-2 border-gray-900 text-gray-900 font-black rounded-2xl hover:bg-gray-900 hover:text-white transition-all shadow-lg shadow-gray-100 uppercase text-xs tracking-[0.2em]"
                >
                  Load More Experiences
                </button>
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
};

export default Home;
