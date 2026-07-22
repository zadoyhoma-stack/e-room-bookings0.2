

# ARIT E-ROOMs — Thai University Library Meeting Room Booking System

## Overview
A premium single-page clickable prototype with Apple/Samsung-inspired design: ocean blue + white glassmorphism, smooth animations, full Thai UI copy. Frontend-only with mock data and client-side state.

## Visual Design
- **Color palette**: Ocean blue gradient background (#0077B6 → #00B4D8 → #90E0EF), white/frosted glass cards
- **Glassmorphism**: backdrop-blur-xl, translucent white (bg-white/10 to bg-white/70), soft shadows
- **Typography**: Clean, modern, generous whitespace, rounded corners (16–24px)
- **Animations**: Hover lift effects, subtle glow on CTAs, 250–300ms transitions, fade-in on scroll

## Page Sections (Top to Bottom)

### 1. Sticky Navbar
- Brand logo "ARIT E-ROOMs" on left
- Anchor nav links: ห้องประชุม, ปฏิทินห้องว่าง, วิธีจอง, รายงานปัญหา, ติดต่อ
- Right: "เข้าสู่ระบบ" button (opens mock login modal), "สถานะการจองของฉัน" button (scrolls to bookings)

### 2. Hero Section
- Large headline + subtext in Thai
- Two CTA buttons: "เริ่มจองห้อง" (scroll to booking form) and "ดูห้องว่างวันนี้" (scroll to calendar)
- Floating decorative glass elements (calendar chip, room card preview) for premium feel

### 3. Quick Booking Panel
- Glass card form with: date picker, start/end time dropdowns, participant count dropdown, equipment checkboxes
- "ค้นหาห้องว่าง" button triggers 1s loading state then filters mock rooms

### 4. Room Results Grid
- 6–8 room cards with name, capacity, equipment icons, location, status badge
- "ดูรายละเอียด" → details modal with rules + photo placeholders
- "ส่งคำขอจอง" → confirm modal with meeting topic + notes fields → adds to My Bookings with "รออนุมัติ" status + toast notification

### 5. My Bookings Section
- Table showing all client-side bookings: date, time, room, status, actions
- Cancel button (with confirm modal) sets status to "ยกเลิก"
- "เพิ่มลงปฏิทิน" button shows success toast

### 6. Today Availability / Calendar Section
- Visual timeline showing today's time slots across rooms
- Glass timeline chips showing available/booked slots

### 7. How It Works
- 4 icon-illustrated steps explaining the booking flow

### 8. Report a Problem Form
- Glass card form: room select, problem type, details, urgency level, mock image upload
- Submit shows success toast

### 9. Admin Teaser Cards
- Two glass cards: "อนุมัติ/ปฏิเสธคำขอ" and "รายงานสรุป & สถิติ"
- Click opens mock admin dashboard modal with pending requests list and approve/reject buttons that update booking statuses

### 10. Footer
- Contact info, FAQ links, policy placeholders — all clickable (Coming Soon modals where needed)

## State Management
- React useState for: search filters, filtered rooms, bookings list, modal open/close states
- All interactions are fully clickable — dead buttons show "Coming Soon" modal

## Components Structure
- **Layout**: Navbar, Footer, SectionWrapper
- **Sections**: Hero, QuickBooking, RoomResults, MyBookings, TodayAvailability, HowItWorks, ReportProblem, AdminTeaser
- **Modals**: LoginModal, RoomDetailModal, BookingConfirmModal, CancelConfirmModal, AdminDashboardModal, ComingSoonModal
- **Shared**: GlassCard, StatusBadge, EquipmentIcon, TimeSlotChip

## Mock Data
- 8 rooms with varied capacities (4–20), equipment arrays, statuses, Thai location names
- Empty bookings array populated through user interaction

