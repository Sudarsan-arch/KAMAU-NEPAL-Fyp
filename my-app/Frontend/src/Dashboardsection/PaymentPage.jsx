import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
    CreditCard, 
    Wallet, 
    ChevronLeft, 
    ShieldCheck, 
    Calendar, 
    Clock, 
    User, 
    Tag,
    CheckCircle,
    ArrowRight,
    Loader2,
    XCircle,
    FileText as FileIcon
} from 'lucide-react';
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import { getBookingById, updatePaymentStatus } from '../bookingService';
import Logo from '../Logo';
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import StripePaymentForm from './StripePaymentForm';

// Stripe Initialization
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

const PaymentPage = () => {
    const { bookingId } = useParams();
    const navigate = useNavigate();
    
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [paymentMethod, setPaymentMethod] = useState('');
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const [error, setError] = useState(null);
    
    // paymentStep helps manage different payment flows
    const [paymentStep, setPaymentStep] = useState('METHOD'); // METHOD, ESEWA_PHONE, ESEWA_OTP, STRIPE
    const [esewaNumber, setEsewaNumber] = useState('');
    const [otp, setOtp] = useState('');
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [otpError, setOtpError] = useState(false);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                setLoading(true);
                const response = await getBookingById(bookingId);
                if (response.success) {
                    setBooking(response.data);
                } else {
                    setError('Booking details not found');
                }
            } catch (err) {
                console.error('Error fetching booking for payment:', err);
                setError('Failed to load booking details for payment');
            } finally {
                setLoading(false);
            }
        };

        if (bookingId) {
            fetchBooking();
        }
    }, [bookingId]);

    const handleEsewaIdentity = (e) => {
        e.preventDefault();
        if (esewaNumber.length !== 10) {
            alert('Please enter a valid 10-digit eSewa ID');
            return;
        }
        setProcessing(true);
        // Simulate sending OTP
        setTimeout(() => {
            const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
            setGeneratedOtp(mockOtp);
            setPaymentStep('ESEWA_OTP');
            setProcessing(false);
            console.log("MOCK OTP SENT:", mockOtp);
            alert(`MOCK SYSTEM: Your eSewa OTP is ${mockOtp}`);
        }, 1500);
    };

    const handleEsewaVerify = async (e) => {
        e.preventDefault();
        if (otp !== generatedOtp) {
            setOtpError(true);
            setTimeout(() => setOtpError(false), 2000);
            return;
        }
        
        await handleFinalizePayment();
    };

    const handleConfirmPayment = async () => {
        if (!paymentMethod) {
            alert('Please select a payment method');
            return;
        }

        if (paymentMethod === 'eSewa') {
            setPaymentStep('ESEWA_PHONE');
        } else if (paymentMethod === 'Card') {
            setPaymentStep('STRIPE');
        } else {
            await handleFinalizePayment();
        }
    };

    const handleFinalizePayment = async () => {
        setProcessing(true);
        try {
            await updatePaymentStatus(bookingId, 'Paid', paymentMethod);
            setPaymentSuccess(true);
            
            // Redirect after delay
            setTimeout(() => {
                navigate('/my-bookings');
            }, 3000);
        } catch (err) {
            console.error('Payment processing error:', err);
            alert('Payment failed: ' + (err.message || 'Please try again later.'));
        } finally {
            setProcessing(false);
        }
    };

    const handleDownloadInvoice = () => {
        if (!booking) return;

        const doc = new jsPDF();
        const transactionId = Math.random().toString(36).substr(2, 9).toUpperCase();
        
        // Header Design
        doc.setFillColor(15, 118, 110); // Kamau Teal
        doc.rect(0, 0, 210, 50, 'F');
        
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(28);
        doc.setFont('helvetica', 'bold');
        doc.text('KAMAU NEPAL', 20, 30);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('OFFICIAL PAYMENT RECEIPT', 20, 40);
        
        doc.setFontSize(8);
        doc.text(`Transaction ID: #${transactionId}`, 150, 30);
        doc.text(`Date: ${new Date().toLocaleString()}`, 150, 35);
        doc.text(`Status: PAID via ${paymentMethod}`, 150, 40);

        // Content
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('Billed To:', 20, 70);
        
        doc.setFontSize(12);
        doc.setFont('helvetica', 'normal');
        doc.text(`${localStorage.getItem('userName') || 'Valued Customer'}`, 20, 80);
        doc.text(`${booking.location}`, 20, 87);

        // Service Details Table
        autoTable(doc, {
            startY: 100,
            head: [['Description', 'Provider', 'Schedule', 'Amount']],
            body: [[
                booking.serviceTitle,
                booking.professionalId ? `${booking.professionalId.firstName} ${booking.professionalId.lastName}` : (booking.serviceProvider || 'Provider'),
                `${new Date(booking.bookingDate).toLocaleDateString()} at ${booking.timeSchedule}`,
                `${booking.totalCost}`
            ]],
            headStyles: { fillColor: [15, 118, 110] },
            theme: 'grid',
            styles: { fontSize: 10, cellPadding: 8 }
        });

        // Totals
        const finalY = doc.lastAutoTable.finalY + 20;
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(14);
        doc.text(`TOTAL AMOUNT PAID: ${booking.totalCost}`, 120, finalY);

        // Footer
        doc.setFontSize(8);
        doc.setFont('helvetica', 'italic');
        doc.setTextColor(148, 163, 184);
        doc.text('Thank you for using Kamau Nepal. For support, contact support@kamaunepal.com', 20, 280);
        
        doc.save(`Invoice_KAMAU_${booking._id.slice(-6).toUpperCase()}.pdf`);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <Loader2 className="w-12 h-12 text-orange-500 animate-spin mb-4" />
                <p className="text-slate-600 font-bold uppercase tracking-widest text-xs">Initializing Secure Gateway...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md text-center">
                    <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
                        <XCircle size={32} />
                    </div>
                    <h2 className="text-2xl font-black text-slate-900 mb-2">Access Denied</h2>
                    <p className="text-slate-500 mb-8 font-medium">{error || "Invalid session token for this transaction."}</p>
                    <button onClick={() => navigate('/my-bookings')} className="w-full py-4 bg-slate-900 text-white rounded-xl font-bold transition hover:bg-slate-800">
                        Return to Bookings
                    </button>
                </div>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center text-green-600 mx-auto mb-8 animate-bounce">
                    <CheckCircle size={48} />
                </div>
                <h2 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter">Transaction Complete!</h2>
                <p className="text-slate-500 font-medium mb-12 max-w-sm mx-auto">
                    Your payment for <span className="text-slate-900 font-bold">{booking.serviceTitle}</span> has been processed successfully.
                </p>
                <div className="inline-flex items-center gap-2 px-6 py-3 bg-green-50 text-green-700 rounded-full text-sm font-black border border-green-100 mb-12">
                    <ShieldCheck size={18} /> Verified Transaction ID: #{Math.random().toString(36).substr(2, 9).toUpperCase()}
                </div>
                
                <div className="flex flex-col sm:flex-row gap-4 mb-12">
                    <button 
                        onClick={handleDownloadInvoice}
                        className="px-10 py-5 bg-slate-900 text-white rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-800 transition-all flex items-center justify-center gap-3 active:scale-95 shadow-2xl"
                    >
                        <FileIcon size={18} /> Download Digital Receipt
                    </button>
                    <button 
                        onClick={() => navigate('/my-bookings')}
                        className="px-10 py-5 bg-white border border-slate-200 text-slate-500 rounded-3xl font-black uppercase tracking-[0.2em] text-[10px] hover:bg-slate-50 transition-all active:scale-95"
                    >
                        Return to Hub
                    </button>
                </div>
                
                <p className="text-slate-400 text-[10px] font-bold uppercase tracking-[0.3em] animate-pulse">Neural Encryption Bridge Active</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Header */}
            <div className="bg-white border-b border-slate-200 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-full transition text-slate-600">
                        <ChevronLeft size={24} />
                    </button>
                    <div className="flex items-center gap-2">
                        <ShieldCheck size={20} className="text-teal-600" />
                        <span className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Secure Checkout</span>
                    </div>
                    <Logo />
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
                    
                    {/* Left: Summary & Details */}
                    <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-700">
                        <div>
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900 mb-2">Order Summary</h1>
                            <p className="text-slate-500 font-medium uppercase tracking-[0.1em] text-[10px]">Reference: #{booking._id.slice(-8).toUpperCase()}</p>
                        </div>

                        {/* Order Card */}
                        <div className="bg-white rounded-[32px] shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden">
                            <div className="p-8 bg-gradient-to-br from-slate-900 to-slate-800 text-white">
                                <span className="px-3 py-1 bg-teal-500/20 text-teal-300 text-[10px] font-black uppercase tracking-widest rounded-lg border border-teal-500/30 mb-4 inline-block">
                                    {booking.status === 'Completed' ? 'Service Completed' : 'Approved Mission'}
                                </span>
                                <h2 className="text-3xl font-black tracking-tight mb-2">{booking.serviceTitle}</h2>
                                <p className="text-slate-400 text-sm font-medium">{booking.location}</p>
                            </div>
                            
                            <div className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600 border border-orange-100">
                                            <Calendar size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Date</p>
                                            <p className="text-sm font-black text-slate-800">{new Date(booking.bookingDate).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                            <Clock size={18} />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time</p>
                                            <p className="text-sm font-black text-slate-800">{booking.timeSchedule}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-6 border-t border-slate-50">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden flex-shrink-0">
                                        {booking.professionalId?.profileImage ? (
                                            <img src={`/${booking.professionalId.profileImage.replace(/\\/g, '/')}`} className="w-full h-full object-cover" alt="Provider" />
                                        ) : <div className="w-full h-full flex items-center justify-center bg-teal-600 text-white font-black"><User size={20} /></div>}
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Service Provider</p>
                                        <p className="text-sm font-black text-slate-800">
                                            {booking.professionalId ? `${booking.professionalId.firstName} ${booking.professionalId.lastName}` : booking.serviceProvider}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="px-8 py-6 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Payable</p>
                                    <div className="flex items-baseline gap-1">
                                        <span className="text-3xl font-black text-slate-900 tracking-tighter">{booking.totalCost}</span>
                                        <span className="text-xs font-bold text-slate-400">NPR</span>
                                    </div>
                                </div>
                                <div className="p-3 bg-white rounded-2xl border border-slate-200">
                                    <Tag className="text-teal-600" />
                                </div>
                            </div>
                        </div>

                        {/* Security Badge */}
                        <div className="bg-teal-50 rounded-2xl p-6 border border-teal-100 flex items-start gap-4">
                            <ShieldCheck className="text-teal-600 shrink-0" size={24} />
                            <div>
                                <h4 className="text-sm font-black text-teal-900 uppercase tracking-tight">Purchase Protection Activated</h4>
                                <p className="text-xs text-teal-700/70 font-medium leading-relaxed mt-1">
                                    Your funds are held securely until the transaction is fully verified by our neural network. Enjoy 100% money-back guarantee on all service missions.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Payment Methods */}
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 border border-slate-200/50 animate-in fade-in slide-in-from-right-4 duration-700">
                        <div className="mb-10 text-center lg:text-left">
                            <h2 className="text-3xl font-black tracking-tighter text-slate-900 mb-2">Checkout</h2>
                            <p className="text-slate-500 font-medium">Choose your primary payment gateway</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
                            {[
                                { id: 'Khalti', name: 'Khalti Wallet', color: 'bg-[#5c2d91]', icon: <Wallet size={20}/> },
                                { id: 'eSewa', name: 'eSewa Digital', color: 'bg-[#60bb46]', icon: <Wallet size={20}/> },
                                { id: 'Card', name: 'Debit / Credit', icon: <CreditCard size={20}/>, color: 'bg-indigo-600' },
                                { id: 'Cash', name: 'Cash Pay', icon: <Wallet size={20}/>, color: 'bg-slate-700' }
                            ].map((method) => (
                                <button
                                    key={method.id}
                                    onClick={() => setPaymentMethod(method.id)}
                                    className={`relative p-6 rounded-3xl border-2 transition-all flex flex-col items-center justify-center gap-4 group
                                        ${paymentMethod === method.id 
                                            ? 'border-orange-500 bg-orange-50 shadow-lg shadow-orange-100 animate-in zoom-in-95 duration-200' 
                                            : 'border-slate-50 bg-slate-50 hover:border-slate-200 hover:bg-white'}
                                    `}
                                >
                                    {method.id === paymentMethod && (
                                        <div className="absolute top-3 right-3 bg-orange-500 text-white rounded-full p-1 leading-none shadow-md">
                                            <CheckCircle size={12} className="fill-white text-orange-500" />
                                        </div>
                                    )}
                                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 ${method.color}`}>
                                        {method.icon}
                                    </div>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${paymentMethod === method.id ? 'text-orange-900' : 'text-slate-500'}`}>{method.name}</span>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-6">
                            {paymentStep === 'METHOD' && (
                                <button
                                    onClick={handleConfirmPayment}
                                    disabled={processing || !paymentMethod}
                                    className="w-full py-5 bg-orange-600 hover:bg-orange-700 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-black rounded-3xl shadow-2xl shadow-orange-200 transition-all flex items-center justify-center gap-3 active:scale-[0.98] group"
                                >
                                    {processing ? (
                                        <Loader2 className="animate-spin w-5 h-5" />
                                    ) : (
                                        <>
                                            Authorize Transaction <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                        </>
                                    )}
                                </button>
                            )}

                            {paymentStep === 'ESEWA_PHONE' && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-2">eSewa ID (Mobile Number)</label>
                                        <input
                                            type="tel"
                                            maxLength={10}
                                            value={esewaNumber}
                                            onChange={(e) => setEsewaNumber(e.target.value.replace(/\D/g, ''))}
                                            placeholder="98XXXXXXXX"
                                            className="w-full px-7 py-5 bg-slate-50 border-none rounded-3xl text-sm font-black focus:ring-4 focus:ring-green-500/10 outline-none transition-all"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setPaymentStep('METHOD')} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Back</button>
                                        <button
                                            onClick={handleEsewaIdentity}
                                            disabled={processing || esewaNumber.length < 10}
                                            className="flex-[2] py-5 bg-[#60bb46] hover:bg-[#52a03c] text-white font-black rounded-3xl shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            {processing ? <Loader2 className="animate-spin w-5 h-5" /> : 'Send OTP'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {paymentStep === 'ESEWA_OTP' && (
                                <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-300">
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center px-2">
                                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Verification OTP</label>
                                            <span className="text-[9px] font-bold text-green-600">Sent to {esewaNumber}</span>
                                        </div>
                                        <input
                                            type="text"
                                            maxLength={6}
                                            value={otp}
                                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                            placeholder="XXXXXX"
                                            className={`w-full px-7 py-5 bg-slate-50 border-none rounded-3xl text-center text-xl tracking-[0.5em] font-black outline-none transition-all ${otpError ? 'ring-4 ring-rose-500/20 text-rose-500' : 'focus:ring-4 focus:ring-green-500/10'}`}
                                            autoFocus
                                        />
                                        {otpError && <p className="text-[9px] text-center font-black text-rose-500 uppercase tracking-widest animate-pulse">Invalid Code. Please try again.</p>}
                                    </div>
                                    <div className="flex gap-4">
                                        <button onClick={() => setPaymentStep('ESEWA_PHONE')} className="flex-1 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all">Edit ID</button>
                                        <button
                                            onClick={handleEsewaVerify}
                                            disabled={processing || otp.length < 6}
                                            className="flex-[2] py-5 bg-[#60bb46] hover:bg-[#52a03c] text-white font-black rounded-3xl shadow-xl shadow-green-100 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            {processing ? <Loader2 className="animate-spin w-5 h-5" /> : 'Verify & Pay'}
                                        </button>
                                    </div>
                                </div>
                            )}

                            {paymentStep === 'STRIPE' && stripePromise && (
                                <Elements 
                                    stripe={stripePromise} 
                                    options={{ 
                                        appearance: { 
                                            theme: 'stripe',
                                            variables: { colorPrimary: '#4f46e5' }
                                        } 
                                    }}
                                >
                                    <StripePaymentForm 
                                        amount={booking.totalCost}
                                        processing={processing}
                                        setProcessing={setProcessing}
                                        onPaymentSuccess={() => handleFinalizePayment()}
                                    />
                                    <button 
                                        onClick={() => setPaymentStep('METHOD')}
                                        className="w-full mt-4 py-2 text-xs font-black text-slate-400 uppercase tracking-widest hover:text-slate-900 transition-all"
                                    >
                                        Back to Methods
                                    </button>
                                </Elements>
                            )}
                            
                            <div className="flex items-center justify-center gap-4 pt-4 border-t border-slate-100">
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/5/5e/Visa_Inc._logo.svg/2560px-Visa_Inc._logo.svg.png" className="h-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" alt="Visa" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/Mastercard-logo.svg/1280px-Mastercard-logo.svg.png" className="h-4 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" alt="Mastercard" />
                                <img src="https://upload.wikimedia.org/wikipedia/commons/thumb/b/b5/PayPal.svg/1200px-PayPal.svg.png" className="h-3 grayscale opacity-40 hover:grayscale-0 hover:opacity-100 transition-all" alt="Paypal" />
                            </div>
                            <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest">Neural Encryption Level: AES-256</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;
