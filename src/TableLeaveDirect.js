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
  Pagination,
  Button,
  AppBar,
  Toolbar,
  TextField,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import logo from "../src/img/logo.png";

const TableLeaveDirect = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [filters, setFilters] = useState({
    tec_name: "",
    absence_date: "",
    last_leave_date: "",
    leave_type: "",
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
    marginTop: theme.spacing(4),
    backgroundColor: "#fafafa",
    color: "#555",
  }));

  const FilterContainer = styled("div")(() => ({
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
    justifyContent: "center",
  }));

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/leaverecords`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          const fetchTecDetails = async () => {
            const updatedData = await Promise.all(
              data.data.map(async (record) => {
                try {
                  const response = await fetch(
                    `${process.env.REACT_APP_API_URL}/user/${record.tec_id}`
                  );
                  const result = await response.json();
                  if (result.status === "ok") {
                    return {
                      ...record,
                      tec_name: result.data.tec_name,
                      position: result.data.position,
                    };
                  }
                } catch (error) {
                  console.error("Error fetching user details:", error);
                }
                return {
                  ...record,
                  tec_name: "ไม่พบข้อมูล",
                  position: "ไม่พบข้อมูล",
                };
              })
            );
            setLeaveData(updatedData.sort((a, b) => b.leave_id - a.leave_id));
          };
          fetchTecDetails();
        }
      })
      .catch((err) => console.error("Error fetching leave records: ", err));
  }, []);

  const convertToDateRange = (dateString) => {
    if (!dateString || typeof dateString !== "string") return "";
    const dates = dateString.split(" - ");
    if (dates.length === 2) {
      return `${dates[0]} ถึง ${dates[1]}`;
    }
    return dateString;
  };

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const resetFilters = () => {
    setFilters({
      tec_name: "",
      absence_date: "",
      last_leave_date: "",
      leave_type: "",
    });
  };

  const filteredRows = leaveData.filter((row) => {
    const formattedAbsenceDate = convertToDateRange(row.absence_date);
    const formattedLastLeaveDate = convertToDateRange(row.last_leave_date);

    return (
      (filters.tec_name === "" || row.tec_name.includes(filters.tec_name)) &&
      (filters.absence_date === "" ||
        formattedAbsenceDate.includes(filters.absence_date)) &&
      (filters.last_leave_date === "" ||
        formattedLastLeaveDate.includes(filters.last_leave_date)) &&
      (filters.leave_type === "" || row.leave_type === filters.leave_type)
    );
  });

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = filteredRows.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (event, page) => {
    setCurrentPage(page);
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
          ตารางการลางาน
        </Typography>
        <FilterContainer>
          <TextField
            label="ชื่อ"
            name="tec_name"
            value={filters.tec_name}
            onChange={handleFilterChange}
            size="small"
          />
          <TextField
            type="date"
            label="วันที่เริ่มลา"
            name="absence_date"
            value={filters.absence_date}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
          />
          <TextField
            type="date"
            label="วันที่ลาล่าสุด"
            name="last_leave_date"
            value={filters.last_leave_date}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
          />
          <TextField
            select
            label="ประเภทการลา"
            name="leave_type"
            value={filters.leave_type}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            variant="outlined"
            size="small"
            fullWidth // ใช้ตัวนี้เพื่อให้เต็มพื้นที่ที่มีอยู่
            sx={{ width: 100 }} // หรือกำหนดค่าความกว้างเอง
          >
            <MenuItem value="">ทั้งหมด</MenuItem>
            <MenuItem value="ลาป่วย">ลาป่วย</MenuItem>
            <MenuItem value="ลากิจ">ลากิจ</MenuItem>
            <MenuItem value="ลาคลอด">ลาคลอด</MenuItem>
            <MenuItem value="ลาพักร้อน">ลาพักร้อน</MenuItem>
            <MenuItem value="ลาไปช่วยเหลือภรรยาที่คลอดบุตร">ลาไปช่วยเหลือภรรยาที่คลอดบุตร</MenuItem>
            <MenuItem value="ลาพักผ่อน">ลาพักผ่อน</MenuItem>
            <MenuItem value="การลาอุปสมบทหรือการลาไปประกอบพิธีฮัจย์">การลาอุปสมบทหรือการลาไปประกอบพิธีฮัจย์</MenuItem>
            <MenuItem value="การลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล">การลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล</MenuItem>
            <MenuItem value="การลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน">การลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน</MenuItem>
            <MenuItem value="การลาติดตามคู่สมรส">การลาติดตามคู่สมรส</MenuItem>
            <MenuItem value="การลาไปฟื้นฟูสมรรถภาพด้านอาชีพ">การลาไปฟื้นฟูสมรรถภาพด้านอาชีพ</MenuItem>
          </TextField>
          <Button variant="contained" color="secondary" onClick={resetFilters}>
            รีเซ็ต
          </Button>
          <Button variant="contained" color="error" sx={{ fontWeight: "bold" }} onClick={() => (window.location = "/users")}>
                    ย้อนกลับ
                  </Button>
        </FilterContainer>
        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell
                  sx={{ width: "120px", color: "#fff", fontWeight: "bold" }}
                >
                  ชื่อ
                </TableCell>
                <TableCell
                  sx={{ width: "120px", color: "#fff", fontWeight: "bold" }}
                >
                  ตำแหน่ง
                </TableCell>
                <TableCell
                  sx={{ width: "120px", color: "#fff", fontWeight: "bold" }}
                >
                  ประเภทการลา
                </TableCell>
                <TableCell
                  sx={{ width: "120px", color: "#fff", fontWeight: "bold" }}
                >
                  เขียนที่
                </TableCell>
                <TableCell
                  sx={{ width: "200px", color: "#fff", fontWeight: "bold" }}
                >
                  วันที่เริ่มลา
                </TableCell>
                <TableCell
                  sx={{ width: "200px", color: "#fff", fontWeight: "bold" }}
                >
                  วันที่ลาล่าสุด
                </TableCell>
                <TableCell
                  sx={{ width: "120px", color: "#fff", fontWeight: "bold" }}
                >
                  เบอร์โทร
                </TableCell>
                <TableCell
                  sx={{ width: "120px", color: "#fff", fontWeight: "bold" }}
                >
                  รายละเอียดการลา
                </TableCell>
                <TableCell
                  sx={{ width: "120px", color: "#fff", fontWeight: "bold" }}
                >
                  สถานะการอนุมัติ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRows.map((row) => (
                <TableRow key={row.leave_id}>
                  <TableCell>{row.tec_name}</TableCell>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>{row.leave_type}</TableCell>
                  <TableCell>{row.written_at}</TableCell>
                  <TableCell>{convertToDateRange(row.absence_date)}</TableCell>
                  <TableCell>
                    {convertToDateRange(row.last_leave_date)}
                  </TableCell>
                  <TableCell>{row.phone}</TableCell>
                  <TableCell>{row.leave_status}</TableCell>
                  <TableCell>{row.approval_status}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginTop: "16px",
          }}
        >
          <Pagination
            count={Math.ceil(leaveData.length / rowsPerPage)}
            page={currentPage}
            onChange={handlePageChange}
            color="primary"
          />
        </div>
      </Container>
      <Footer>
        <Typography variant="body2">
          © {new Date().getFullYear()} โรงเรียนวัดราษฎร์ศรัทธาธรรม
        </Typography>
      </Footer>
    </Root>
  );
};

export default TableLeaveDirect;
