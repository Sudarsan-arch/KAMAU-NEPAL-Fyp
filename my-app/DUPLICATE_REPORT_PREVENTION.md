# Duplicate Report Prevention

## Summary
Implemented comprehensive duplicate report prevention to ensure a professional cannot report the same customer twice.

---

## Backend Changes

### 1. Report Controller Updates ✅
**File:** `Backend/controllers/reportController.js`

**Changes:**

#### A. Duplicate Check in `createReport`
```javascript
// Check if this reporter has already reported this target
const existingReport = await Report.findOne({
  reporter,
  reporterModel,
  target,
  targetModel
});

if (existingReport) {
  return res.status(409).json({ 
    success: false, 
    message: 'You have already reported this person. Our admin team is reviewing your previous report.' 
  });
}
```

#### B. Service Completion Check for Customers
```javascript
// Enforce "after service only" reporting for Users (customers)
if (targetModel === 'User' && reporterModel === 'Professional') {
  const completedBooking = await Booking.findOne({
    userId: target,
    professionalId: reporter,
    status: 'Completed'
  });

  if (!completedBooking) {
    return res.status(403).json({ 
      success: false, 
      message: 'You can only report a customer after a service has been completed.' 
    });
  }
}
```

#### C. New Endpoint: `checkExistingReport`
```javascript
GET /api/reports/check/:reporterId/:targetId
Query params: reporterModel, targetModel

Response:
{
  success: true,
  hasReported: boolean,
  report: Report | null
}
```

**Purpose:** Allows frontend to check if a report already exists before showing the report button.

---

### 2. Report Model Updates ✅
**File:** `Backend/models/reportModel.js`

**Changes:**

#### A. Added New Report Reasons
- Fake Booking
- No Show
- Unreasonable Demands

#### B. Database Indexes
```javascript
// Index for faster duplicate report checking
reportSchema.index({ 
  reporter: 1, 
  target: 1, 
  reporterModel: 1, 
  targetModel: 1 
});

// Index for admin queries
reportSchema.index({ 
  status: 1, 
  createdAt: -1 
});
```

**Benefits:**
- Faster duplicate detection
- Improved query performance
- Better scalability

---

### 3. Report Route Updates ✅
**File:** `Backend/reportRoute.js`

**Added Route:**
```javascript
router.get('/check/:reporterId/:targetId', checkExistingReport);
```

---

## Frontend Changes

### 1. State Management ✅
**File:** `Frontend/src/Dashboardsection/Mybookings.jsx`

**Added State:**
```javascript
const [reportedCustomers, setReportedCustomers] = useState(() => {
    try { 
        return JSON.parse(localStorage.getItem('reportedCustomers') || '[]'); 
    }
    catch { 
        return []; 
    }
});
```

**Purpose:** Track which customers have been reported (persisted in localStorage)

---

### 2. Report Submission Handler ✅

**Updated `handleReportCustomer`:**
```javascript
if (response.data.success) {
    // Add to reported customers list
    const updatedReported = [...reportedCustomers, reviewBooking.userId];
    setReportedCustomers(updatedReported);
    localStorage.setItem('reportedCustomers', JSON.stringify(updatedReported));
    
    setReportSuccess(true);
    toast.success('Report submitted successfully');
}
```

**Features:**
- Saves reported customer ID to localStorage
- Updates state immediately
- Shows success message
- Prevents duplicate reports in same session

---

### 3. Review Modal Updates ✅

**Updated `openReviewModal`:**
```javascript
const openReviewModal = async (booking) => {
    // ... existing code ...
    
    // Check if this customer has already been reported
    const reporterId = localStorage.getItem('userId');
    if (reporterId && booking.userId) {
        try {
            const response = await axios.get(
                `/api/reports/check/${reporterId}/${booking.userId}?reporterModel=Professional&targetModel=User`
            );
            if (response.data.success && response.data.hasReported) {
                // Add to local state if not already there
                if (!reportedCustomers.includes(booking.userId)) {
                    const updatedReported = [...reportedCustomers, booking.userId];
                    setReportedCustomers(updatedReported);
                    localStorage.setItem('reportedCustomers', JSON.stringify(updatedReported));
                }
            }
        } catch (error) {
            console.error('Error checking report status:', error);
            // Continue anyway - don't block the modal
        }
    }
};
```

**Features:**
- Checks database for existing reports
- Syncs with localStorage
- Works across sessions and devices
- Graceful error handling

