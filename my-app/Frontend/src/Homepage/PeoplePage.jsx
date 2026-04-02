import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Star, MapPin, CheckCircle2, Filter, SlidersHorizontal, Loader, UserCircle } from 'lucide-react';
import axios from 'axios';
import Logo from '../Logo';
import Button from '../components/Button';

const PeoplePage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [professionals, setProfessionals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchProfessionals();
  }, []);

  const fetchProfessionals = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/professionals/');
      if (response.data.success) {
        setProfessionals(response.data.data || []);
      } else {
        setError('Failed to load professionals');
      }
    } catch (err) {
      console.error('Error fetching professionals:', err);
      setError('Something went wrong. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const filteredPeople = professionals.filter(p => 
    `${p.firstName} ${p.lastName}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (p.serviceCategory && p.serviceCategory.toLowerCase().includes(searchQuery.toLowerCase())) ||
    (p.serviceArea && p.serviceArea.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const formatServiceCategory = (cat) => {
    if (!cat) return '';
    return cat.charAt(0).toUpperCase() + cat.slice(1);
  };

  const formatServiceArea = (area) => {
    if (!area) return '';
    return area.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex justify-between items-center">
          <Link to="/"><Logo /></Link>
          <div className="hidden md:flex gap-8">
            <Link to="/companies" className="text-slate-600 hover:text-teal-600 font-semibold">Companies</Link>
            <Link to="/services" className="text-slate-600 hover:text-teal-600 font-semibold">Services</Link>
            <Link to="/people" className="text-teal-600 font-bold">People</Link>
          </div>
          <Button variant="primary" size="sm">Find Talent</Button>
        </div>
      </nav>

      <header className="bg-white border-b border-slate-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-black text-slate-900 mb-2">Find Professionals</h1>
              <p className="text-slate-500">Connect with verified experts in your area.</p>
            </div>
            <div className="flex gap-3">
              <div className="relative flex-grow md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search by name, skill, or title..." 
                  className="w-full py-3 pl-11 pr-4 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="rounded-xl">
                <SlidersHorizontal size={20} />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader className="text-teal-600 animate-spin mb-4" size={48} />
            <p className="text-slate-500 font-bold">Finding professionals for you...</p>
          </div>
        ) : error ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <p className="text-red-500 font-bold mb-4">{error}</p>
            <Button onClick={fetchProfessionals}>Try Again</Button>
          </div>
        ) : filteredPeople.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-[40px] border border-slate-100 shadow-sm">
            <Search size={48} className="mx-auto text-slate-200 mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No professionals found</h3>
            <p className="text-slate-500">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredPeople.map(person => (
              <div key={person._id} className="bg-white rounded-[32px] p-8 border border-slate-100 shadow-sm hover:shadow-xl transition-all group flex flex-col">
                <div className="flex justify-between items-start mb-6">
                  <div className="relative">
                    {person.profileImage ? (
                      <img 
                        src={person.profileImage.startsWith('http') ? person.profileImage : `/${person.profileImage.replace(/\\/g, '/')}`} 
                        alt={`${person.firstName} ${person.lastName}`} 
                        className="w-20 h-20 rounded-2xl object-cover shadow-md" 
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow-md">
                        <UserCircle size={48} />
                      </div>
                    )}
                    {person.isVerified && (
                      <div className="absolute -bottom-2 -right-2 bg-teal-500 text-white p-1 rounded-lg border-2 border-white">
                        <CheckCircle2 size={14} />
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end font-black text-slate-900">
                      <Star size={16} className="text-orange-400 fill-orange-400" />
                      {person.rating || 0}
                    </div>
                    <div className="text-xs text-slate-400 font-bold uppercase tracking-wider">{person.totalReviews || 0} Reviews</div>
                  </div>
                </div>

                <div className="mb-6">
                  <h3 className="text-xl font-bold text-slate-900 group-hover:text-teal-600 transition-colors uppercase">
                    {person.firstName} {person.lastName}
                  </h3>
                  <p className="text-teal-600 font-bold text-sm uppercase tracking-widest mt-1">
                    {formatServiceCategory(person.serviceCategory)}
                  </p>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500 mb-6">
                  <MapPin size={16} className="text-teal-500" /> {formatServiceArea(person.serviceArea)}, Nepal
                </div>

                {person.bio && (
                  <p className="text-sm text-slate-500 mb-6 line-clamp-2 italic">
                    "{person.bio}"
                  </p>
                )}

                <div className="flex items-center justify-between pt-6 border-t border-slate-50 mt-auto">
                  <div className="text-lg font-black text-slate-900">
                    रू {person.hourlyWage || 'N/A'}/hr
                  </div>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    onClick={() => navigate(`/professional/${person._id}`)}
                  >
                    View Profile
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
};

export default PeoplePage;
