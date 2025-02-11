import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  TextField,
  Button,
  MenuItem,
  Card,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const Root = styled("div")(({ theme }) => ({
  backgroundColor: "#fdf3e3",
  minHeight: "100vh",
}));

const Header = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#87ceeb",
  color: "#fff",
  padding: theme.spacing(3),
}));

const LeaveFormCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#fff",
  padding: theme.spacing(3),
  borderRadius: 10,
  boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
  marginTop: theme.spacing(4),
}));

const Footer = styled("footer")(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  marginTop: theme.spacing(4),
  backgroundColor: "#fafafa",
  color: "#555",
}));

const LeaveSystem = () => {
  const [userData, setUserData] = useState({
    tec_id: "",
    tec_name: "",
    role: "",
  });

  const [leaveData, setLeaveData] = useState({
    leave_type: "",
    written_at: "",
    absence_date: "",
    last_leave_date: "",
    phone: "",
    leave_status: "pending", // ช่องกรอกสถานะการลา
    approval_status: "not reviewed",
  });

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3333/authen", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "ok") {
          setUserData(data.user);
        } else {
          alert("Authentication failed");
          localStorage.removeItem("token");
          window.location = "/login";
        }
      })
      .catch((error) => console.error("Error:", error));
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLeaveData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    const requiredFields = [
      "leave_type",
      "written_at",
      "absence_date",
      "last_leave_date",
      "phone",
    ];
    for (let field of requiredFields) {
      if (!leaveData[field]) {
        alert("กรุณากรอกข้อมูลให้ครบถ้วน");
        return;
      }
    }

    fetch("http://localhost:3333/leave", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...leaveData,
        tec_id: userData.tec_id,
        tec_name: userData.tec_name,
        role: userData.role,
      }),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "ok") {
          alert("บันทึกข้อมูลการลาสำเร็จ");
          setLeaveData({
            leave_type: "",
            written_at: "",
            absence_date: "",
            last_leave_date: "",
            phone: "",
            leave_status: "pending", // reset leave_status
            approval_status: "not reviewed",
          });
        } else {
          alert("เกิดข้อผิดพลาด: " + data.message);
        }
      })
      .catch((error) => {
        console.error("Error:", error);
        alert("ไม่สามารถบันทึกข้อมูลการลาได้ โปรดลองอีกครั้ง");
      });
  };

  return (
    <Root>
      <Header position="static">
        <Toolbar>
          <Typography variant="h5" color="black" fontWeight="bold">
            ระบบลาราชการ
          </Typography>
        </Toolbar>
      </Header>

      <Container>
        <LeaveFormCard>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            ข้อมูลผู้ใช้งาน
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="ชื่อผู้ใช้งาน"
                value={userData.tec_name || ""}
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="ตำแหน่ง"
                value={userData.position || ""} // เปลี่ยนจาก role เป็น position
                InputProps={{
                  readOnly: true,
                }}
                fullWidth
              />
            </Grid>
          </Grid>

          <Typography
            variant="h6"
            fontWeight="bold"
            gutterBottom
            sx={{ mt: 4 }}
          >
            ข้อมูลการลา
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="ประเภทการลา"
                name="leave_type"
                select
                value={leaveData.leave_type}
                onChange={handleChange}
                fullWidth
              >
                <MenuItem value="ลาป่วย">ลาป่วย</MenuItem>
                <MenuItem value="ลากิจ">ลากิจ</MenuItem>
                <MenuItem value="ลาคลอด">ลาคลอด</MenuItem>
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="เขียนที่"
                name="written_at"
                value={leaveData.written_at}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="วันที่เริ่มลา"
                name="absence_date"
                type="date"
                value={leaveData.absence_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="วันที่ลาล่าสุด"
                name="last_leave_date"
                type="date"
                value={leaveData.last_leave_date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="เบอร์โทรศัพท์"
                name="phone"
                value={leaveData.phone}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
            {/* เพิ่มช่องกรอกสถานะการลา */}
            <Grid item xs={12} sm={6}>
              <TextField
                label="สถานะการลา"
                name="leave_status"
                value={leaveData.leave_status}
                onChange={handleChange}
                fullWidth
              />
            </Grid>
          </Grid>

          <Box textAlign="center" sx={{ mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ fontWeight: "bold", px: 4, py: 1 }}
              onClick={handleSubmit}
            >
              บันทึกการลา
            </Button>
          </Box>
        </LeaveFormCard>

        <Footer>
          <Typography variant="body2">
            © {new Date().getFullYear()} โรงเรียนวัดราษฎร์ศรัทธาธรรม
          </Typography>
        </Footer>
      </Container>
    </Root>
  );
};

export default LeaveSystem;
