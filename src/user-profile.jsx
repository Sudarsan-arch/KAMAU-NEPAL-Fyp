"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Camera, Mail, Phone, MapPin, CheckCircle2, ArrowLeft } from "lucide-react"

export default function UserProfile({ onBack }) {
  const [profileImage, setProfileImage] = useState(null)

  const handleImageUpload = (e) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setProfileImage(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {onBack && (
        <div className="max-w-4xl mx-auto mb-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-gray-700 hover:text-teal-600 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back to Dashboard</span>
          </button>
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto">
        <Card>
          <CardHeader>
            <CardTitle>User Profile</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Profile Picture Section */}
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-32 w-32">
                  <AvatarImage src={profileImage || "/placeholder.svg"} alt="Profile picture" />
                  <AvatarFallback className="text-2xl">UN</AvatarFallback>
                </Avatar>
                <label
                  htmlFor="profile-upload"
                  className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
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
              <p className="text-sm text-muted-foreground">Click to upload profile picture</p>
            </div>

            {/* Personal Information */}
            <div className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" placeholder="Enter your username" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="fullname">Full Name</Label>
                <Input id="fullname" placeholder="Enter your full name" />
              </div>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Information</h3>

              <div className="grid gap-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input id="email" type="email" placeholder="your.email@example.com" required />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="phone" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  Phone Number
                </Label>
                <Input id="phone" type="tel" placeholder="+1 (555) 000-0000" />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="location" className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Location
                </Label>
                <Input id="location" placeholder="City, Country" />
              </div>
            </div>

            {/* User Analytics */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">User Analytics</h3>
              <Card className="bg-muted/50">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Total Bookings</span>
                    <span className="text-2xl font-bold">0</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Account Verification */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Verification</h3>
              <div className="flex items-center gap-2 p-4 bg-muted/50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-500" />
                <span className="text-green-600 dark:text-green-500 font-medium">Verified</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <Button className="flex-1">Save Changes</Button>
              <Button variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
