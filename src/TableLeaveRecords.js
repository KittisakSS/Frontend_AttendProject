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
} from "@mui/material";

const TableLeaveRecords = () => {
  const [leaveData, setLeaveData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 6;

  useEffect(() => {
    fetch("http://localhost:3333/leaverecords")
      .then((res) => res.json())
      .then((data) => {
        if (data.status === "ok") {
          // ดึงข้อมูลการลาและเพิ่มฟิลด์ tec_name, position
          const fetchTecDetails = async () => {
            const updatedData = await Promise.all(
              data.data.map(async (record) => {
                try {
                  const response = await fetch(
                    `http://localhost:3333/user/${record.tec_id}`
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
            setLeaveData(updatedData);
          };

          fetchTecDetails();
        }
      })
      .catch((err) => console.error("Error fetching leave records: ", err));
  }, []);

  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentRows = leaveData.slice(indexOfFirstRow, indexOfLastRow);

  const handlePageChange = (event, page) => {
    setCurrentPage(page); //คือทำไมลบไม่ได้
  };

  const handleUser = (event) => {
    event.preventDefault();
    window.location = "/users";
  };

  return (
    <Container>
      <Typography
        variant="h5"
        mt={4}
        align="center"
        sx={{ fontWeight: "bold" }}
      >
        ตารางการลางาน
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
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                ID
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                ชื่อ
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                ตำแหน่ง
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                ประเภทการลา
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                วันที่เขียน
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                วันที่เริ่มลา
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                วันที่สิ้นสุด
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                เบอร์โทร
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                สถานะการลา
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                สถานะการอนุมัติ
              </TableCell>
              <TableCell sx={{ color: "#fff", fontWeight: "bold" }}>
                บทบาท
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {currentRows.map((row, index) => (
              <TableRow
                key={row.leave_id}
                sx={{ backgroundColor: index % 2 === 0 ? "#f0f8ff" : "#fff" }}
              >
                <TableCell>{row.leave_id}</TableCell>
                <TableCell>{row.tec_name}</TableCell>
                <TableCell>{row.position}</TableCell>
                <TableCell>{row.leave_type}</TableCell>
                <TableCell>{row.written_at}</TableCell>
                <TableCell>
                  {new Date(row.absence_date).toLocaleDateString("th-TH")}
                </TableCell>
                <TableCell>
                  {new Date(row.last_leave_date).toLocaleDateString("th-TH")}
                </TableCell>
                <TableCell>{row.phone}</TableCell>
                <TableCell>{row.leave_status}</TableCell>
                <TableCell>{row.approval_status}</TableCell>
                <TableCell>{row.role}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}
      >
        <Pagination
          count={Math.ceil(leaveData.length / rowsPerPage)}
          page={currentPage}
          onChange={handlePageChange}
          color="primary"
        />
      </div>

      <div
        style={{ display: "flex", justifyContent: "center", marginTop: "16px" }}
      >
        <Button
          variant="contained"
          color="error"
          sx={{ fontWeight: "bold" }}
          onClick={handleUser}
        >
          ย้อนกลับ
        </Button>
      </div>
    </Container>
  );
};

export default TableLeaveRecords;
