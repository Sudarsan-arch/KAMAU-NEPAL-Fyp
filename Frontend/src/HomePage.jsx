import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Menu, X, Search, Star, MapPin, CheckCircle2, 
  MoreHorizontal, Twitter, Linkedin, Github, 
  Heart, Zap, ShieldCheck, ArrowRight, Briefcase, UserCircle 
} from 'lucide-react';
import Logo from './Logo';

// --- Internal Helper: Button ---
const Button = ({ 
  children, variant = 'primary', size = 'md', className = '', ...props 
}) => {
  const baseStyles = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl';
  const variants = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600 focus:ring-orange-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
    secondary: 'bg-teal-600 text-white hover:bg-teal-700 focus:ring-teal-500 shadow-md hover:shadow-lg transform hover:-translate-y-0.5',
    outline: 'border-2 border-slate-200 bg-transparent text-slate-700 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-400',
    ghost: 'bg-transparent text-teal-700 hover:bg-teal-50 focus:ring-teal-200',
    danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500 shadow-md'
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-8 py-3.5 text-lg',
    icon: 'p-2'
  };
  return (
    <button className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`} {...props}>
      {children}
    </button>
  );
};

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const userName = localStorage.getItem('userName') || 'Professional User';
  const userProfileImage = localStorage.getItem('userProfileImage');

  const getInitials = (name) => {
    return (
      name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || 'UN'
    );
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsLoggedIn(!!token);
  }, []);

  const services = [
    { name: "Plumber", icon: "🔧", category: "Construction" },
    { name: "Dog Walker", icon: "🐕", category: "Pets" },
    { name: "Cleaner", icon: "🧹", category: "Maintenance" },
    { name: "Carpenter", icon: "🪵", category: "Construction" },
    { name: "Robotics", icon: "🤖", category: "Tech" },
    { name: "Gas Fitter", icon: "⛽", category: "Construction" },
    { name: "Plumbing", icon: "🚰", category: "Construction" },
    { name: "Carpentry", icon: "🛠️", category: "Construction" },
    { name: "Car Repair", icon: "🚗", category: "Auto" },
    { name: "Mechanic", icon: "⚙️", category: "Auto" },
  ];

  const providers = [
    { name: "Dileep Sagar", title: "Talent Searcher", location: "Kathmandu, Nepal", rating: 4.8, reviews: 127, verified: true, avatar: "🧑‍💼", hourlyRate: "रू 500/hr" },
    { name: "Aarav Patel", title: "Electrical Engineer", location: "Lalitpur, Nepal", rating: 4.9, reviews: 98, verified: true, avatar: "👨‍💼", hourlyRate: "रू 1200/hr" },
    { name: "Sita Sharma", title: "Home Stylist", location: "Pokhara, Nepal", rating: 4.7, reviews: 156, verified: true, avatar: "👩‍🎨", hourlyRate: "रू 800/hr" },
    { name: "Ram Carpenter", title: "Master Carpenter", location: "Butwal, Nepal", rating: 4.6, reviews: 203, verified: true, avatar: "🪜", hourlyRate: "रू 450/hr" },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      {/* Navigation Part */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <Logo />
            <div className="hidden md:flex items-center gap-8">
              {['Companies', 'Services', 'People'].map((item) => (
                <Link key={item} to={`/${item.toLowerCase()}`} className="text-sm font-semibold text-slate-600 hover:text-teal-600 transition-colors">
                  {item}
                </Link>
              ))}
              <div className="h-6 w-px bg-slate-200 mx-2" />
              <div className="flex items-center gap-3">
                {isLoggedIn ? (
                  <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-3 bg-white border border-slate-100 px-3 py-1.5 rounded-xl shadow-sm hover:shadow-md"
                  >
                    <div className="h-8 w-8 rounded-full overflow-hidden">
                      {userProfileImage ? (
                        <img src={userProfileImage} alt={userName} className="h-full w-full object-cover" />
                      ) : (
                        <div className="h-full w-full bg-teal-600 flex items-center justify-center text-white font-bold">
                          {getInitials(userName)}
                        </div>
                      )}
                    </div>
                    <div className="text-left">
                      <div className="text-xs font-bold text-slate-900 leading-none">{userName}</div>
                      <div className="text-[11px] text-slate-400">Dashboard</div>
                    </div>
                  </button>
                ) : (
                  <>
                    <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Log In</Button>
                    <Button variant="outline" size="sm" onClick={() => navigate('/signup')}>Sign Up</Button>
                    <Button variant="secondary" size="sm" className="gap-2" onClick={() => navigate('/professional-registration')
}>
                      <Briefcase size={16} /> Register as Professional
                    </Button>
                  </>
                )}
              </div>
            </div>
            <div className="md:hidden flex items-center">
              <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="p-2 text-slate-600 hover:text-teal-600">
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 space-y-4 shadow-xl">
            {['Companies', 'Services', 'People'].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="block text-base font-semibold text-slate-700 py-2 border-b border-slate-50" onClick={() => setMobileMenuOpen(false)}>
                {item}
              </Link>
            ))}
            <div className="flex flex-col gap-3 pt-2">
              {isLoggedIn ? (
                <Button className="w-full" variant="secondary" onClick={() => { navigate('/dashboard'); setMobileMenuOpen(false); }}>User Dashboard</Button>
              ) : (
                <>
                  <Button className="w-full" variant="outline" onClick={() => navigate('/login')}>Log In</Button>
                  <Button className="w-full" onClick={() => navigate('/signup')}>Sign Up</Button>
                  <Button className="w-full" variant="secondary" onClick={() => navigate('/professional-registration')}>Register as Professional</Button>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <main className="flex-grow">
        {/* Hero Part */}
        <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32 bg-gradient-to-br from-teal-50 via-white to-orange-50">
          <div className="absolute top-0 right-0 -translate-y-1/4 translate-x-1/4 w-96 h-96 bg-teal-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 translate-y-1/4 -translate-x-1/4 w-96 h-96 bg-orange-200/20 rounded-full blur-3xl pointer-events-none" />
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-100 text-teal-700 text-sm font-bold mb-6">
                  <Zap size={14} className="fill-teal-700" /> Trusted by 10,000+ Professionals
                </div>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 leading-[1.1] mb-6 tracking-tight">
                  Find Expert <span className="text-teal-600">Employees</span> & Professionals in Nepal
                </h1>
                <p className="text-lg text-slate-600 mb-10 max-w-2xl leading-relaxed">
                  Whether you need a master carpenter, a software developer, or a reliable housekeeper, Kamau Nepal connects you with verified talent right in your neighborhood.
                </p>
                <div className="relative group max-w-2xl mb-12">
                  <div className="absolute inset-0 bg-teal-600/5 rounded-[22px] blur-xl group-focus-within:bg-teal-600/10 transition-all" />
                  <div className="relative flex flex-col sm:flex-row gap-2 bg-white p-2 rounded-[20px] shadow-lg border border-slate-200">
                    <div className="flex-grow relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                      <input type="text" placeholder="Search by skill (e.g. Electrician, Designer)" className="w-full bg-transparent py-4 pl-12 pr-4 text-slate-800 focus:outline-none font-medium" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                    </div>
                    <Button variant="primary" className="sm:px-10 rounded-2xl group">
                      Search <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center text-teal-700 mb-4"><ShieldCheck size={20} /></div>
                    <h3 className="font-bold text-slate-900 mb-1">Looking for Work?</h3>
                    <p className="text-sm text-slate-500 mb-4">Set up your profile and reach top companies searching for your skills.</p>
                    <Button variant="secondary" size="sm" className="w-full">Explore Jobs</Button>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center text-orange-700 mb-4"><UserCircle size={20} /></div>
                    <h3 className="font-bold text-slate-900 mb-1">Need to Hire?</h3>
                    <p className="text-sm text-slate-500 mb-4">Find verified service providers with high ratings and local expertise.</p>
                    <Button variant="primary" size="sm" className="w-full">Start Hiring</Button>
                  </div>
                </div>
              </div>
              <div className="lg:col-span-5 hidden lg:block relative">
                <div className="relative">
                  <div className="absolute -top-10 -left-10 w-40 h-40 bg-orange-200/40 rounded-3xl rotate-12 -z-10" />
                  <div className="absolute -bottom-10 -right-10 w-60 h-60 bg-teal-200/40 rounded-full -z-10" />
                  <img src="https://picsum.photos/seed/kamau/600/800" alt="Professional Worker" className="rounded-[40px] shadow-2xl border-[12px] border-white object-cover aspect-[4/5] w-full" />
                  <div className="absolute bottom-8 -left-8 bg-white p-4 rounded-2xl shadow-xl border border-slate-100 animate-bounce">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-teal-500 flex items-center justify-center text-white"><ShieldCheck size={24} /></div>
                      <div>
                        <p className="text-xs font-bold text-slate-400 uppercase">Verified Talent</p>
                        <p className="text-lg font-black text-slate-900">100% Guaranteed</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Services Part */}
        <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">What do you need today?</h2>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium mb-16">Browse through our most popular service categories and find exactly who you're looking for.</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
              {services.map((service, idx) => (
                <button key={idx} className="group flex flex-col items-center p-8 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-teal-200 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
                  <div className="text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">{service.icon}</div>
                  <p className="font-bold text-slate-800 text-center">{service.name}</p>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400 font-bold mt-1">{service.category}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Professional Part */}
        <section className="py-24 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
              <div>
                <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4 tracking-tight">Featured Professionals</h2>
                <p className="text-slate-500 font-medium">Top-rated individuals verified by our team for excellence.</p>
              </div>
              <Button variant="outline" className="hidden md:flex gap-2">View All Experts <MoreHorizontal size={18} /></Button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {providers.map((p, idx) => (
                <div key={idx} className="group bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 hover:shadow-2xl transition-all duration-300 flex flex-col relative overflow-hidden h-full">
                  <div className="absolute top-0 left-0 w-full h-2 bg-teal-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="flex justify-between items-start mb-6">
                    <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-4xl shadow-inner">{p.avatar}</div>
                    {p.verified && <div className="bg-teal-50 text-teal-600 p-1.5 rounded-xl"><CheckCircle2 size={18} /></div>}
                  </div>
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors">{p.name}</h3>
                    <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mt-1">{p.title}</p>
                  </div>
                  <div className="space-y-3 mb-8">
                    <div className="flex items-center gap-2">
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => <Star key={i} size={14} className={i < Math.floor(p.rating) ? "fill-orange-400 text-orange-400" : "text-slate-200"} />)}
                      </div>
                      <span className="text-sm font-black">{p.rating}</span>
                      <span className="text-sm text-slate-400">({p.reviews})</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm font-medium text-slate-500"><MapPin size={16} className="text-teal-500" /> {p.location}</div>
                    <div className="text-lg font-black text-slate-900">{p.hourlyRate}</div>
                  </div>
                  <Button variant="secondary" className="w-full mt-auto rounded-2xl">View Profile</Button>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer Part */}
      <footer className="bg-slate-900 text-slate-300 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
            <div className="md:col-span-2">
              <Logo className="mb-6 brightness-0 invert" />
              <p className="max-w-xs text-slate-400 font-medium leading-relaxed mb-8">Empowering Nepal's workforce by connecting skilled professionals with life-changing opportunities.</p>
              <div className="flex gap-4">
                {[Twitter, Linkedin, Github].map((Icon, i) => (
                  <button key={i} className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center hover:bg-teal-600 hover:text-white transition-all"><Icon size={20} /></button>
                ))}
              </div>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Explore</h4>
              <ul className="space-y-4 text-sm font-medium">
                {['Services', 'Companies', 'Featured Talent', 'How it Works'].map(l => (
                  <li key={l}><Link to="#" className="hover:text-teal-400 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="text-white font-bold mb-6">Support</h4>
              <ul className="space-y-4 text-sm font-medium">
                {['Help Center', 'Privacy Policy', 'Terms of Service', 'Trust & Safety'].map(l => (
                  <li key={l}><Link to="#" className="hover:text-teal-400 transition-colors">{l}</Link></li>
                ))}
              </ul>
            </div>
          </div>
          <div className="pt-10 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center text-sm text-slate-500">
            <p>© 2025 Kamau Nepal. All rights reserved.</p>
            <div className="flex items-center gap-1">Made with <Heart size={14} className="text-red-500 fill-red-500" /> in Kathmandu</div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HomePage;