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
} from "@mui/material";
import { useParams } from "react-router-dom";

const TableAttendanceUser = () => {
  const { tec_id } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    // Fetch attendance data
    fetch(`http://localhost:3333/attendance/${tec_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setAttendanceData(data.data);
        }
      })
      .catch((err) => console.error("Error fetching attendance data: ", err));

    // Fetch user data (including tec_name and role)
    fetch(`http://localhost:3333/user/${tec_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setUserData(data.data);
        }
      })
      .catch((err) => console.error("Error fetching user data: ", err));
  }, [tec_id]);

  const formatDateTime = (datetime) => {
    if (!datetime) return "ไม่ระบุ";
    return new Date(datetime).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour12: false,
    });
  };

  return (
    <Container>
      <Typography variant="h5" mt={4} align="center" sx={{ fontWeight: "bold" }}>
        ตารางลงเวลาเข้า-ออกงาน (Tec_id: {tec_id}, ชื่อ: {userData?.tec_name || "ไม่ระบุ"}, ตำแหน่ง: {userData?.position || "ไม่ระบุ"})
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          mt: 2,
          border: "1px solid #ccc",
          borderRadius: 2,
          padding: "16px",
          maxWidth: "100%",
          margin: "auto",
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "#1976d2" }}>
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
            {attendanceData.map((row, index) => (
              <TableRow
                key={index}
                sx={{ backgroundColor: index % 2 === 0 ? "#f0f8ff" : "#fff" }}
              >
                <TableCell>{tec_id}</TableCell>
                <TableCell>{userData?.tec_name || "ไม่ระบุ"}</TableCell>
                <TableCell>{userData?.position || "ไม่ระบุ"}</TableCell>
                <TableCell>{formatDateTime(row.Datetime_IN)}</TableCell>
                <TableCell>{formatDateTime(row.Datetime_OUT)}</TableCell>
                <TableCell>{row.Location_IN}</TableCell>
                <TableCell>{row.Location_OUT}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Container>
  );
};

export default TableAttendanceUser;
