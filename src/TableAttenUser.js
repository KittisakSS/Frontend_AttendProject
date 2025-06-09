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
  AppBar,
  Pagination,
  Toolbar,
  TextField,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { styled } from "@mui/material/styles";

import Avatar from "@mui/material/Avatar";
import logo from "../src/img/logo.png";

const TableAttendanceUser = () => {
  const { tec_id } = useParams();
  const [attendanceData, setAttendanceData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [filters, setFilters] = useState({
    date_in: "",
    date_out: "",
  });

  const Root = styled("div")(({ theme }) => ({
    backgroundColor: "#fdf3e3",
    minHeight: "100vh",
  }));

  const Header = styled(AppBar)(({ theme }) => ({
    backgroundColor: "#87ceeb",
    color: "#fff",
    padding: theme.spacing(3),
  }));

  const Footer = styled("footer")(({ theme }) => ({
    padding: theme.spacing(2),
    textAlign: "center",
    marginTop: theme.spacing(10),
    backgroundColor: "#fafafa",
    color: "#555",
  }));

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/attendance/${tec_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          const sortedData = data.data.sort(
            (a, b) => new Date(b.Datetime_IN) - new Date(a.Datetime_IN)
          );
          setAttendanceData(sortedData);
          setFilteredData(sortedData);
        }
      })
      .catch((err) => console.error("Error fetching attendance data: ", err));

    fetch(`${process.env.REACT_APP_API_URL}/user/${tec_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          setUserData(data.data);
        }
      })
      .catch((err) => console.error("Error fetching user data: ", err));
  }, [tec_id]);

  useEffect(() => {
    let filtered = attendanceData.filter((row) => {
      return (
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
    setFilters({ date_in: "", date_out: "" });
  };

  const formatDateTime = (datetime) => {
    if (!datetime) return "ไม่ระบุ";
    return new Date(datetime).toLocaleString("th-TH", {
      timeZone: "Asia/Bangkok",
      hour12: false,
    });
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
        <Typography
          variant="h5"
          mt={4}
          mb={2}
          align="center"
          sx={{ fontWeight: "bold" }}
        >
          ตารางลงเวลาเข้า-ออกงาน
        </Typography>

        <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
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
          <Button variant="contained" color="secondary" onClick={resetFilters}>
            รีเซ็ตตัวกรอง
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ fontWeight: "bold" }}
            onClick={() => (window.location = "/user")}
          >
            ย้อนกลับ
          </Button>
        </div>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ชื่อ
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ตำแหน่ง
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  เวลาเข้างาน
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  เวลาออกงาน
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  สถานที่เข้างาน
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  สถานที่ออกงาน
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
  {filteredData.map((row, index) => {
    // ตรวจสอบว่ามาสายหรือไม่
    let isLate = false;
    if (row.Datetime_IN) {
      const inTime = new Date(row.Datetime_IN);
      const lateThreshold = new Date(inTime);
      lateThreshold.setHours(10, 0, 0, 0);
      isLate = inTime > lateThreshold;
    }

    return (
      <TableRow
        key={index}
        sx={{
          backgroundColor: isLate ? "#ffcccc" : index % 2 === 0 ? "#f0f8ff" : "#fff",
        }}
      >
        <TableCell>{userData?.tec_name || "ไม่ระบุ"}</TableCell>
        <TableCell>{userData?.position || "ไม่ระบุ"}</TableCell>
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

export default TableAttendanceUser;
