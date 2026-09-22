# Site Manager Pro - v2.0

**Professional Android App for Construction Site Expense Management**

## ✨ What's New in v2

### 🎨 Professional Design
- Modern corporate UI with blue color scheme
- Clean dashboard with stat cards
- Professional typography and spacing
- Responsive mobile layout
- Dark borders and proper contrast

### 🚀 Better Organization
- Tab-based navigation (Dashboard, Expenses, Approvals)
- Separate sections for workers and admins
- Clear visual hierarchy
- Professional cards and containers

### 📊 Enhanced Features
- **Dashboard with Real-Time Stats**
  - Total expenses
  - Approved amounts
  - Pending approvals
  - Entry count (admin only)

- **Site & Category Breakdown**
  - View spending by site
  - View spending by category
  - Visual indicators

- **Worker Features**
  - Quick expense submission
  - Track your expenses
  - View approval status
  - Expense history

- **Admin Features**
  - Pending approvals tab
  - All expenses overview
  - Search functionality
  - Filter by status (All, Pending, Approved, Rejected)
  - Approve/reject with one tap
  - Real-time dashboard

### 🔧 Quality Improvements
- Fixed all UI bugs
- Smooth animations
- Better error handling
- Professional error messages
- Proper form validation

## 🎯 Key Improvements Over v1

| Feature | v1 | v2 |
|---------|----|----|
| Design | Basic | Professional |
| Layout | Cluttered | Clean & Organized |
| Tabs | None | Dashboard/Expenses/Approvals |
| Stats | Simple numbers | Professional cards |
| Search | No | Yes (Full text) |
| Filter | Basic | Advanced |
| Status | Colors only | Color + Text |
| Admin View | Confusing | Clear & Organized |
| Performance | Okay | Optimized |

## 📱 Features

### For Workers
✅ Submit expenses with full details
✅ View your expense history
✅ Track approval status
✅ See rejection reasons
✅ Dashboard overview
✅ Search your expenses

### For Admins
✅ Dashboard with all stats
✅ Pending approvals tab
✅ Search across all expenses
✅ Filter by status
✅ Approve/reject expenses
✅ View all expense history
✅ Breakdown by site
✅ Breakdown by category

## 🏗️ Tech Stack
- **Framework**: React Native with Expo
- **Storage**: AsyncStorage (local on device)
- **Build**: EAS Build (cloud)
- **Target**: Android, iOS, Web

## 📋 Installation

### Quick Cloud Build (Recommended)
See SIMPLE_STEPS.txt for 9 easy steps

### Manual Build
```bash
npm install
npx eas login
eas build --platform android --local
```

## 🎨 Design System

### Colors
- **Primary**: #1e40af (Professional Blue)
- **Success**: #059669 (Green)
- **Danger**: #dc2626 (Red)
- **Warning**: #f59e0b (Orange)
- **Text**: #111827 (Dark)
- **Background**: #f3f4f6 (Light Gray)

### Components
- Professional cards with borders
- Tab navigation
- Stat cards with icons
- Status badges with colors
- Action buttons with icons
- Search input with icon
- Filter buttons

## 📊 Data Structure

```json
{
  "id": 1,
  "submittedBy": "John Smith",
  "category": "labour",
  "description": "8 hours excavation work",
  "amount": 800,
  "quantity": 8,
  "rate": 100,
  "date": "2026-09-19",
  "site": "Site A",
  "status": "pending|approved|rejected",
  "submittedDate": "2026-09-19T10:00:00",
  "approvedBy": "Admin",
  "approvedDate": "2026-09-19T14:30:00"
}
```

## 🧪 Test Accounts

### Worker
- Username: `john_worker`
- Password: `test`
- Role: Worker

### Admin
- Username: `admin`
- Password: `test`
- Role: Admin

**Note**: You can use ANY username/password in demo mode

## 🚀 Getting Started

1. **Download all files** from cloud build outputs
2. **Create GitHub account** (free at github.com)
3. **Create Expo account** (free at expo.dev)
4. **Upload files to GitHub**
5. **Add Expo token to GitHub** (Settings → Secrets)
6. **Click "Run workflow"** in GitHub Actions
7. **Wait 10-15 minutes** for build
8. **Download APK** and install on phone

Total time: ~30 minutes

## 📲 Installation on Phone

**Option A: USB Cable**
- Connect phone to PC
- Enable USB Debugging on phone
- File transfers APK
- Open and install

**Option B: Email**
- Email APK to yourself
- Download on phone
- Tap to install

**Option C: Messaging**
- Send via WhatsApp/Telegram
- Download on phone
- Tap to install

## ⚙️ Configuration

### To Change App Name
Edit `app.json`:
```json
{
  "expo": {
    "name": "Your App Name"
  }
}
```

### To Add More Sites
Edit `App.js`, find site list, add:
```javascript
{ label: 'Site D', value: 'Site D' }
```

### To Add Categories
Edit `App.js`, find category list, add:
```javascript
'safety',
'fuel',
'other'
```

## 🐛 Troubleshooting

**Build fails**
→ Check internet connection
→ Try building again (GitHub Actions)

**App crashes on startup**
→ Clear app data and cache
→ Reinstall APK

**Can't install APK**
→ Enable "Install from unknown sources"
→ Check storage space (100MB+)

**Search not working**
→ Refresh the app
→ Check spelling

**Filter buttons not responding**
→ Refresh the screen
→ Log out and back in

## 📞 Support

- **Expo Docs**: https://docs.expo.dev
- **React Native**: https://reactnative.dev
- **EAS Build**: https://docs.expo.dev/build/setup/

## 📝 License

Professional construction management software.

## 🎉 Version History

### v2.0.0 (Latest)
- Complete redesign with professional UI
- Tab-based navigation
- Real-time dashboard
- Search functionality
- Advanced filtering
- Better error handling
- Performance optimization

### v1.0.0
- Initial release
- Basic functionality

---

**Built with ❤️ for construction site management**

Ready to build your professional app? Follow SIMPLE_STEPS.txt!
