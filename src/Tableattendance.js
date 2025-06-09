import React, { useState, useEffect } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  Button,
  Pagination,
  AppBar,
  Toolbar,
  TextField,
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import { styled } from "@mui/material/styles";

import logo from "../src/img/logo.png";

const Root = styled("div")(() => ({
  backgroundColor: "#fdf3e3",
  minHeight: "100vh",
}));

const Header = styled(AppBar)(() => ({
  backgroundColor: "#87ceeb",
  color: "#fff",
  padding: "16px",
}));

const Footer = styled("footer")(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  marginTop: theme.spacing(2),
  backgroundColor: "#fafafa",
  color: "#555",
}));

const TableAttendance = () => {
  const [role, setRole] = useState(""); // เก็บ role ของผู้ใช้
  const [attendanceData, setAttendanceData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [filters, setFilters] = useState({
    tec_name: "",
    date_in: "",
    date_out: "",
  });
  // const [lateCount, setLateCount] = useState(0); // นับจำนวนคนที่มาสาย

  const [totalPresent, setTotalPresent] = useState(0);
  const [lateCount, setLateCount] = useState(0);
  const [totalAbsent, setTotalAbsent] = useState(0);

  console.log(localStorage.getItem("role"));

  useEffect(() => {
    // โหลด role จาก localStorage เมื่อเปิดหน้านี้
    const storedRole = localStorage.getItem("role");

    if (!storedRole) {
      alert("กรุณาเข้าสู่ระบบก่อน");
      window.location = "/login"; // ถ้าไม่มี role ให้กลับไปหน้า login
    } else {
      setRole(storedRole); // เก็บ role ไว้ใน state
    }
  }, []);

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/attendance`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          const sortedData = data.data.sort(
            (a, b) => b.attendance_id - a.attendance_id
          );
          setAttendanceData(sortedData);
          setFilteredData(sortedData);
        }
      });
    fetch(`${process.env.REACT_APP_API_URL}/users`)
      .then((res) => res.json())
      .then((data) => setUserData(data));
  }, []);

  useEffect(() => {
    let filtered = attendanceData.filter((row) => {
      return (
        (!filters.tec_name || row.tec_name.includes(filters.tec_name)) &&
        (!filters.date_in || row.Datetime_IN?.startsWith(filters.date_in)) &&
        (!filters.date_out || row.Datetime_OUT?.startsWith(filters.date_out))
      );
    });
    setFilteredData(filtered);
  }, [filters, attendanceData]);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const resetFilters = () => {
    setFilters({ tec_name: "", date_in: "", date_out: "" });
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "ไม่ระบุ";
    return new Date(datetime).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour12: false,
    });
  };

  useEffect(() => {
    let onTimeCount = 0;
    let lateCount = 0;
    let presentSet = new Set();

    filteredData.forEach((row) => {
      if (row.Datetime_IN) {
        const inTime = new Date(row.Datetime_IN);
        const lateThreshold = new Date(inTime);
        lateThreshold.setHours(10, 0, 0, 0); // กำหนดให้ 10:00 น. เป็นเส้นแบ่งสาย

        if (inTime >= lateThreshold) {
          lateCount++; // นับเป็นคนที่มาสาย
        } else {
          onTimeCount++; // นับเป็นคนที่มา (และไม่สาย)
        }

        presentSet.add(row.tec_id); // เพิ่มคนที่มาเข้าเซ็ต
      }
    });

    setLateCount(lateCount);
    setTotalPresent(onTimeCount);

    // หารายชื่อผู้ที่ขาดงาน (ไม่นับรวมคนที่มาสาย)
    const allUserIds = new Set(userData.map((user) => user.tec_id));
    const absentSet = new Set(
      [...allUserIds].filter((id) => !presentSet.has(id))
    );
    setTotalAbsent(absentSet.size);
  }, [filteredData, userData]);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredData.slice(indexOfFirstRow, indexOfLastRow);

  const handleBack = () => {
    if (role === "admin") {
      window.location = "/users";
    } else if (role === "director") {
      window.location = "/director";
    } else {
      alert("สิทธิ์ของคุณไม่ถูกต้อง");
    }
  };
  

  return (
    <Root>
      <Header position="static">
        <Toolbar>
          <Avatar
            src={logo}
            sx={{ width: 70, height: 70, marginRight: 2 }}
            alt="Logo"
          />
          <Typography variant="h5" color="black" fontWeight="bold">
            ระบบลงเวลาปฏิบัติงานราชการโรงเรียนวัดราษฎร์ศรัทธาธรรม
          </Typography>
        </Toolbar>
      </Header>
      <Container>
        <Typography variant="h5" mt={4} mb={2} align="center" fontWeight="bold">
          ตารางลงเวลาเข้า-ออกงาน
        </Typography>
        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
          <TextField
            label="ชื่อ"
            name="tec_name"
            variant="outlined"
            size="small"
            onChange={handleFilterChange}
            value={filters.tec_name}
          />
          <TextField
            label="เวลาเข้า"
            name="date_in"
            type="date"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
            onChange={handleFilterChange}
            value={filters.date_in}
          />
          <TextField
            label="เวลาออก"
            name="date_out"
            type="date"
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
            onChange={handleFilterChange}
            value={filters.date_out}
          />
          <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
            <Button
              variant="contained"
              color="secondary"
              onClick={resetFilters}
            >
              รีเซ็ตตัวกรอง
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ fontWeight: "bold" }}
              onClick={handleBack}
            >
              ย้อนกลับ
            </Button>
          </div>
        </div>
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
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                {/* <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell> */}
                {/* <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Tec_id</TableCell> */}
                <TableCell
                  sx={{ width: "120px", color: "#fff", fontWeight: "bold" }}
                >
                  ชื่อ
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ตำแหน่ง
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  เวลาเข้า
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  เวลาออก
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  สถานที่เข้า
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  สถานที่ออก
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRows.map((row) => {
                const inTime = row.Datetime_IN
                  ? new Date(row.Datetime_IN)
                  : null;
                const isLate = inTime && inTime.getHours() >= 10; // ตรวจสอบว่ามาสาย

                return (
                  <TableRow
                    key={row.attendance_id}
                    sx={{ backgroundColor: isLate ? "#ffcccc" : "inherit" }} // เปลี่ยนสีเป็นแดงถ้ามาสาย
                  >
                    <TableCell>{row.tec_name}</TableCell>
                    <TableCell>
                      {userData.find((u) => u.tec_id === row.tec_id)
                        ?.position || "-"}
                    </TableCell>
                    <TableCell>{formatDateTime(row.Datetime_IN)}</TableCell>
                    <TableCell>{formatDateTime(row.Datetime_OUT)}</TableCell>
                    <TableCell>{row.Location_IN}</TableCell>
                    <TableCell>{row.Location_OUT}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        <Pagination
          count={Math.ceil(filteredData.length / rowsPerPage)}
          page={currentPage}
          onChange={(e, page) => setCurrentPage(page)}
          color="primary"
          sx={{ marginTop: "16px", display: "flex", justifyContent: "center" }}
        />
      </Container>
      <Footer>
        <Typography variant="body2">
          © {new Date().getFullYear()} โรงเรียนวัดราษฎร์ศรัทธาธรรม
        </Typography>
      </Footer>
    </Root>
  );
};

export default TableAttendance;