---

### 4. UI Updates ✅

**Conditional Report Button:**
```javascript
{reportedCustomers.includes(reviewBooking.userId) ? (
    <div className="px-3 py-2 rounded-xl bg-gray-100 text-gray-400 flex items-center gap-1.5 cursor-not-allowed" title="Already reported">
        <Flag size={16} />
        <span className="text-xs font-bold">Reported</span>
    </div>
) : (
    <button 
        onClick={() => {
            setShowReviewModal(false);
            setIsReportModalOpen(true);
        }}
        className="p-2 rounded-xl bg-rose-50 text-rose-600 hover:bg-rose-100 transition flex items-center gap-1.5"
        title="Report Customer"
    >
        <Flag size={16} />
        <span className="text-xs font-bold">Report</span>
    </button>
)}
```

**States:**
- **Active:** Rose/red button, clickable
- **Disabled:** Gray button, shows "Reported", not clickable

---

## User Flow

### First Report
1. Professional completes service with customer
2. Opens "Rate Your Experience" modal
3. Sees active "Report" button
4. Clicks report button
5. Fills out report form
6. Submits report
7. Backend checks for duplicates (none found)
8. Report saved to database
9. Customer ID added to `reportedCustomers` list
10. Button changes to "Reported" (disabled)
11. Success message displayed

### Attempted Duplicate Report
1. Professional opens review modal for same customer
2. Frontend checks localStorage - customer already reported
3. "Reported" button shown (disabled)
4. Professional cannot click to report again

**OR**

1. Professional clears localStorage
2. Opens review modal
3. Frontend calls `/api/reports/check` endpoint
4. Backend finds existing report
5. Customer ID added back to localStorage
6. "Reported" button shown (disabled)

**OR**

1. Professional somehow bypasses frontend checks
2. Submits report via API
3. Backend checks database for existing report
4. Returns 409 Conflict error
5. Error message: "You have already reported this person..."

---

## Error Messages

### 409 Conflict (Duplicate Report)
```
"You have already reported this person. Our admin team is reviewing your previous report."
```

### 403 Forbidden (No Completed Service)
```
"You can only report a customer after a service has been completed."
```

### 400 Bad Request (Missing Fields)
```
"All fields are required"
```

---

## Database Optimization

### Indexes Created
1. **Duplicate Check Index:**
   - Fields: `reporter`, `target`, `reporterModel`, `targetModel`
   - Purpose: Fast duplicate detection
   - Impact: O(1) lookup instead of full table scan

2. **Admin Query Index:**
   - Fields: `status`, `createdAt` (descending)
   - Purpose: Fast admin dashboard queries
   - Impact: Efficient filtering and sorting

---

## Testing Checklist

### Backend Tests
- [ ] Submit first report - should succeed
- [ ] Submit duplicate report - should return 409 error
- [ ] Check existing report endpoint - should return correct status
- [ ] Report without completed service - should return 403 error
- [ ] Report with missing fields - should return 400 error

### Frontend Tests
- [ ] Open review modal - report button should be active
- [ ] Submit report - button should change to "Reported"
- [ ] Close and reopen modal - button should stay "Reported"
- [ ] Clear localStorage and reopen - should fetch from API and show "Reported"
- [ ] Try to report same customer again - button should be disabled
- [ ] Report different customer - button should be active

### Cross-Session Tests
- [ ] Report customer on Device A
- [ ] Login on Device B
- [ ] Open review modal - should show "Reported"
- [ ] Verify localStorage syncs from API

---

## Security Features

1. **Backend Validation:** Primary duplicate check in database
2. **Frontend Prevention:** UI feedback and localStorage tracking
3. **Service Completion Check:** Can only report after completed service
4. **Database Indexes:** Fast duplicate detection
5. **Error Handling:** Graceful degradation if API fails

---

## Performance Impact

- **Database Queries:** +1 query per report submission (duplicate check)
- **API Calls:** +1 call per review modal open (check existing report)
- **localStorage:** Minimal impact, small array of IDs
- **Indexes:** Improved query performance, minimal storage overhead

---

## Future Enhancements

1. **Report Expiry:** Allow re-reporting after X days if issue persists
2. **Report Categories:** Track which type of reports were made
3. **Bulk Check:** Check multiple customers at once
4. **Admin Dashboard:** Show duplicate report attempts
5. **Analytics:** Track false report attempts

---

**Last Updated:** May 5, 2026
