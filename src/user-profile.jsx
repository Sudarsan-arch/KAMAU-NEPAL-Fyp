import React, { useState, useEffect } from "react"
import { useNavigate } from 'react-router-dom'
import axios from "axios"
import { Camera, Mail, Phone, MapPin, CheckCircle2, ArrowLeft, AlertCircle } from "lucide-react"

export default function UserProfile({ onBack }) {
  const [profileImage, setProfileImage] = useState(null)
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    username: "",
    fullName: "",
    email: "",
    phone: "",
    location: "",
  })
  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load user data from localStorage
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
  }, [])

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
      
      // Prepare form data for multipart upload
      const formDataToSend = new FormData()
      formDataToSend.append("fullName", formData.fullName)
      formDataToSend.append("email", formData.email)
      formDataToSend.append("phone", formData.phone)
      formDataToSend.append("location", formData.location)
      
      // Add profile image if it's a new file (not a data URL from localStorage)
      if (profileImage && profileImage.startsWith("data:")) {
        // Convert base64 to blob
        const response = await fetch(profileImage)
        const blob = await response.blob()
        formDataToSend.append("profileImage", blob, "profile.jpg")
      }

      // Send to backend
      const apiResponse = await axios.put(
        `http://localhost:5000/api/users/${userId}/profile`,
        formDataToSend,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      )

      // Save to localStorage as backup
      localStorage.setItem("userName", formData.fullName)
      localStorage.setItem("userEmail", formData.email)
      localStorage.setItem("userPhone", formData.phone)
      localStorage.setItem("userLocation", formData.location)

      if (profileImage) {
        localStorage.setItem("userProfileImage", profileImage)
      }

      setSuccessMessage("Profile updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error saving profile:", error)
      setErrors({ 
        general: error.response?.data?.message || "Failed to save profile. Please try again." 
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
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
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "UN"
  }

  return (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="max-w-4xl mx-auto mb-6">
        <button
          onClick={() => (onBack ? onBack() : navigate(-1))}
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
                  className={`w-full px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${
                    errors.fullName
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
                  className={`w-full px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${
                    errors.email
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
                  className={`w-full px-4 py-2.5 border rounded-xl font-medium focus:outline-none focus:ring-2 transition-all ${
                    errors.phone
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
                  Location
                </label>
                <input
                  id="location"
                  name="location"
                  type="text"
                  placeholder="City, Country"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2.5 border border-slate-300 rounded-xl font-medium focus:outline-none focus:ring-2 focus:ring-teal-200 transition-all"
                />
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
    </div>
  )
}
