import { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Calendar, MapPin, Clock, Users, Tag } from 'lucide-react';

const EventDetails = () => {
  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [seatsToBook, setSeatsToBook] = useState(1);
  const [bookingLoading, setBookingLoading] = useState(false);
  
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const fetchEvent = async () => {
    try {
      const config = user ? { headers: { Authorization: `Bearer ${user.token}` } } : {};
      const res = await axios.get(`/api/events/${id}`, config);
      setEvent(res.data);
    } catch (error) {
      toast.error('Failed to load latest event data');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id, user, navigate]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleBookTickets = async () => {
    if (!user) {
      toast.error('Please login to book tickets');
      navigate(`/login?role=User`);
      return;
    }

    if (user.role !== 'User') {
      toast.error('Only Ticket Buyers can book tickets!');
      return;
    }

    if (seatsToBook > event.availableSeats) {
       toast.error('Not enough seats remaining');
       return;
    }

    setBookingLoading(true);

    try {
      const res = await loadRazorpay();
      if (!res) {
        toast.error('Razorpay SDK failed to load. Are you online?');
        setBookingLoading(false);
        return;
      }

      // 1. Create Order on Backend
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data: orderData } = await axios.post(
        '/api/bookings/order',
        { eventId: event._id, seatsBooked: seatsToBook },
        config
      );

      // 2. Open Razorpay Checkout Modal
      const options = {
        key: orderData.key,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'ShowTix Ecosystem',
        description: `Booking for ${orderData.event.title}`,
        order_id: orderData.orderId,
        handler: async (response) => {
          try {
            // 3. Verify Payment on Backend
            const { data: verifyData } = await axios.post(
              '/api/bookings/verify',
              {
                ...response,
                eventId: event._id,
                seatsBooked: seatsToBook
              },
              config
            );

            toast.success('Payment Verified! Booking Confirmed.');
            await fetchEvent();
            setSeatsToBook(1);
            setTimeout(() => navigate('/dashboard'), 1500);

          } catch (err) {
            toast.error(err.response?.data?.message || 'Verification Failed');
            fetchEvent();
          }
        },
        prefill: {
          name: user.name,
          email: user.email,
        },
        theme: {
          color: '#e11d48',
        },
        modal: {
          ondismiss: () => {
            setBookingLoading(false);
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.on('payment.failed', function (response) {
        toast.error('Payment Failed: ' + response.error.description);
        setBookingLoading(false);
      });
      rzp1.open();

    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to initialize checkout');
      if (error.response?.status === 400) fetchEvent();
      setBookingLoading(false);
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  );

  if (!event) return null;

  return (
    <div className="max-w-6xl mx-auto py-8">
      <div className="bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row">
        {/* Left Side: Poster */}
        <div className="md:w-1/2 relative h-96 md:h-auto">
          <img
            src={event.posterUrl || 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=2670&auto=format&fit=crop'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent flex items-end">
            <div className="p-8 text-white w-full">
              <span className="bg-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm mb-4 inline-block">
                Live Concert
              </span>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 leading-tight drop-shadow-lg">{event.title}</h1>
              <p className="text-lg text-gray-200 font-medium drop-shadow-md">By {event.artist?.name || 'Unknown Artist'}</p>
            </div>
          </div>
        </div>

        {/* Right Side: Details & Booking */}
        <div className="md:w-1/2 p-8 md:p-12 flex flex-col justify-between bg-gray-50/50">
          <div>
            <div className="mb-8 p-6 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Ticket Price</p>
                <div className="text-3xl font-extrabold text-gray-900">₹{event.price}</div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-500 font-semibold uppercase tracking-wider">Availability</p>
                <div className="text-lg font-bold text-green-600 flex items-center justify-end">
                  <Users className="w-5 h-5 mr-1" />
                  {event.availableSeats} seats left
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">Event Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="flex items-start">
                <Calendar className="w-6 h-6 text-primary mt-1 mr-4" />
                <div>
                  <p className="font-semibold text-gray-900">Date</p>
                  <p className="text-gray-600">{new Date(event.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <Clock className="w-6 h-6 text-primary mt-1 mr-4" />
                <div>
                  <p className="font-semibold text-gray-900">Time</p>
                  <p className="text-gray-600">{event.time}</p>
                </div>
              </div>
              
              <div className="flex items-start md:col-span-2">
                <MapPin className="w-6 h-6 text-primary mt-1 mr-4 shrink-0" />
                <div>
                  <p className="font-semibold text-gray-900">Venue</p>
                  <p className="text-gray-600">{event.venue?.name}, {event.venue?.location}</p>
                  <p className="text-gray-500 text-sm mt-1">{event.venue?.description}</p>
                </div>
              </div>
            </div>

            <h3 className="text-xl font-bold text-gray-800 mb-4 border-b pb-2">About The Show</h3>
            <p className="text-gray-600 leading-relaxed mb-8">
              {event.description}
            </p>
          </div>

          {/* Booking Section */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mt-auto">
            {!user || user.role === 'User' ? (
              <>
                <div className="flex items-center space-x-4 mb-6">
                  <span className="text-gray-700 font-semibold">Select Tickets:</span>
                  <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden">
                    <button 
                      onClick={() => setSeatsToBook(Math.max(1, seatsToBook - 1))}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-200 font-bold transition text-gray-600"
                    >
                      -
                    </button>
                    <span className="px-6 py-2 font-bold text-lg border-x">{seatsToBook}</span>
                    <button 
                      onClick={() => setSeatsToBook(Math.min(event.availableSeats, seatsToBook + 1))}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-200 font-bold transition text-gray-600"
                      disabled={seatsToBook >= event.availableSeats}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-6">
                  <span className="text-gray-500 font-medium">Subtotal</span>
                  <span className="text-2xl font-bold text-gray-900">₹{seatsToBook * event.price}</span>
                </div>

                <button
                  onClick={handleBookTickets}
                  disabled={bookingLoading || event.availableSeats === 0}
                  className={`w-full py-4 text-lg rounded-xl text-white font-bold flex justify-center items-center transition-all ${
                    bookingLoading || event.availableSeats === 0
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-primary hover:bg-rose-600 shadow-xl shadow-rose-200 hover:shadow-2xl hover:shadow-rose-300 hover:-translate-y-1'
                  }`}
                >
                  <Tag className="w-5 h-5 mr-2" />
                  {event.availableSeats === 0 
                    ? 'Sold Out' 
                    : bookingLoading 
                      ? 'Processing Payment...' 
                      : 'Book Now (Secure Checkout)'}
                </button>
              </>
            ) : (
              <div className="text-center p-4 bg-gray-50 rounded-lg text-gray-600 italic">
                You are viewing this event as an {user.role}. Booking is restricted to Users.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
