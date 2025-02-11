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
} from "@mui/material";
import Avatar from "@mui/material/Avatar";
import Grid from "@mui/material/Grid";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const TableAttendance = () => {
  const [attendanceData, setAttendanceData] = useState([]);
  const [userData, setUserData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const [lateCount, setLateCount] = useState(0); // นับจำนวนคนที่มาสาย

  useEffect(() => {
    // Fetch Attendance data
    fetch("http://localhost:3333/attendance")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setAttendanceData(
            data.data.sort((a, b) => new Date(b.Datetime_IN) - new Date(a.Datetime_IN))
          );
        }
      })
      .catch((err) => console.error("Error fetching attendance data: ", err));

    // Fetch Users data for matching position
    fetch("http://localhost:3333/users")
      .then((res) => res.json())
      .then((data) => {
        setUserData(data);
      })
      .catch((err) => console.error("Error fetching users data: ", err));
  }, []);

  useEffect(() => {
    // คำนวณจำนวนคนที่มาสาย
    const countLate = attendanceData.filter((row) => {
      if (!row.Datetime_IN) return false;
      const inTime = new Date(row.Datetime_IN);
      const lateThreshold = new Date(inTime);
      lateThreshold.setHours(10, 0, 0, 0);
      return inTime > lateThreshold;
    }).length;
    setLateCount(countLate);
  }, [attendanceData]);

  const formatDateTime = (datetime) => {
    if (!datetime) return "ไม่ระบุ";
    return new Date(datetime).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour12: false,
    });
  };

  const generatePDF = () => {
    const input = document.getElementById("attendance-table");
    html2canvas(input, { scale: 2, useCORS: true }).then((canvas) => {
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");
      const pageWidth = pdf.internal.pageSize.getWidth();
      const imgWidth = pageWidth - 20;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, "PNG", 10, 10, imgWidth, imgHeight);
      pdf.save("attendance-report.pdf");
    });
  };

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
  };

  const getPosition = (tec_id) => {
    const user = userData.find((user) => user.tec_id === tec_id);
    return user ? user.position : "ไม่ระบุ";
  };

  const isLate = (datetime) => {
    if (!datetime) return false;
    const inTime = new Date(datetime);
    const lateThreshold = new Date(inTime);
    lateThreshold.setHours(10, 0, 0, 0);
    return inTime > lateThreshold;
  };

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = attendanceData.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <Container>
      <Grid item xs={12} sx={{ backgroundColor: "#a6dcef", display: "flex", alignItems: "center", padding: "16px 32px" }}>
        <Avatar sx={{ bgcolor: "#fff", marginRight: 2 }}>LOGO</Avatar>
        <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
          ระบบลงเวลาปฏิบัติงานราชการโรงเรียนวัดราชภัฏศรัทธาธรรม
        </Typography>
      </Grid>

      <Typography variant="h5" mt={4} align="center" sx={{ fontWeight: "bold" }}>
        ตารางลงเวลาเข้า-ออกงาน
      </Typography>
      <TableContainer
        component={Paper}
        id="attendance-table"
        sx={{ mt: 2, border: "1px solid #ccc", borderRadius: 2, padding: "16px", maxWidth: "100%", margin: "auto" }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ID</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>Tec_id</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ชื่อ</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>ตำแหน่ง</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>เวลาเข้างาน</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>เวลาออกงาน</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>สถานที่เข้างาน</TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>สถานที่ออกงาน</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRows.map((row, index) => (
              <TableRow
                key={row.attendance_id}
                sx={{
                  backgroundColor: isLate(row.Datetime_IN) ? "#ffcccc" : index % 2 === 0 ? "#f0f8ff" : "#fff",
                }}
              >
                <TableCell>{row.attendance_id}</TableCell>
                <TableCell>{row.tec_id}</TableCell>
                <TableCell>{row.tec_name}</TableCell>
                <TableCell>{getPosition(row.tec_id)}</TableCell>
                <TableCell>{formatDateTime(row.Datetime_IN)}</TableCell>
                <TableCell>{formatDateTime(row.Datetime_OUT)}</TableCell>
                <TableCell>{row.Location_IN}</TableCell>
                <TableCell>{row.Location_OUT}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Typography variant="body1" align="center" mt={2}>
        จำนวนคนที่มาสาย: <strong>{lateCount}</strong> คน
      </Typography>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        <Pagination
          count={Math.ceil(attendanceData.length / rowsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}>
        <Button variant="contained" color="warning" sx={{ marginRight: "8px", fontWeight: "bold" }} onClick={generatePDF}>
          พิมพ์รายการ
        </Button>
        <Button variant="contained" color="error" sx={{ fontWeight: "bold" }} onClick={() => (window.location = "/users")}>
          ย้อนกลับ
        </Button>
      </div>
    </Container>
  );
};

export default TableAttendance;
