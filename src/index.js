import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import App from './App';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Login from "./Login.js"
import AttendanceSystem from './AttendanceSystem.js';
import Register from "./Register.js"
import Tableattendance from "./Tableattendance.js"
import UserManagement from './UserManagement.js';
import LeaveSystem from './LeaveSystem.js';
import AttenSystemUser from './AttenSystemUser.js';
import TableAttendanceUser from './TableAttenUser.js';
import TableLeaveRecords from './TableLeaveRecords.js';
import TableLeaveUser from './TableLeaveUser.js';
import AttendSystemDirect from './AttendSystemDirect.js';
import TableLeaveDirect from './TableLeaveDirect.js';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/login" element={<Login />} />
      <Route path="/users" element={<AttendanceSystem />} />
      <Route path="/register" element={<Register />} />
      <Route path="/atten" element={<Tableattendance />} />-
      <Route path="/usermanage" element={<UserManagement />} />
      <Route path="/leave" element={<LeaveSystem />} />
      <Route path="/user" element={<AttenSystemUser />} />
      <Route path="/atten/:tec_id" element={<TableAttendanceUser />} />
      <Route path="/leaverecords" element={<TableLeaveRecords />} />
      <Route path="/leavedirect" element={<TableLeaveDirect />} />
      <Route path="/leavrecuser/:tec_id" element={<TableLeaveUser />} />
      <Route path="/director" element={<AttendSystemDirect />} />

    </Routes>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
