import { lazy } from 'react'
import { ROLES } from '../constants/roles'

// Employee pages
const EmployeeDashboard = lazy(() => import('../features/employee/EmployeeDashboard'))
const Attendance = lazy(() => import('../features/employee/Attendance'))
const LeaveRequest = lazy(() => import('../features/employee/LeaveRequest'))
const Rewards = lazy(() => import('../features/employee/Rewards'))

// HR pages
const HRDashboard = lazy(() => import('../features/hr/HRDashboard'))
const Employees = lazy(() => import('../features/hr/Employees'))
const AttendanceManagement = lazy(() => import('../features/hr/AttendanceManagement'))
const LeaveApproval = lazy(() => import('../features/hr/LeaveApproval'))
const Reports = lazy(() => import('../features/hr/Reports'))
const AIInsights = lazy(() => import('../features/hr/AIInsights'))

// Admin pages
const AdminDashboard = lazy(() => import('../features/admin/AdminDashboard'))
const Branches = lazy(() => import('../features/admin/Branches'))
const Departments = lazy(() => import('../features/admin/Departments'))
const Shifts = lazy(() => import('../features/admin/Shifts'))

// Shared page
const Settings = lazy(() => import('../features/shared/Settings'))

const routesConfig = [
  // Employee
  { path: '/employee/dashboard', component: EmployeeDashboard, label: 'Dashboard', allowedRoles: [ROLES.EMPLOYEE], showInSidebar: true },
  { path: '/employee/attendance', component: Attendance, label: 'Attendance', allowedRoles: [ROLES.EMPLOYEE], showInSidebar: true },
  { path: '/employee/leave-request', component: LeaveRequest, label: 'Leave Request', allowedRoles: [ROLES.EMPLOYEE], showInSidebar: true },
  { path: '/employee/rewards', component: Rewards, label: 'Rewards', allowedRoles: [ROLES.EMPLOYEE], showInSidebar: true },
  { path: '/employee/settings', component: Settings, label: 'Settings', allowedRoles: [ROLES.EMPLOYEE], showInSidebar: true },

  // HR
  { path: '/hr/dashboard', component: HRDashboard, label: 'Dashboard', allowedRoles: [ROLES.HR], showInSidebar: true },
  { path: '/hr/employees', component: Employees, label: 'Employees', allowedRoles: [ROLES.HR], showInSidebar: true },
  { path: '/hr/attendance', component: AttendanceManagement, label: 'Attendance', allowedRoles: [ROLES.HR], showInSidebar: true },
  { path: '/hr/leave-approval', component: LeaveApproval, label: 'Leave Approval', allowedRoles: [ROLES.HR], showInSidebar: true },
  { path: '/hr/reports', component: Reports, label: 'Reports', allowedRoles: [ROLES.HR], showInSidebar: true },
  { path: '/hr/ai-insights', component: AIInsights, label: 'AI Insights', allowedRoles: [ROLES.HR], showInSidebar: true },
  { path: '/hr/settings', component: Settings, label: 'Settings', allowedRoles: [ROLES.HR], showInSidebar: true },

  // Admin
  { path: '/admin/dashboard', component: AdminDashboard, label: 'Dashboard', allowedRoles: [ROLES.ADMIN], showInSidebar: true },
  { path: '/admin/branches', component: Branches, label: 'Branches', allowedRoles: [ROLES.ADMIN], showInSidebar: true },
  { path: '/admin/departments', component: Departments, label: 'Departments', allowedRoles: [ROLES.ADMIN], showInSidebar: true },
  { path: '/admin/shifts', component: Shifts, label: 'Shifts', allowedRoles: [ROLES.ADMIN], showInSidebar: true },
  { path: '/admin/settings', component: Settings, label: 'Settings', allowedRoles: [ROLES.ADMIN], showInSidebar: true },
]

export default routesConfig