import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { Camera, Mail, Phone, MapPin, CheckCircle2, ArrowLeft, AlertCircle, Menu, X, Bell } from "lucide-react"
import Sidebar from './components/Sidebar'
import Logo from './Logo'

export default function UserProfile() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [profileImage, setProfileImage] = useState(null)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: localStorage.getItem("userName") || "",
    fullName: localStorage.getItem("userName") || "",
    email: localStorage.getItem("userEmail") || "",
    phone: localStorage.getItem("userPhone") || "",
    location: localStorage.getItem("userLocation") || "",
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isLocationEnabled, setIsLocationEnabled] = useState(false)
  const [isLocationVerified, setIsLocationVerified] = useState(!!localStorage.getItem("userLocation"))
  const [coords, setCoords] = useState(null)
  const [watchId, setWatchId] = useState(null)
  const [currentAddressName, setCurrentAddressName] = useState(localStorage.getItem("userLocation") || "")
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [debouncedCoords, setDebouncedCoords] = useState(null)

  // Reusable function to get address from OSM Nominatim
  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      setIsGeocoding(true)
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'KamauNepalApp/1.0'
          }
        }
      )

      if (response.data && response.data.address) {
        const addr = response.data.address
        const area = addr.suburb || addr.neighbourhood || addr.village || addr.city_district || ""
        const city = addr.city || addr.town || addr.municipality || ""
        const country = addr.country || ""

        return [area, city, country].filter(Boolean).join(", ")
      }
      return "Address not found"
    } catch (error) {
      console.error("OSM Geocoding error:", error)
      return "Error fetching address"
    } finally {
      setIsGeocoding(false)
    }
  }

  useEffect(() => {
    // Load user data from database and localStorage
    const loadUserProfile = async () => {
      const userId = localStorage.getItem("userId")

      if (!userId) {
        console.log("No user ID found, loading from localStorage")
        // Fallback to localStorage if no userId
        const userName = localStorage.getItem("userName") || ""
        const userEmail = localStorage.getItem("userEmail") || ""
        const userPhone = localStorage.getItem("userPhone") || ""
        const userLocation = localStorage.getItem("userLocation") || ""
        const userImage = localStorage.getItem("userProfileImage")

        setFormData({
          username: userName,
          fullName: userName,
          email: userEmail,
          phone: userPhone,
          location: userLocation,
        })

        if (userImage) {
          setProfileImage(userImage)
        }

        if (userLocation) {
          setIsLocationVerified(true)
          setCurrentAddressName(userLocation)
        }
        return
      }

      try {
        // Try to fetch from database
        const response = await axios.get(
          `/api/users/${userId}/profile`
        )

        if (response.data.user) {
          const user = response.data.user
          setFormData({
            username: user.username || user.name || "",
            fullName: user.name || "",
            email: user.email || "",
            phone: user.phone || "",
            location: user.formattedAddress || (typeof user.location === 'string' ? user.location : ""),
          })

          if (user.formattedAddress) {
            setIsLocationVerified(true);
            setCurrentAddressName(user.formattedAddress);
          }

          if (user.profileImage) {
            setProfileImage(user.profileImage)
            localStorage.setItem("userProfileImage", user.profileImage)
          }

          // Update localStorage with database values (only if they exist)
          if (user.name) localStorage.setItem("userName", user.name)
          if (user.email) localStorage.setItem("userEmail", user.email)
          if (user.phone) localStorage.setItem("userPhone", user.phone)
          if (user.formattedAddress || typeof user.location === 'string') {
            const loc = user.formattedAddress || user.location;
            localStorage.setItem("userLocation", loc)
          }
        }
      } catch (error) {
        console.error("Error loading profile from database:", error)
        // Fallback to localStorage
        const userName = localStorage.getItem("userName") || ""
        const userEmail = localStorage.getItem("userEmail") || ""
        const userPhone = localStorage.getItem("userPhone") || ""
        const userLocation = localStorage.getItem("userLocation") || ""
        const userImage = localStorage.getItem("userProfileImage")

        setFormData({
          username: userName,
          fullName: userName,
          email: userEmail,
          phone: userPhone,
          location: userLocation,
        })

        if (userImage) {
          setProfileImage(userImage)
        }

        if (userLocation) {
          setIsLocationVerified(true)
          setCurrentAddressName(userLocation)
        }
      }
    }

    loadUserProfile()
  }, [])

  // Debounce state for location updates to avoid API spam

  useEffect(() => {
    if (!coords) return

    const handler = setTimeout(() => {
      setDebouncedCoords(coords)
    }, 5000) // 5 second debounce

    return () => clearTimeout(handler)
  }, [coords])

  // Fetch address when debounced coordinates change
  useEffect(() => {
    if (!debouncedCoords) return

    const fetchAddress = async () => {
      const address = await getAddressFromCoordinates(debouncedCoords.latitude, debouncedCoords.longitude)
      setCurrentAddressName(address)
      setIsLocationVerified(true)

      // Update form data so it stays "saved" even if tracking stops
      setFormData(prev => ({
        ...prev,
        location: address
      }))

      // Update backend with the new address and coordinates
      try {
        const token = localStorage.getItem("token")
        const role = localStorage.getItem("userRole") // Get role if available

        if (token) {
          await axios.put(
            "/api/users/update-location",
            {
              latitude: debouncedCoords.latitude,
              longitude: debouncedCoords.longitude,
              formattedAddress: address,
              role: role || "user"
            },
            { headers: { Authorization: `Bearer ${token}` } }
          )
          console.log("Location and Address persisted to database:", { address })
          localStorage.setItem("userLocation", address)

          // Stop tracking automatically to keep it static as requested
          if (watchId) {
            navigator.geolocation.clearWatch(watchId)
            setWatchId(null)
          }
          setIsLocationEnabled(false)
        }
      } catch (err) {
        console.error("Failed to persist address to database:", err)
      }
    }

    fetchAddress()
  }, [debouncedCoords])

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      // Limit file size to 100MB
      if (file.size > 100 * 1024 * 1024) {
        setErrors({ ...errors, profileImage: "File size must be less than 100MB" })
        return
      }

      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
        setErrors({ ...errors, profileImage: "" })
      }
      reader.readAsDataURL(file)
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email"
    }
    if (formData.phone && !/^[\d\s\-\+\(\)]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value,
    })
    // Clear error for this field
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      })
    }
  }

  const handleSaveChanges = async () => {
    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    try {
      const userId = localStorage.getItem("userId")

      if (!userId) {
        throw new Error("User ID not found. Please login again.")
      }

      console.log("Saving profile for userId:", userId);
      console.log("Profile image present:", !!profileImage);
      if (profileImage) {
        console.log("Profile image type:", profileImage.startsWith("data:") ? "Base64" : "Other");
        console.log("Profile image size:", profileImage.length, "characters");
      }

      // Prepare form data for multipart upload
      const formDataToSend = new FormData()
      formDataToSend.append("fullName", formData.fullName)
      formDataToSend.append("username", formData.username)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("phone", formData.phone)
      formDataToSend.append("location", formData.location)

      // Add profile image if it's a new file (base64 string)
      if (profileImage && profileImage.startsWith("data:")) {
        console.log("Appending profile image to form data");
        formDataToSend.append("profileImage", profileImage)
      }

      // Send to backend
      console.log("Sending profile update request...");
      const apiResponse = await axios.put(
        `/api/users/${userId}/profile`,
        formDataToSend
      )

      console.log("Profile update response:", apiResponse.data)

      // Save to localStorage as backup
      localStorage.setItem("userName", formData.fullName)
      localStorage.setItem("userEmail", formData.email)
      localStorage.setItem("userPhone", formData.phone)
      localStorage.setItem("userLocation", formData.location)

      if (profileImage) {
        localStorage.setItem("userProfileImage", profileImage)
        console.log("Profile image saved to localStorage");
      }

      setSuccessMessage("Profile updated successfully and saved to database!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setErrors({
        general: error.response?.data?.message || error.message || "Failed to save profile. Please try again."
      })
    } finally {
      setIsLoading(false)
    }
  }



  useEffect(() => {
    // Cleanup watchPosition on unmount
    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId)
      }
    }
  }, [watchId])

  const startTracking = () => {
    if (!navigator.geolocation) {
      setErrors({ ...errors, location: "Geolocation is not supported by your browser" })
      return
    }

    setIsLoading(true)
    const id = navigator.geolocation.watchPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        setCoords({ latitude, longitude })
        setIsLocationEnabled(true)
        setIsLoading(false)
      },
      (error) => {
        console.error("Geolocation error:", error)
        setIsLocationEnabled(false)
        setIsLoading(false)
        setErrors({ ...errors, location: "Location permission denied. Please enter address manually." })
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    )
    setWatchId(id)
  }

  const handleCancel = () => {
    if (watchId) {
      navigator.geolocation.clearWatch(watchId)
      setWatchId(null)
    }
    setIsLocationEnabled(false)
    const savedLocation = localStorage.getItem("userLocation") || ""
    setCurrentAddressName(savedLocation)
    setIsLocationVerified(!!savedLocation)
    // Reset form to initial values
    const userName = localStorage.getItem("userName") || ""
    const userEmail = localStorage.getItem("userEmail") || ""
    const userPhone = localStorage.getItem("userPhone") || ""
    const userLocation = localStorage.getItem("userLocation") || ""

    setFormData({
      username: userName,
      fullName: userName,
      email: userEmail,
      phone: userPhone,
      location: userLocation,
    })
    setErrors({})
    setSuccessMessage("")
  }

  const getInitials = (name) => {
    if (!name) return "UN"
    return name
      .split(" ")
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "UN"
  }

  const handleLogout = () => {
    localStorage.clear()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-2 hover:bg-gray-100 rounded-lg text-gray-600 transition"
            >
              {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
            <h1 className="text-xl font-bold text-gray-900">User Profile</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-gray-700 hover:bg-gray-100 rounded-lg transition">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <button onClick={() => navigate('/')} className="hover:opacity-80 transition cursor-pointer">
              <Logo />
            </button>
          </div>
        </div>
      </nav>

      <div className="flex flex-1">
        <Sidebar
          sidebarOpen={sidebarOpen}
          setSidebarOpen={setSidebarOpen}
          handleLogout={handleLogout}
        />

        <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto mb-6">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-slate-700 hover:text-teal-600 transition-colors font-semibold"
            >
              <ArrowLeft size={20} />
              <span className="text-sm">Back</span>
            </button>
          </div>

          <div className="w-full max-w-4xl mx-auto">
            <div className="bg-white rounded-2xl shadow-md border border-slate-200 p-8">
              <h1 className="text-3xl font-bold text-slate-900 mb-8">User Profile</h1>

              {/* Success Message */}
              {successMessage && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl text-green-700 font-semibold flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  {successMessage}
                </div>
              )}

              {/* General Error */}
              {errors.general && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 font-semibold flex items-center gap-2">
                  <AlertCircle size={20} />
                  {errors.general}
                </div>
              )}

              <div className="space-y-8">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center gap-4 pb-8 border-b border-slate-200">
                  <div className="relative">
                    <div className="h-32 w-32 rounded-full bg-gradient-to-br from-teal-400 to-orange-400 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                      {profileImage ? (
                        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                      ) : (
                        getInitials(formData.fullName)
                      )}
                    </div>
                    <label
                      htmlFor="profile-upload"
                      className="absolute bottom-0 right-0 bg-teal-600 hover:bg-teal-700 text-white rounded-full p-3 cursor-pointer transition-colors shadow-lg"
                    >
                      <Camera className="h-5 w-5" />
                      <input
                        id="profile-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageUpload}
                      />
                    </label>
                  </div>
                  <p className="text-sm text-slate-600">Click camera icon to upload profile picture</p>
                  {errors.profileImage && (
                    <p className="text-sm text-red-600">{errors.profileImage}</p>
                  )}
                </div>

                {/* Personal Information */}
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900">Personal Information</h2>

                  <div>
                    <label htmlFor="fullName" className="block text-sm font-semibold text-slate-700 mb-2">
                      Full Name
                    </label>
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Enter your full name"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${errors.fullName
                        ? "border-red-300 focus:ring-red-200"
                        : "border-slate-300 focus:ring-teal-200"
                        }`}
                    />
                    {errors.fullName && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.fullName}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="username" className="block text-sm font-semibold text-slate-700 mb-2">
                      Username
                    </label>
                    <input
                      id="username"
                      name="username"
                      type="text"
                      placeholder="Enter your username"
                      value={formData.username}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
                    />
                  </div>
                </div>

                {/* Contact Information */}
                <div className="space-y-5">
                  <h2 className="text-xl font-bold text-slate-900">Contact Information</h2>

                  <div>
                    <label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Mail size={16} className="text-teal-600" />
                      Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="your.email@example.com"
                      value={formData.email}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${errors.email
                        ? "border-red-300 focus:ring-red-200"
                        : "border-slate-300 focus:ring-teal-200"
                        }`}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.email}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <Phone size={16} className="text-teal-600" />
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+977 98XX XXX XXX"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${errors.phone
                        ? "border-red-300 focus:ring-red-200"
                        : "border-slate-300 focus:ring-teal-200"
                        }`}
                    />
                    {errors.phone && (
                      <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle size={14} /> {errors.phone}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="location" className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                      <MapPin size={16} className="text-teal-600" />
                      Location {isLocationEnabled ? "(Real-time)" : "(Manual Address)"}
                    </label>
                    <div className="flex flex-col gap-3">
                      <input
                        id="location"
                        name="location"
                        type="text"
                        placeholder="City, Country or Street Address"
                        value={isLocationEnabled ? (currentAddressName || (isGeocoding ? "Locating area..." : "Real-time Location Active")) : formData.location}
                        onChange={handleInputChange}
                        disabled={isLocationEnabled}
                        className={`w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all ${(isLocationEnabled || isLocationVerified) ? "bg-teal-50/30 text-teal-700 font-bold" : ""}`}
                      />

                      {(isLocationEnabled || isLocationVerified) && (currentAddressName || isGeocoding) && (
                        <div className="p-3 bg-teal-50 border border-teal-100 rounded-xl animate-in fade-in slide-in-from-top-1 duration-300">
                          <p className="text-xs font-bold text-teal-800 uppercase tracking-wider mb-1 flex items-center gap-1">
                            {isGeocoding ? `Updating...` : isLocationEnabled ? `📍 Live Tracking Active` : `📍 Saved Verified Location`}
                          </p>
                          <p className="text-sm text-teal-900 font-semibold">
                            {isGeocoding ? "Calculating address..." : currentAddressName || formData.location}
                          </p>
                        </div>
                      )}

                      {!isLocationEnabled ? (
                        <button
                          type="button"
                          onClick={startTracking}
                          className="flex items-center justify-center gap-2 py-2 px-4 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 transition-all font-semibold text-sm"
                        >
                          <MapPin size={16} />
                          {isLocationVerified ? "Update with Real-time Location" : "Enable Real-time Location"}
                        </button>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-green-600 font-medium px-2">
                          <CheckCircle2 size={12} /> Live tracking active
                        </div>
                      )}

                      {errors.location && (
                        <p className="text-xs text-red-500 font-medium">{errors.location}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* User Analytics */}
                <div className="space-y-4 pb-8 border-b border-slate-200">
                  <h2 className="text-xl font-bold text-slate-900">User Analytics</h2>
                  <div className="bg-slate-100 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-600 font-semibold">Total Bookings</span>
                      <span className="text-4xl font-bold text-teal-600">0</span>
                    </div>
                  </div>
                </div>

                {/* Account Verification */}
                <div className="space-y-4 pb-8">
                  <h2 className="text-xl font-bold text-slate-900">Account Verification</h2>
                  <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl">
                    <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0" />
                    <span className="text-green-700 font-semibold">Email Verified</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 pt-4">
                  <button
                    onClick={handleSaveChanges}
                    disabled={isLoading}
                    className="flex-1 bg-teal-600 hover:bg-teal-700 disabled:bg-teal-400 text-white font-bold py-3 px-6 rounded-xl transition-all transform hover:-translate-y-0.5 shadow-md"
                  >
                    {isLoading ? "Saving..." : "Save Changes"}
                  </button>
                  <button
                    onClick={handleCancel}
                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold py-3 px-6 rounded-xl transition-all transform hover:-translate-y-0.5"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
