import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import { PieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import Swal from "sweetalert2";
import logo from "../src/img/logo.png"

import { TextField } from "@mui/material";

import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";
import dayjs from "dayjs";
import "dayjs/locale/th";
import buddhistEra from "dayjs/plugin/buddhistEra";
import { registerTHSarabunNew } from "./fonts/THSarabunNew_base64"; // ปรับตาม path ของคุณ
import TablePagination from '@mui/material/TablePagination';


const Root = styled("div")(({ theme }) => ({
  backgroundColor: "#fdf3e3",
  minHeight: "100vh",
}));

const Header = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#87ceeb",
  color: "#fff",
  padding: theme.spacing(3),
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#fff",
  padding: theme.spacing(3),
  borderRadius: 10,
  boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(4),
}));

const Clock = styled(Box)(({ theme }) => ({
  fontSize: "2.5rem",
  color: "#228b22",
  fontWeight: "bold",
  margin: theme.spacing(4, 0),
  textAlign: "center",
}));

const Footer = styled("footer")(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  marginTop: theme.spacing(26),
  backgroundColor: "#fafafa",
  color: "#555",
}));

const COLORS = ["#4caf50", "#ff9800", "#f44336", "#2196f3"];

const AttendSystemDirect = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [leaveData, setLeaveData] = useState([]);
  const [pieChartData, setPieChartData] = useState([]);
  // const [dateFilter, setDateFilter] = useState("today");
  // ในส่วนของ useState เพิ่มตัวแปรสำหรับกรองข้อมูล
const [filteredAttendanceData, setFilteredAttendanceData] = useState([]);
const [filterDate, setFilterDate] = useState(""); // สำหรับเก็บค่าวันที่กรอง
  const [totalPresent, setTotalPresent] = useState(0);
  const [ApprovedLeaveCount, setApprovedLeaveCount] = useState(0);

const today = new Date();
const [filterDay, setFilterDay] = useState(today.getDate().toString().padStart(2, "0"));
const [filterMonth, setFilterMonth] = useState((today.getMonth() + 1).toString().padStart(2, "0"));
const [filterYear, setFilterYear] = useState(today.getFullYear().toString());


  const [filterStartDate, setFilterStartDate] = useState("");
const [filterEndDate, setFilterEndDate] = useState("");
  const [lateCount, setLateCount] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);
  const [userData, setUserData] = useState({
    tec_id: "",
    tec_name: "",
    role: "",
    t_profile: "",
    position: "",
  });

  const [page, setPage] = useState(0);
const [rowsPerPage, setRowsPerPage] = useState(5); // หรือ 10, 20 ตามต้องการ

const [leavePage, setLeavePage] = useState(0);
const [leaveRowsPerPage, setLeaveRowsPerPage] = useState(5);

