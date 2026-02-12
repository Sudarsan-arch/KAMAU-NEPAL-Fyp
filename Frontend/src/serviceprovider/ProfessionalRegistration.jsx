"use client"

import { useState, useRef } from "react"
import {
  ArrowLeft,
  CheckCircle2,
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Info,
  Star,
  ShieldCheck,
  Camera,
  Upload,
  FileText,
  Trash2,
} from "lucide-react"

const ProfessionalRegistration = () => {
  const fileInputRef = useRef(null)
  const docInputRef = useRef(null)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    username: "",
    email: "",
    phone: "",
    serviceCategory: "",
    serviceArea: "",
    hourlyWage: "",
    bio: "",
  })

  const [profileImage, setProfileImage] = useState(null)
  const [documents, setDocuments] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}
    
    if (!formData.firstName.trim()) newErrors.firstName = "First name is required"
    if (!formData.lastName.trim()) newErrors.lastName = "Last name is required"
    if (!formData.username.trim()) newErrors.username = "Username is required"
    
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    
    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required"
    } else if (!/^[0-9]{10}$/.test(formData.phone.replace(/\D/g, ''))) {
      newErrors.phone = "Please enter a valid 10-digit phone number"
    }
    
    if (!formData.serviceCategory) newErrors.serviceCategory = "Service category is required"
    if (!formData.serviceArea) newErrors.serviceArea = "Service area is required"
    
    if (!formData.hourlyWage) {
      newErrors.hourlyWage = "Hourly wage is required"
    } else if (parseFloat(formData.hourlyWage) <= 0) {
      newErrors.hourlyWage = "Hourly wage must be greater than 0"
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }))
    }
    
    if (name === "phone") {
      const cleaned = value.replace(/\D/g, '')
      const formatted = cleaned.slice(0, 10)
      setFormData(prev => ({ ...prev, [name]: formatted }))
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleImageChange = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      alert("Image size should be less than 5MB")
      return
    }

    if (!file.type.startsWith('image/')) {
      alert("Please upload an image file")
      return
    }

    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImage(reader.result)
    }
    reader.onerror = () => {
      alert("Failed to read image file")
    }
    reader.readAsDataURL(file)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleDocChange = (e) => {
    const files = e.target.files
    if (!files) return

    const newDocs = []
    
    Array.from(files).forEach((file) => {
      if (file.size > 10 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 10MB`)
        return
      }

      const validTypes = ['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
      if (!validTypes.includes(file.type)) {
        alert(`File ${file.name} must be PDF, JPG, or PNG`)
        return
      }

      newDocs.push({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        size: `${(file.size / 1024).toFixed(1)} KB`,
        file: file
      })
    })

    setDocuments((prev) => [...prev, ...newDocs])
    
    if (docInputRef.current) {
      docInputRef.current.value = ''
    }
  }

  const removeDoc = (id) => {
    setDocuments((prev) => prev.filter((doc) => doc.id !== id))
  }

  const triggerImageUpload = () => fileInputRef.current?.click()
  const triggerDocUpload = () => docInputRef.current?.click()

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!validateForm()) {
      const firstError = Object.keys(errors)[0]
      const element = document.querySelector(`[name="${firstError}"]`)
      element?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    if (documents.length === 0) {
      alert("Please upload at least one verification document")
      return
    }

    setIsSubmitting(true)

    const submitData = new FormData()
    
    Object.entries(formData).forEach(([key, value]) => {
      submitData.append(key, value)
    })
    
    if (profileImage && fileInputRef.current?.files?.[0]) {
      submitData.append('profileImage', fileInputRef.current.files[0])
    }
    
    documents.forEach((doc, index) => {
      submitData.append('documents', doc.file)
    })

    try {
      console.log('Submitting form with data:', formData);
      console.log('Number of documents:', documents.length);
      console.log('Has profile image:', !!profileImage);

      const response = await fetch('http://localhost:5001/api/professionals/register', {
        method: 'POST',
        body: submitData
      })

      const data = await response.json()
      console.log('Response status:', response.status);
      console.log('Response data:', data);

      if (!response.ok) {
        alert(data.message || 'Registration failed. Please try again.')
        setIsSubmitting(false)
        return
      }

      setIsSubmitting(false)
      setSubmitted(true)
      window.scrollTo({ top: 0, behavior: "smooth" })
    } catch (error) {
      console.error('Registration error:', error)
      alert("Registration failed. Please try again. Check console for details.")
      setIsSubmitting(false)
    }
  }

  const serviceCategories = [
    { value: "", label: "Select category", disabled: true },
    { value: "plumbing", label: "🔧 Plumbing" },
    { value: "electrical", label: "⚡ Electrical" },
    { value: "carpentry", label: "🪵 Carpentry" },
    { value: "cleaning", label: "🧹 Cleaning" },
    { value: "painting", label: "🎨 Painting" },
    { value: "gardening", label: "🌿 Gardening" },
    { value: "mechanic", label: "🔩 Mechanic" },
    { value: "tutoring", label: "📚 Tutoring" },
  ]

  const serviceAreas = [
    { value: "", label: "Select location", disabled: true },
    { group: "Kathmandu", options: [
      { value: "thamel", label: "Thamel" },
      { value: "kathmandu-center", label: "Kathmandu Center" },
      { value: "patan", label: "Patan" },
      { value: "boudha", label: "Boudha" },
      { value: "koteshwor", label: "Koteshwor" },
    ]},
    { group: "Bhaktapur", options: [
      { value: "bhaktapur-center", label: "Bhaktapur Center" },
      { value: "nagarkot", label: "Nagarkot" },
      { value: "changu", label: "Changu" },
    ]},
    { group: "Lalitpur", options: [
      { value: "pulchowk", label: "Pulchowk" },
      { value: "jawalakhel", label: "Jawalakhel" },
    ]},
  ]

  if (submitted) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center p-8 sm:p-12 bg-white rounded-3xl sm:rounded-[40px] shadow-2xl border border-slate-100">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-6 sm:mb-8 text-teal-600 animate-bounce">
            <CheckCircle2 className="w-12 h-12 sm:w-16 sm:h-16" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-4">Registration Complete!</h2>
          <p className="text-slate-500 mb-8 sm:mb-10 font-medium text-sm sm:text-base">
            Your profile is now active and visible on our platform. You can start receiving job requests immediately!
          </p>
          <button
            className="w-full py-3 sm:py-4 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl sm:rounded-2xl transition-colors text-sm sm:text-base"
            onClick={() => (window.location.href = "/")}
          >
            Return to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-slate-50 min-h-screen py-8 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <button
          onClick={() => window.history.back()}
          className="group inline-flex items-center gap-2 text-slate-500 hover:text-orange-500 font-bold mb-6 sm:mb-8 transition-colors text-sm sm:text-base"
        >
          <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
          Back to previous
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          {/* Left Side: Info */}
          <div className="lg:col-span-5 space-y-6 sm:space-y-8">
            <div>
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 leading-tight mb-4 sm:mb-6">
                Turn your skills into <span className="text-orange-500 underline decoration-teal-400">Income</span>
              </h1>
              <p className="text-base sm:text-lg text-slate-600 font-medium leading-relaxed">
                Join Kamau Nepal's community of certified professionals. We help you find clients, manage your schedule,
                and grow your local reputation.
              </p>
            </div>

            {/* Profile Picture Upload Preview Card */}
            <div className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[32px] border border-slate-100 shadow-sm flex flex-col items-center">
              <div className="relative group cursor-pointer" onClick={triggerImageUpload}>
                <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden bg-slate-100 border-4 border-white shadow-lg relative">
                  {profileImage ? (
                    <img
                      src={profileImage}
                      alt="Profile Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-300">
                      <User className="w-12 h-12 sm:w-16 sm:h-16" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Camera className="text-white w-6 h-6" />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={triggerImageUpload}
                  className="absolute bottom-0 right-0 sm:bottom-1 sm:right-1 bg-orange-500 text-white p-1.5 sm:p-2 rounded-full shadow-md hover:bg-orange-600 transition-colors"
                >
                  <Camera className="w-3 h-3 sm:w-4 sm:h-4" />
                </button>
              </div>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageChange} 
                className="hidden" 
                accept="image/*" 
              />
              <div className="mt-3 sm:mt-4 text-center">
                <h3 className="font-bold text-slate-900 text-sm sm:text-base">Profile Photo</h3>
                <p className="text-xs text-slate-500 mt-1">Clear photos help build trust with clients</p>
              </div>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {[
                {
                  icon: <Star className="text-orange-500 w-5 h-5 sm:w-6 sm:h-6" />,
                  title: "Build your reputation",
                  desc: "Get verified and receive ratings from real customers in Kathmandu & Bhaktapur.",
                },
                {
                  icon: <ShieldCheck className="text-teal-600 w-5 h-5 sm:w-6 sm:h-6" />,
                  title: "Work with trust",
                  desc: "Our secure platform ensures you connect with legitimate clients and get paid on time.",
                },
              ].map((item, i) => (
                <div key={i} className="flex gap-3 sm:gap-4 p-4 sm:p-5 bg-white rounded-2xl sm:rounded-3xl border border-slate-100 shadow-sm">
                  <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-slate-50 rounded-xl sm:rounded-2xl flex items-center justify-center">
                    {item.icon}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 mb-1 text-sm sm:text-base">{item.title}</h3>
                    <p className="text-xs sm:text-sm text-slate-500 font-medium">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-orange-50 p-4 sm:p-6 lg:p-8 rounded-2xl sm:rounded-[32px] border border-orange-100">
              <div className="flex items-start gap-3 sm:gap-4">
                <Info className="text-orange-500 flex-shrink-0 w-5 h-5 sm:w-6 sm:h-6" />
                <p className="text-orange-800 text-xs sm:text-sm font-bold leading-relaxed">
                  TIP: Uploading professional certifications and IDs speeds up the verification process.
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="lg:col-span-7">
            <div className="bg-white p-4 sm:p-6 lg:p-8 xl:p-12 rounded-3xl sm:rounded-[40px] shadow-xl sm:shadow-2xl shadow-slate-200/50 border border-slate-100">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mb-6 sm:mb-8">Professional Details</h2>

              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* First Name */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">First Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        required
                        type="text"
                        name="firstName"
                        placeholder="Ram"
                        className={`w-full bg-slate-50 border ${errors.firstName ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                        value={formData.firstName}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-xs text-red-500 ml-1">{errors.firstName}</p>
                    )}
                  </div>
                  {/* Last Name */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Last Name *</label>
                    <div className="relative">
                      <User className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        required
                        type="text"
                        name="lastName"
                        placeholder="Bahadur"
                        className={`w-full bg-slate-50 border ${errors.lastName ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                        value={formData.lastName}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="text-xs text-red-500 ml-1">{errors.lastName}</p>
                    )}
                  </div>
                </div>

                {/* Username */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Username *</label>
                  <div className="relative">
                    <span className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold">@</span>
                    <input
                      required
                      type="text"
                      name="username"
                      placeholder="ram_pro_2025"
                      className={`w-full bg-slate-50 border ${errors.username ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-7 sm:pl-10 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                      value={formData.username}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.username && (
                    <p className="text-xs text-red-500 ml-1">{errors.username}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Email */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Email Address *</label>
                    <div className="relative">
                      <Mail className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        required
                        type="email"
                        name="email"
                        placeholder="ram@example.com"
                        className={`w-full bg-slate-50 border ${errors.email ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                        value={formData.email}
                        onChange={handleInputChange}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-xs text-red-500 ml-1">{errors.email}</p>
                    )}
                  </div>
                  {/* Phone */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Phone Number *</label>
                    <div className="relative">
                      <Phone className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <input
                        required
                        type="tel"
                        name="phone"
                        placeholder="9801234567"
                        className={`w-full bg-slate-50 border ${errors.phone ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                        value={formData.phone}
                        onChange={handleInputChange}
                        maxLength={10}
                      />
                    </div>
                    {errors.phone && (
                      <p className="text-xs text-red-500 ml-1">{errors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  {/* Service Category */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Service Category *</label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <select
                        required
                        name="serviceCategory"
                        className={`w-full bg-slate-50 border ${errors.serviceCategory ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-8 sm:pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base appearance-none cursor-pointer`}
                        value={formData.serviceCategory}
                        onChange={handleInputChange}
                      >
                        {serviceCategories.map((category) => (
                          <option 
                            key={category.value} 
                            value={category.value}
                            disabled={category.disabled}
                          >
                            {category.label}
                          </option>
                        ))}
                      </select>
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.serviceCategory && (
                      <p className="text-xs text-red-500 ml-1">{errors.serviceCategory}</p>
                    )}
                  </div>
                  {/* Service Area */}
                  <div className="space-y-2">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Service Area *</label>
                    <div className="relative">
                      <MapPin className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4 sm:w-5 sm:h-5" />
                      <select
                        required
                        name="serviceArea"
                        className={`w-full bg-slate-50 border ${errors.serviceArea ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-8 sm:pr-10 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base appearance-none cursor-pointer`}
                        value={formData.serviceArea}
                        onChange={handleInputChange}
                      >
                        {serviceAreas.map((area, index) => (
                          area.group ? (
                            <optgroup key={index} label={area.group}>
                              {area.options.map((option) => (
                                <option key={option.value} value={option.value}>
                                  {option.label}
                                </option>
                              ))}
                            </optgroup>
                          ) : (
                            <option key={area.value} value={area.value} disabled={area.disabled}>
                              {area.label}
                            </option>
                          )
                        ))}
                      </select>
                      <div className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                    {errors.serviceArea && (
                      <p className="text-xs text-red-500 ml-1">{errors.serviceArea}</p>
                    )}
                  </div>
                </div>

                {/* Hourly Wage */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">Hourly Wage (रु) *</label>
                  <div className="relative">
                    <div className="absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">रु</div>
                    <input
                      required
                      type="number"
                      name="hourlyWage"
                      placeholder="e.g. 500"
                      min="1"
                      step="50"
                      className={`w-full bg-slate-50 border ${errors.hourlyWage ? 'border-red-300' : 'border-slate-200'} rounded-xl sm:rounded-2xl py-3 sm:py-4 pl-9 sm:pl-12 pr-3 sm:pr-4 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base`}
                      value={formData.hourlyWage}
                      onChange={handleInputChange}
                    />
                  </div>
                  {errors.hourlyWage && (
                    <p className="text-xs text-red-500 ml-1">{errors.hourlyWage}</p>
                  )}
                </div>

                {/* Bio */}
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">About Your Service</label>
                  <textarea
                    name="bio"
                    placeholder="Tell potential clients about your experience, tools, and expertise..."
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl py-3 sm:py-4 px-3 sm:px-6 h-24 sm:h-32 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all font-medium text-sm sm:text-base resize-none"
                    value={formData.bio}
                    onChange={handleInputChange}
                    maxLength={500}
                  />
                  <div className="text-xs text-slate-400 text-right">
                    {formData.bio.length}/500 characters
                  </div>
                </div>

                {/* Verification Documents Section */}
                <div className="space-y-3 sm:space-y-4 pt-2 sm:pt-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs sm:text-sm font-bold text-slate-700 ml-1">
                      Verification Documents *
                    </label>
                    <button
                      type="button"
                      onClick={triggerDocUpload}
                      className="text-xs sm:text-sm font-bold text-teal-600 hover:text-teal-700 flex items-center gap-1 transition-colors"
                    >
                      <Upload className="w-3 h-3 sm:w-4 sm:h-4" /> Add Documents
                    </button>
                  </div>

                  <input
                    type="file"
                    ref={docInputRef}
                    onChange={handleDocChange}
                    className="hidden"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png"
                  />

                  {documents.length > 0 ? (
                    <div className="grid grid-cols-1 gap-2 sm:gap-3">
                      {documents.map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 sm:p-4 bg-slate-50 border border-slate-200 rounded-xl sm:rounded-2xl group hover:border-teal-200 transition-colors"
                        >
                          <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-100 rounded-lg sm:rounded-xl flex items-center justify-center text-teal-600 flex-shrink-0">
                              <FileText className="w-4 h-4 sm:w-5 sm:h-5" />
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs sm:text-sm font-bold text-slate-800 truncate">{doc.name}</p>
                              <p className="text-xs text-slate-400 font-medium">{doc.size}</p>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeDoc(doc.id)}
                            className="p-1 sm:p-2 text-slate-400 hover:text-red-500 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div
                      onClick={triggerDocUpload}
                      className="border-2 border-dashed border-slate-200 rounded-2xl sm:rounded-[32px] p-4 sm:p-6 lg:p-8 text-center cursor-pointer hover:border-teal-400 hover:bg-teal-50/30 transition-all group"
                    >
                      <div className="w-12 h-12 sm:w-16 sm:h-16 bg-slate-100 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-3 sm:mb-4 text-slate-400 group-hover:bg-teal-100 group-hover:text-teal-600 transition-colors">
                        <Upload className="w-5 h-5 sm:w-6 sm:h-6" />
                      </div>
                      <p className="text-xs sm:text-sm font-bold text-slate-700 mb-1">Upload verification documents</p>
                      <p className="text-xs text-slate-500">PDF, JPG, or PNG. Max 10MB per file.</p>
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-6 sm:pt-8">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 bg-orange-500 hover:bg-orange-600 text-white py-3 sm:py-4 font-bold rounded-xl sm:rounded-2xl transition-colors text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-4 w-4 sm:h-5 sm:w-5 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Submitting...
                      </span>
                    ) : "Submit Application"}
                  </button>
                  <button
                    type="button"
                    className="flex-1 py-3 sm:py-4 font-bold rounded-xl sm:rounded-2xl bg-transparent border border-slate-200 hover:bg-slate-50 text-slate-700 text-sm sm:text-base"
                    onClick={() => window.history.back()}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProfessionalRegistration;
