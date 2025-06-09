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
  AppBar,
  Toolbar,
  TextField,
  MenuItem,
  Button,
} from "@mui/material";
import { useParams } from "react-router-dom";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import logo from "../src/img/logo.png";

const TableLeaveUser = () => {
  const { tec_id } = useParams();
  const [leaveData, setLeaveData] = useState([]);
  const [userData, setUserData] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;
  const [filters, setFilters] = useState({
    leave_type: "",
    absence_date: "",
    last_leave_date: "",
  });

  const Root = styled("div")(() => ({
    backgroundColor: "#fdf3e3",
    minHeight: "100vh",
  }));

  const Header = styled(AppBar)(() => ({
    backgroundColor: "#87ceeb",
    color: "#fff",
    padding: 16,
  }));

  const Footer = styled("footer")(({ theme }) => ({
    padding: theme.spacing(2),
    textAlign: "center",
    marginTop: theme.spacing(39),
    backgroundColor: "#fafafa",
    color: "#555",
  }));

  const FilterContainer = styled("div")(() => ({
    display: "flex",
    gap: "10px",
    marginBottom: "16px",
    justifyContent: "center",
  }));

  const resetFilters = () => {
    setFilters({
      absence_date: "",
      last_leave_date: "",
      leave_type: "",
    });
  };

  useEffect(() => {
    fetch(`${process.env.REACT_APP_API_URL}/leaverecords/${tec_id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          // เรียงข้อมูลจาก leave_id ล่าสุดไปเก่าสุด
          const sortedData = data.data.sort((a, b) => b.leave_id - a.leave_id);

          setLeaveData(sortedData);

          // ดึงชื่อและตำแหน่งของผู้ใช้
          if (sortedData.length > 0) {
            setUserData({
              tec_name: sortedData[0].tec_name,
              position: sortedData[0].position,
            });
          }
        }
      })
      .catch((err) => console.error("Error fetching leave records: ", err));
  }, [tec_id]);

  const handleFilterChange = (event) => {
    setFilters({ ...filters, [event.target.name]: event.target.value });
  };

  const filteredRows = leaveData.filter(
    (row) =>
      (filters.leave_type === "" || row.leave_type === filters.leave_type) &&
      (filters.absence_date === "" ||
        row.absence_date.includes(filters.absence_date)) &&
      (filters.last_leave_date === "" ||
        row.last_leave_date.includes(filters.last_leave_date))
  );

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
          ตารางการลาของ {userData?.tec_name || "ไม่ระบุ"}
        </Typography>

        <FilterContainer>
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
          <TextField
            type="date"
            label="วันที่เริ่มลา"
            name="absence_date"
            value={filters.absence_date}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <TextField
            type="date"
            label="วันที่ลาล่าสุด"
            name="last_leave_date"
            value={filters.last_leave_date}
            onChange={handleFilterChange}
            InputLabelProps={{ shrink: true }}
            size="small"
          />
          <Button variant="contained" color="secondary" onClick={resetFilters}>
            รีเซ็ต
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ fontWeight: "bold" }}
            onClick={() => (window.location = "/user")}
          >
            ย้อนกลับ
          </Button>
        </FilterContainer>

        <TableContainer component={Paper} sx={{ mt: 2 }}>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: "#1976d2" }}>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ตำแหน่ง
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  ประเภทการลา
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  เขียนที่
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  วันที่เริ่มลา
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  วันที่ลาล่าสุด
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  เบอร์โทร
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  รายละเอียดการลา
                </TableCell>
                <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                  สถานะการอนุมัติ
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {currentRows.map((row) => (
                <TableRow key={row.leave_id}>
                  <TableCell>{row.position}</TableCell>
                  <TableCell>{row.leave_type}</TableCell>
                  <TableCell>{row.written_at}</TableCell>
                  <TableCell>{row.absence_date}</TableCell>
                  <TableCell>{row.last_leave_date}</TableCell>
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

export default TableLeaveUser;