const [allUsers, setAllUsers] = useState([]);


  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`${process.env.REACT_APP_API_URL}/authen`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        // console.log("Role received from API:", data.user.role); // Debug log
  
        if (data.status === "ok") {
          if (data.user.role !== "director") {
            alert("คุณไม่มีสิทธิ์เข้าถึงหน้านี้");
            window.location = "/login";
          } else {
            setUserData(data.user);
          }
        } else {
          alert("Authentication failed");
          localStorage.removeItem("token");
          window.location = "/login";
        }
      })
      .catch((error) => console.error("Error:", error));
  }, []);  

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("password"); // ✅ ลบรหัสผ่านออก
    window.location = "/login";
  };

  const handleNavigation = (path) => {
    window.location = path;
  };

  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleCheckIn = () => {
      const savedPassword = localStorage.getItem("password");
    
      Swal.fire({
        title: "ยืนยันการลงเวลาเข้า",
        input: "password",
        inputPlaceholder: "กรอกรหัสผ่าน...",
        showCancelButton: true,
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
        inputAttributes: {
          autocapitalize: "off",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const enteredPassword = result.value;
    
          if (enteredPassword !== savedPassword) {
            Swal.fire("ผิดพลาด!", "รหัสผ่านไม่ถูกต้อง", "error");
            return;
          }
    
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const { latitude, longitude } = position.coords;
    
              fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              )
                .then((res) => res.json())
                .then((data) => {
                  const locationIn = data.display_name;
    
                  fetch(`${process.env.REACT_APP_API_URL}/checkin`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      tec_id: userData.tec_id,
                      tec_name: userData.tec_name,
                      location_in: locationIn,
                    }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.status === "ok") {
                        Swal.fire("สำเร็จ!", "ลงเวลาเข้าทำงานเรียบร้อย", "success");
                      } else {
                        Swal.fire("ผิดพลาด!", "Error: " + data.message, "error");
                      }
                    })
                    .catch((err) => {
                      console.error("Fetch error:", err);
                      Swal.fire(
                        "ผิดพลาด!",
                        "ไม่สามารถลงเวลาเข้าได้ โปรดลองอีกครั้ง",
                        "error"
                      );
                    });
                })
                .catch((err) =>
                  console.error("Error fetching location data:", err)
                );
            });
          } else {
            Swal.fire("ผิดพลาด!", "เบราว์เซอร์ของคุณไม่รองรับ Geolocation", "error");
          }
        }
      });
    };
  
    const handleCheckOut = () => {
      const savedPassword = localStorage.getItem("password");
    
      Swal.fire({
        title: "ยืนยันการลงเวลาออก",
        input: "password",
        inputPlaceholder: "กรอกรหัสผ่าน...",
        showCancelButton: true,
        confirmButtonText: "ตกลง",
        cancelButtonText: "ยกเลิก",
        inputAttributes: {
          autocapitalize: "off",
        },
      }).then((result) => {
        if (result.isConfirmed) {
          const enteredPassword = result.value;
    
          if (enteredPassword !== savedPassword) {
            Swal.fire("ผิดพลาด!", "รหัสผ่านไม่ถูกต้อง", "error");
            return;
          }
    
          if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
              const { latitude, longitude } = position.coords;
    
              fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
              )
                .then((res) => res.json())
                .then((data) => {
                  const locationOut = data.display_name;
    
                  fetch(`${process.env.REACT_APP_API_URL}/checkout`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      tec_id: userData.tec_id,
                      location_out: locationOut,
                    }),
                  })
                    .then((res) => res.json())
                    .then((data) => {
                      if (data.status === "ok") {
                        Swal.fire("สำเร็จ!", "ลงเวลาออกงานเรียบร้อย", "success");
                      } else {
                        Swal.fire("ผิดพลาด!", "Error: " + data.message, "error");
                      }
                    })
                    .catch((err) => {
                      console.error("Fetch error:", err);
                      Swal.fire(
                        "ผิดพลาด!",
                        "ไม่สามารถลงเวลาออกงานได้ โปรดลองอีกครั้ง",
                        "error"
                      );
                    });
                })
                .catch((err) =>
                  console.error("Error fetching location data:", err)
                );
            });
          } else {
            Swal.fire("ผิดพลาด!", "เบราว์เซอร์ของคุณไม่รองรับ Geolocation", "error");
          }
        }
      });
    };

    useEffect(() => {
      const fetchAttendanceData = async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/attendance`);
          const data = await res.json();
          if (data.status === "ok") {
            const sortedData = data.data.sort(
              (a, b) => new Date(b.Datetime_IN) - new Date(a.Datetime_IN)
            );
            setAttendanceData(sortedData);
          }
        } catch (error) {
          console.error("Error fetching attendance data:", error);
        }
      };
    
      const fetchLeaveData = async () => {
        try {
          const res = await fetch(`${process.env.REACT_APP_API_URL}/leaverecords`);
          const data = await res.json();
          if (data.status === "ok") {
            const updatedData = await Promise.all(
              data.data.map(async (record) => {
                try {
                  const userRes = await fetch(
                    `${process.env.REACT_APP_API_URL}/user/${record.tec_id}`
                  );
                  const userData = await userRes.json();
                  if (userData.status === "ok") {
                    return {
                      ...record,
                      tec_name: userData.data.tec_name,
                      position: userData.data.position,
                    };
                  }
                } catch {
                  return {
                    ...record,
                    tec_name: "ไม่พบข้อมูล",
                    position: "ไม่พบข้อมูล",
                  };
                }
                return record;
              })
            );
    
            setLeaveData(updatedData.sort((a, b) => b.leave_id - a.leave_id));
    
            const approvedCount = updatedData.filter(
              (record) => record.approval_status === "อนุมัติการลา"
            ).length;
            setApprovedLeaveCount(approvedCount);
          }
        } catch (error) {
          console.error("Error fetching leave data:", error);
        }
      };
    
      fetchAttendanceData();
      fetchLeaveData();
    }, []);
    
    // กำหนดค่าของ filteredLeaveData ก่อนที่มันจะถูกใช้
    const validUserIds = new Set(allUsers.map(user => user.tec_id));
    const filteredLeaveData = leaveData.filter((record) => {
      const recordDateRaw = record.absence_date.split(" - ")[0];
      const date = new Date(recordDateRaw);
      const day = date.getDate().toString().padStart(2, "0");
      const month = (date.getMonth() + 1).toString().padStart(2, "0");
      const year = date.getFullYear().toString();
    
      const matchDay = filterDay ? day === filterDay : true;
      const matchMonth = filterMonth ? month === filterMonth : true;
      const matchYear = filterYear ? year === filterYear : true;
    
      const matchStart = filterStartDate ? date >= new Date(filterStartDate) : true;
      const matchEnd = filterEndDate ? date <= new Date(filterEndDate) : true;
    
      return (
        validUserIds.has(record.tec_id) &&  
        matchDay &&
        matchMonth &&
        matchYear &&
        matchStart &&
        matchEnd &&
        record.approval_status === "อนุมัติการลา"
      );
    });
        
    

useEffect(() => {
  const fetchPieChartData = () => {
    const presentSet = new Set();
    const lateSet = new Set();

    filteredAttendanceData.forEach((record) => {
      if (record.Datetime_IN) {
        const inTime = new Date(record.Datetime_IN);
        const lateThreshold = new Date(inTime);
        lateThreshold.setHours(8, 30, 0, 0);
        presentSet.add(record.tec_id);
        if (inTime >= lateThreshold) {
          lateSet.add(record.tec_id);
        }
      }
    });

    const leaveSet = new Set();
    filteredLeaveData.forEach((record) => {
      if (record.approval_status === "อนุมัติการลา") {
        leaveSet.add(record.tec_id);
      }
    });

    const validUserIds = new Set(allUsers.map(user => user.tec_id));
    const allUserIds = new Set(attendanceData
      .filter(record => validUserIds.has(record.tec_id))
      .map(record => record.tec_id)
    );
    const totalAbsent = [...allUserIds].filter(
      (id) => !presentSet.has(id) && !leaveSet.has(id)
    ).length;

    const newPieData = [
      { name: "มา", value: presentSet.size },
      { name: "สาย", value: lateSet.size },
      { name: "ขาด", value: totalAbsent },
      { name: "ลา", value: leaveSet.size },
    ];

    setPieChartData(prev => JSON.stringify(prev) === JSON.stringify(newPieData) ? prev : newPieData);
    setTotalPresent(presentSet.size);
    setLateCount(lateSet.size);
    setTotalAbsent(totalAbsent);
    setApprovedLeaveCount(leaveSet.size);
  };

  fetchPieChartData();
}, [filteredAttendanceData, attendanceData, filteredLeaveData,]);



    
    const formatDate = (datetime) => {
      if (!datetime) return "ไม่ระบุ";
      return new Date(datetime).toLocaleDateString("th-TH", {
        timeZone: "Asia/Bangkok",
      });
    };
    
    // ฟังก์ชันสำหรับการกรองข้อมูล
    useEffect(() => {
  let filteredData = attendanceData;

  filteredData = filteredData.filter((record) => {
    const date = new Date(record.Datetime_IN);
    const recordDay = date.getDate().toString().padStart(2, "0");
    const recordMonth = (date.getMonth() + 1).toString().padStart(2, "0");
    const recordYear = date.getFullYear().toString();

    const matchDay = filterDay ? recordDay === filterDay : true;
    const matchMonth = filterMonth ? recordMonth === filterMonth : true;
    const matchYear = filterYear ? recordYear === filterYear : true;

    return matchDay && matchMonth && matchYear;
  });

  if (filterDate) {
    filteredData = filteredData.filter((record) => {
      const recordDate = new Date(record.Datetime_IN).toISOString().split("T")[0];
      return recordDate === filterDate;
    });
  }
  
  filteredData = filteredData.filter(record => validUserIds.has(record.tec_id));

  setFilteredAttendanceData(filteredData);
  setPage(0); // รีเซ็ตหน้าทุกครั้งที่กรองใหม่
}, [filterDate, attendanceData, filterDay, filterMonth, filterYear]);
 

useEffect(() => {
  fetch(`${process.env.REACT_APP_API_URL}/users`)
  .then((res) => res.json())
  .then((data) => {
    const filtered = data.filter(user => user.role === "user" || user.role === "director");
    setAllUsers(filtered);})
    .catch((err) => console.error("Error fetching users:", err));
}, []);

// ฟังก์ชันหาจำนวนวันทำงานในเดือนนั้น (ไม่รวมเสาร์-อาทิตย์)
function getWorkingDaysInMonth(month, year) {
  const daysInMonth = new Date(year, month, 0).getDate();
  let workDays = 0;
  for (let day = 1; day <= daysInMonth; day++) {
    const current = new Date(year, month - 1, day);
    const dayOfWeek = current.getDay(); // 0=Sun, 6=Sat
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      workDays++;
    }
  }
  return workDays;
}


function summarizeMonthlyByPerson(attendanceData, leaveData, allUsers, month, year) {
  const workDays = getWorkingDaysInMonth(month, year); // ไม่รวมเสาร์-อาทิตย์
  const summary = [];

  allUsers.forEach(user => {
    const userAttendance = attendanceData.filter(
      (a) =>
        a.tec_id === user.tec_id &&
        new Date(a.Datetime_IN).getMonth() + 1 === parseInt(month) &&
        new Date(a.Datetime_IN).getFullYear() === parseInt(year)
    );

    const presentDates = new Set();
    let lateCount = 0;

    userAttendance.forEach(record => {
      const date = new Date(record.Datetime_IN);
      const dateStr = date.toISOString().split('T')[0];
      presentDates.add(dateStr);

      const hour = date.getHours();
      const minute = date.getMinutes();
      if (hour > 8 || (hour === 8 && minute > 30)) {
        lateCount++;
      }
    });

const leaveDates = new Set();

leaveData.forEach(leave => {
  if (
    leave.tec_id === user.tec_id &&
    leave.approval_status === "อนุมัติการลา"
  ) {
    // ✅ กรณี leave.absence_date = "2025-07-30 - 2025-08-01"
    let [startStr, endStr] = leave.absence_date.split(" - ").map(s => s.trim());

    // ✅ fallback กรณีไม่มี endStr เช่น ลา 1 วัน (ใช้วันเดียวกัน)
    if (!endStr) endStr = startStr;

    const start = new Date(startStr);
    const end = new Date(endStr);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const isWorkDay = d.getDay() !== 0 && d.getDay() !== 6;
      const isInMonth =
        d.getMonth() + 1 === parseInt(month) &&
        d.getFullYear() === parseInt(year);
      if (isWorkDay && isInMonth) {
        leaveDates.add(d.toISOString().split('T')[0]);
      }
    }
  }
});


    const totalPresent = presentDates.size;
    const totalLeave = leaveDates.size;
    const totalAbsent = workDays - totalPresent - totalLeave;

    summary.push({
      name: user.tec_name,
      present: totalPresent,
      late: lateCount,
      absent: totalAbsent,
      leave: totalLeave,
    });
  });

  return summary;
}


const generatePDF = (attendanceData, leaveData, summaryData, filterDay, filterMonth, filterYear, allUsers) => {
  const doc = new jsPDF("p", "mm", "a4");

if (filterYear && filterMonth && !filterDay) {
  // 👉 สรุปรายบุคคลสำหรับรายเดือน
  const monthlySummary = summarizeMonthlyByPerson(attendanceData, leaveData, allUsers, filterMonth, filterYear);

    // ลงทะเบียนฟอนต์
  registerTHSarabunNew(doc);
  doc.setFont("THSarabunNew", "normal");

// ✅ แปลงเลขเดือนเป็นภาษาไทย
const thaiMonths = [
  "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];
const thaiMonth = thaiMonths[parseInt(filterMonth, 10) - 1];
const thaiYear = (parseInt(filterYear, 10) + 543).toString();

// ✅ หัวเรื่องสำหรับรายเดือน
doc.setFont("THSarabunNew", "normal");
doc.setFontSize(16);
doc.text("บัญชีลงเวลาข้าราชการครูและบุคลากรสถานศึกษา", 105, 15, { align: "center" });
doc.text(`ประจำเดือน ${thaiMonth} ${thaiYear} โรงเรียนวัดราษฎร์ศรัทธาธรรม`, 105, 23, { align: "center" });
// doc.text("โรงเรียนวัดราษฎร์ศรัทธาธรรม", 105, 31, { align: "center" });

doc.setFont("THSarabunNew", "normal");
doc.setFontSize(12);

  autoTable(doc, {
    startY: 30,
    head: [["ลำดับ", "ชื่อ", "มาปฏิบัติงาน", "มาสาย", "ขาด", "ลา"]],
    body: monthlySummary
    .filter(item => item && item.name)  // กรอง null/undefined และวัตถุไม่มีชื่อ
    .map((item, index) => [
      index + 1,
      item.name,
      item.present,
      item.late,
      item.absent,
      item.leave,
    ]),
    styles: {
      font: "THSarabunNew",
      fontStyle: "normal",
      fontSize: 12,
    },
    headStyles: {
      font: "THSarabunNew",
      fontStyle: "normal",
      fontSize: 12,
      fillColor: [41, 128, 185],
      textColor: 255,
    },
  });

  // ✅ ลายเซ็น
  const y = doc.lastAutoTable.finalY + 20;
  doc.text("ลงชื่อ.............................................", 140, y);
  doc.text("(ผู้อำนวยการโรงเรียนวัดราษฎร์ศรัทธาธรรม)", 125, y + 7);

  doc.save("รายงานลงเวลารายเดือน.pdf");
  return; // ⛔ จบการทำงานตรงนี้ ไม่ต้องไปพิมพ์แบบรายวัน
}

  dayjs.locale("th");
dayjs.extend(buddhistEra);

  // ลงทะเบียนฟอนต์
  registerTHSarabunNew(doc);
  doc.setFont("THSarabunNew", "normal");

  // ✅ ดึงวันที่จาก filter หรือใช้ปัจจุบัน
  let displayDate;
  if (filterYear || filterMonth || filterDay) {
    const year = filterYear || dayjs().year().toString();
    const month = filterMonth || "01";
    const day = filterDay || "01";
    displayDate = dayjs(`${year}-${month}-${day}`);
  } else {
    displayDate = dayjs();
  }

  // ✅ กำหนดข้อความหัวรายงานตาม filter
  let dateLabel = "";
  if (filterYear && filterMonth && filterDay) {
    dateLabel = `ประจำวัน ${displayDate.format("D MMMM BBBB")}`;
  } else if (filterYear && filterMonth) {
    dateLabel = `ประจำเดือน ${displayDate.format("MMMM BBBB")}`;
  } else if (filterYear) {
    dateLabel = `ประจำปี ${displayDate.format("BBBB")}`;
  } else {
    dateLabel = `ประจำวัน ${displayDate.format("D MMMM BBBB")}`;
  }

  // หัวเรื่อง
  doc.setFontSize(18);
  doc.text("บัญชีลงเวลาข้าราชการครูและบุคลากรสถานศึกษา", 105, 15, { align: "center" });

  doc.setFontSize(14);
  // doc.text(`ประจำวัน ${dayjs().format("D MMMM BBBB")} โรงเรียนวัดราษฎร์ศรัทธาธรรม`, 105, 23, { align: "center" });
  doc.text(`${dateLabel} โรงเรียนวัดราษฎร์ศรัทธาธรรม`, 105, 23, { align: "center" });

  // ตารางลงเวลา
  autoTable(doc, {
    startY: 30,
    head: [["ลำดับ", "ชื่อ", "วันที่", "เวลามา", "เวลากลับ"]], // ✅ เพิ่ม "วันที่"
    body: attendanceData.map((record, i) => [
      i + 1,
      record.tec_name,
      dayjs(record.Datetime_IN).format("DD/MM/YYYY"), // ✅ แสดงวันที่จาก Datetime_IN
      dayjs(record.Datetime_IN).format("HH:mm"),
      record.Datetime_OUT ? dayjs(record.Datetime_OUT).format("HH:mm") : "-",
    ]),
    styles: {
      font: "THSarabunNew",
      fontStyle: "normal",
      fontSize: 12,
    },
    headStyles: {
      font: "THSarabunNew",
      fontStyle: "normal",
      fontSize: 12,
      fillColor: [41, 128, 185],
      textColor: 255,
    },
  });
  

  // ตารางการลา
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 10,
    head: [["ลำดับ", "ชื่อ", "ประเภทการลา", "วันที่", "สถานะ"]],
    body: leaveData.map((record, i) => [
      i + 1,
      record.tec_name,
      record.leave_type,
      record.absence_date,
      record.approval_status,
    ]),
    styles: {
      font: "THSarabunNew",
      fontStyle: "normal",
      fontSize: 12,
    },
    headStyles: {
      font: "THSarabunNew",
      fontStyle: "normal",
      fontSize: 12,
      fillColor: [41, 128, 185],
      textColor: 255,
    },
  });
  

  // สรุปผล
const totalUsers = allUsers.length;
  const summaryStartY = doc.lastAutoTable.finalY + 15;
  doc.setFontSize(14);
  doc.text(`ข้าราชการทั้งหมด: ${totalUsers} คน`, 14, summaryStartY);
  doc.text(`มาปฏิบัติงาน: ${summaryData.present}`, 14, summaryStartY + 8);
  doc.text(`มาสาย: ${summaryData.late}`, 70, summaryStartY + 8);
  doc.text(`ขาด: ${summaryData.absent}`, 130, summaryStartY + 8);
  doc.text(`ลา: ${summaryData.leave}`, 14, summaryStartY + 16);

  // ลายเซ็น
  doc.text("ลงชื่อ.............................................", 140, summaryStartY + 35);
  doc.text("(ผู้อำนวยการโรงเรียนวัดราษฎร์ศรัทธาธรรม)", 125, summaryStartY + 42);

  // บันทึกไฟล์
  doc.save("รายงานลงเวลา.pdf");
};

  const currentDateText = currentTime.toLocaleDateString("th-TH", {
  day: "numeric",
  month: "long",
  year: "numeric"
});
    
useEffect(() => {
  const today = new Date();
  const day = today.getDate().toString().padStart(2, "0");
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const year = today.getFullYear().toString();

  setFilterDay((prev) => prev || day);
  setFilterMonth((prev) => prev || month);
  setFilterYear((prev) => prev || year);
}, []);




  return (
    <Root>
      <Header position="static">
        <Toolbar>
        <Avatar 
       src={logo} 
       sx={{ width: 70, height: 70, marginRight: 2 }} 
      alt="Logo"/>
          <Typography variant="h5" color="black" fontWeight="bold">
            ระบบลงเวลาปฏิบัติงานราชการโรงเรียนวัดราษฎร์ศรัทธาธรรม
          </Typography>
        </Toolbar>
      </Header>

      <Container>
        <ProfileCard>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Box
                component="img"
                src={
                  userData.t_profile
                    ? `${process.env.REACT_APP_API_URL}/uploads/${userData.t_profile}`
                    : "https://via.placeholder.com/100" // Default image
                }
                alt="profile"
                width={120}
                height={120}
                borderRadius="50%"
                boxShadow="0px 3px 10px rgba(0,0,0,0.1)"
              />
            </Grid>
            <Grid item>
              <Typography variant="h5" fontWeight="bold">
                {userData.tec_name || "ชื่อผู้ใช้งาน"}
              </Typography>
              <Typography color="textSecondary" variant="subtitle1">
                {userData.position || "ตำแหน่งงาน"}
              </Typography>
            </Grid>
          </Grid>
          <Button
            variant="outlined"
            color="primary"
            sx={{ fontWeight: "bold", px: 2 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </ProfileCard>

        <Clock>{currentDateText} - {currentTime.toLocaleTimeString("th-TH", { hour12: false })}</Clock>


        <Grid container justifyContent="center" spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
                sx={{
                    backgroundColor: "#28a745",  // เขียว
                    color: "#fff",
                    fontWeight: "bold",
                    px: 3,
                    py: 1,
                    '&:hover': { backgroundColor: "#218838" }
                  }}
              onClick={handleCheckIn}
            >
              ลงเวลาเข้างาน
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              sx={{
                backgroundColor: "#007bff",  // น้ำเงิน
                color: "#fff",
                fontWeight: "bold",
                px: 3,
                py: 1,
                '&:hover': { backgroundColor: "#0069d9" }
              }}
              onClick={handleCheckOut}
            >
              ลงเวลาออกงาน
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#ffc107",  // เหลือง
                color: "#000",
                fontWeight: "bold",
                px: 3,
                py: 1,
                '&:hover': { backgroundColor: "#e0a800" }
              }}
              onClick={() => handleNavigation("/leave")}
            >
              ลาราชการ
            </Button>
          </Grid>
        </Grid>

        <Grid container justifyContent="center" spacing={2} mt={3} >
                  {/* <Grid item>
                    <Button variant="outlined" color="primary" sx={{ fontWeight: 'bold', px: 2 }}>
                      โหลดไฟล์ใบลา
                    </Button>
                  </Grid> */}
                  <Grid item>
                    <Button
                      variant="outlined"
                      sx={{
                        backgroundColor: "#6f42c1",  // ม่วง
                        color: "#fff",
                        fontWeight: "bold",
                        px: 3,
                        py: 1,
                        '&:hover': { backgroundColor: "#5936a2" }
                      }}
                      onClick={() => handleNavigation("/atten")}
                    >
                      ดูรายการเข้าออก
                    </Button>
                    </Grid> 
                  <Grid item>        
                    <Button
                      variant="outlined"
                      mr={5}
                      sx={{
                        backgroundColor: "#17a2b8",  // ฟ้าอ่อน
                        color: "#fff",
                        fontWeight: "bold",
                        px: 3,
                        py: 1,
                        '&:hover': { backgroundColor: "#138496" }
                      }}
                      onClick={() => handleNavigation("/leaverecords")}
                    >
                      ดูรายการลา
                    </Button>
                  </Grid>
                  <Grid item>        
                    <Button
                      variant="outlined"
                      sx={{
                        backgroundColor: "#5a5c69",
                        color: "#fff",
                        fontWeight: "bold",
                        px: 3,
                        py: 1,
                        '&:hover': {
                          backgroundColor: "#138496",
                        },
                      }}
                      onClick={() =>
                        generatePDF(
                          filteredAttendanceData,
                          filteredLeaveData,
                          {
                            total: attendanceData.length,
                            present: totalPresent,
                            late: lateCount,
                            absent: totalAbsent,
                            leave: ApprovedLeaveCount,
                          },
                          filterDay,
                          filterMonth,
                          filterYear,
                          allUsers  // ✅ เพิ่มตรงนี้!
                        )
                      }>
                    พิมพ์รายงาน
                  </Button>
                  </Grid>
                </Grid>
      </Container>
      <Container>
        {/* Pie Chart Section */}
        <Card sx={{ padding: 3, marginTop: 4 }}>
          <Typography variant="h6" textAlign="center" gutterBottom>
            สถิติการเข้าเรียน/การลา
          </Typography>
    <Grid container spacing={2} alignItems="flex-start">
      {/* ฟอร์มตัวกรอง */}
      <Grid item xs={12} md={6} sx={{ width: "100%", maxWidth: 400 }}>
        <Grid container spacing={2}>
          {/* วัน */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>วัน</InputLabel>
              <Select
                value={filterDay || ""}
                onChange={(e) => setFilterDay(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "วัน" }}
              >
                <MenuItem value="">ทั้งหมด</MenuItem>
                {[...Array(31)].map((_, i) => {
                  const val = (i + 1).toString().padStart(2, "0");
                  return (
                    <MenuItem key={val} value={val}>
                      {i + 1}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>

          {/* เดือน */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>เดือน</InputLabel>
              <Select
                value={filterMonth || ""}
                onChange={(e) => setFilterMonth(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "เดือน" }}
              >
                <MenuItem value="">ทั้งหมด</MenuItem>
                {[...Array(12)].map((_, i) => {
                  const val = (i + 1).toString().padStart(2, "0");
                  return (
                    <MenuItem key={val} value={val}>
                      {i + 1}
                    </MenuItem>
                  );
                })}
              </Select>
            </FormControl>
          </Grid>

          {/* ปี */}
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel shrink>ปี</InputLabel>
              <Select
                value={filterYear || ""}
                onChange={(e) => setFilterYear(e.target.value)}
                displayEmpty
                inputProps={{ "aria-label": "ปี" }}
              >
                <MenuItem value="">ทั้งหมด</MenuItem>
                {Array.from(
                  {
                    length:
                      new Date().getFullYear() + 543 - 2565 + 1,
                  },
                  (_, i) => {
                    const buddhistYear = 2565 + i;
                    const gregorianYear = (2565 + i - 543).toString();
                    return (
                      <MenuItem key={buddhistYear} value={gregorianYear}>
                        {buddhistYear}
                      </MenuItem>
                    );
                  }
                )}
              </Select>
            </FormControl>
          </Grid>

          {/* ปุ่มรีเซ็ต */}
          <Grid item xs={12}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => {
                setFilterDay("");
                setFilterMonth("");
                setFilterYear("");
              }}
            >
              รีเซ็ต
            </Button>
          </Grid>
        </Grid>
      </Grid>

      {/* Pie Chart */}
      <Grid
        item
        xs={12}
        md={6}
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "flex-start",
        }}
      >
        <PieChart width={300} height={300}>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={100}
            fill="#8884d8"
            dataKey="value"
          >
            {pieChartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={COLORS[index % COLORS.length]}
              />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </Grid>
    </Grid>
        </Card>

        {/* Attendance Table */}
        <Card sx={{ padding: 3, marginTop: 4 }}>
          <Typography variant="h6" gutterBottom>
            ตารางลงเวลาเข้า-ออกงาน
          </Typography>
             {/* ตัวกรองวันที่ */}
    <Box sx={{ marginBottom: 2, display: "flex", justifyContent: "flex-end" }}>
      <input
        type="date"
        value={filterDate}
        onChange={(e) => setFilterDate(e.target.value)}
        style={{ padding: "8px", borderRadius: "4px", border: "1px solid #ccc" }}
      />
    </Box>
    <div style={{ display: "flex", gap: "15px" }}>
              <Typography
                variant="h6"
                color="success"
                fontWeight="bold"
                align="center"
                mt={2}
              >
                จำนวนคนที่มา: {totalPresent} คน
              </Typography>
              <Typography
                variant="h6"
                color="error"
                fontWeight="bold"
                align="center"
                mt={2}
              >
                จำนวนคนที่มาสาย: {lateCount} คน
              </Typography>
              <Typography
                variant="h6"
                color="error"
                fontWeight="bold"
                align="center"
                mt={2}
              >
                จำนวนคนที่ขาด: {totalAbsent} คน
              </Typography>
            </div>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>ชื่อ</TableCell>
                  <TableCell>วันที่</TableCell>
                  <TableCell>เวลาเข้า</TableCell>
                  <TableCell>เวลาออก</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
  {filteredAttendanceData
    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
    .map((record, index) => (
      <TableRow key={index}>
        <TableCell>{record.tec_name}</TableCell>
        <TableCell>{formatDate(record.Datetime_IN)}</TableCell>
        <TableCell>
          {new Date(record.Datetime_IN).toLocaleTimeString("th-TH", {
            timeZone: "Asia/Bangkok",
          })}
        </TableCell>
        <TableCell>
          {record.Datetime_OUT
            ? new Date(record.Datetime_OUT).toLocaleTimeString("th-TH", {
                timeZone: "Asia/Bangkok",
              })
            : "-"}
        </TableCell>
      </TableRow>
    ))}
</TableBody>
            </Table>
      <TablePagination
        rowsPerPageOptions={[5, 10, 20]}
        component="div"
        count={filteredAttendanceData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(event, newPage) => setPage(newPage)}
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="รายการที่แสดง"
        labelDisplayedRows={({ from, to, count }) =>
          `${from}–${to} ของ ${count !== -1 ? count : `มากกว่า ${to}`}`
        }
      />
          </TableContainer>
        </Card>

    {/* Leave Table */}
    <Card sx={{ padding: 3, marginTop: 4 }}>
      <Typography variant="h6" gutterBottom>
        ตารางการลา
      </Typography>
      <Typography variant="h6" align="center" sx={{ fontWeight: "bold", mt: 2 ,mb:2}}>
      จำนวนการลาทั้งหมด: {filteredLeaveData.length} ครั้ง
    </Typography>
      <TextField
        label="วันที่เริ่มต้น"
        type="date"
        value={filterStartDate}
        onChange={(e) => setFilterStartDate(e.target.value)}
        InputLabelProps={{ shrink: true }} // ✅ เพิ่มบรรทัดนี้
        sx={{ marginRight: 2 }}
      />
      <TextField
        label="วันที่สิ้นสุด"
        type="date"
        value={filterEndDate}
        onChange={(e) => setFilterEndDate(e.target.value)}
        InputLabelProps={{ shrink: true }} // ✅ เพิ่มบรรทัดนี้
      />
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ชื่อ</TableCell>
              <TableCell>ประเภทการลา</TableCell>
              <TableCell>วันที่ลา</TableCell>
              <TableCell>สถานะ</TableCell>
              <TableCell>สถานะการอนุมัติ</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
        {filteredLeaveData
          .slice(leavePage * leaveRowsPerPage, leavePage * leaveRowsPerPage + leaveRowsPerPage)
          .map((record, index) => (
            <TableRow key={index}>
                <TableCell>{record.tec_name}</TableCell>
                <TableCell>{record.leave_type}</TableCell>
                <TableCell>{record.absence_date}</TableCell>
                <TableCell>{record.leave_status}</TableCell>
                <TableCell>{record.approval_status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
<TablePagination
  rowsPerPageOptions={[5, 10, 20]}
  component="div"
  count={filteredLeaveData.length}
  rowsPerPage={leaveRowsPerPage}
  page={leavePage}
  onPageChange={(event, newPage) => setLeavePage(newPage)}
  onRowsPerPageChange={(event) => {
    setLeaveRowsPerPage(parseInt(event.target.value, 10));
    setLeavePage(0);
  }}
  labelRowsPerPage="รายการที่แสดง"
  labelDisplayedRows={({ from, to, count }) =>
    `${from}–${to} ของ ${count !== -1 ? count : `มากกว่า ${to}`}`
  }
/>
      </TableContainer>
    </Card>
      </Container>
      <Footer>
          <Typography variant="body2">
            © {new Date().getFullYear()} โรงเรียนวัดราษฎร์ศรัทธาธรรม
          </Typography>
        </Footer>
    </Root>
  );
};

export default AttendSystemDirect;
