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
import Avatar from "@mui/material/Avatar";
import logo from "../src/img/logo.png"

const Root = styled("div")({
  backgroundColor: "#fdf3e3",
  minHeight: "100vh",
});

const Header = styled(AppBar)({
  backgroundColor: "#87ceeb",
  color: "#fff",
  padding: 16,
});

const LeaveFormCard = styled(Card)({
  backgroundColor: "#fff",
  padding: 24,
  borderRadius: 10,
  boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
  marginTop: 32,
});

const Footer = styled("footer")({
  padding: 16,
  textAlign: "center",
  marginTop: 32,
  backgroundColor: "#fafafa",
  color: "#555",
});

const LeaveSystem = () => {
    const [role, setRole] = useState(""); // เก็บ role ของผู้ใช้
  const [userData, setUserData] = useState({
    tec_id: "",
    tec_name: "",
    position: "",
  });

  const [leaveData, setLeaveData] = useState({
    leave_type: "",
    written_at: "",
    absence_date: "",
    last_leave_date: "", // จะดึงจากฐานข้อมูลอัตโนมัติ
    phone: "",
    leave_status: "", // ช่องกรอกรายละเอียดการลา
    approval_status: "ยังไม่อนุมัติการลา",
  });

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
        if (data.status === "ok") {
          setUserData(data.user);

          // ดึงวันที่ลาล่าสุดจากฐานข้อมูล
          // Debug ก่อนตั้งค่า last_leave_date
          fetch(`${process.env.REACT_APP_API_URL}/last_leave/${data.user.tec_id}`)
            .then((res) => res.json())
            .then((leaveData) => {
              console.log("Last Leave API Response:", leaveData);
              setLeaveData((prev) => ({
                ...prev,
                last_leave_date: leaveData.last_leave_date || "ไม่มีข้อมูล",
              }));
            })
            .catch((err) => console.error("Error fetching last leave:", err));
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

  const handleChangeDateRange = (start, end) => {
    setLeaveData((prev) => ({
      ...prev,
      absence_date: `${start} - ${end}`, // เก็บช่วงวันที่ในรูปแบบข้อความ
    }));
  };

  const handleSubmit = () => {
    const requiredFields = [
      "leave_type",
      "written_at",
      "absence_date",
      "phone",
      "leave_status",
    ];
  
    // ตรวจสอบฟิลด์ใน leaveData
    for (let field of requiredFields) {
      if (!leaveData[field]) {
        alert(`กรุณากรอกข้อมูล ${field} ให้ครบถ้วน`);
        return;
      }
    }
  
    // ตรวจสอบฟิลด์ใน userData (เช่น position)
    if (!userData.position) {
      alert("กรุณากรอกข้อมูลตำแหน่งให้ครบถ้วน");
      return;
    }
  
    // ตรวจสอบช่วงวันที่
    const [start, end] = leaveData.absence_date.split(" - ");
    if (!start || !end) {
      alert("กรุณาระบุช่วงวันที่ให้ครบถ้วน");
      return;
    }
  
    fetch(`${process.env.REACT_APP_API_URL}/leave`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...leaveData,
        tec_id: userData.tec_id,
        tec_name: userData.tec_name,
        position: userData.position,
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
            last_leave_date: leaveData.last_leave_date, // ดึงจาก state เดิม
            phone: "",
            leave_status: "",
            approval_status: "ยังไม่อนุมัติการลา",
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
  
  const handleBack = () => {
    if (role === "admin") {
      window.location = "/users";
    } else if (role === "director") {
      window.location = "/director";
    } else if (role === "user") {
      window.location = "/user";
    } else {
      alert("สิทธิ์ของคุณไม่ถูกต้อง");
    }
  };

  return (
    <Root>
      <Header position="static">
        <Toolbar>
        <Avatar src={logo} sx={{ width: 70, height: 70, marginRight: 2 }} alt="Logo"/>
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
                value={userData.tec_name}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="ตำแหน่ง"
                value={userData.position}
                InputProps={{ readOnly: true }}
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
                <MenuItem value="ลาพักร้อน">ลาพักร้อน</MenuItem>
                <MenuItem value="ลาไปช่วยเหลือภรรยาที่คลอดบุตร">ลาไปช่วยเหลือภรรยาที่คลอดบุตร</MenuItem>
                <MenuItem value="ลาพักผ่อน">ลาพักผ่อน</MenuItem>
                <MenuItem value="การลาอุปสมบทหรือการลาไปประกอบพิธีฮัจย์">การลาอุปสมบทหรือการลาไปประกอบพิธีฮัจย์</MenuItem>
                <MenuItem value="การลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล">การลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล</MenuItem>
                <MenuItem value="การลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน">การลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน</MenuItem>
                <MenuItem value="การลาเข้ารับการตรวจเลือกหรือเข้ารับการเตรียมพล">การลาติดตามคู่สมรส</MenuItem>
                <MenuItem value="การลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน">การลาไปศึกษา ฝึกอบรม ปฏิบัติการวิจัย หรือดูงาน</MenuItem>
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
                label="เบอร์โทรศัพท์"
                name="phone"
                value={leaveData.phone}
                onChange={handleChange}
                fullWidth
              />
            </Grid>

            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="วันที่เริ่มต้น"
                  name="absence_date_start"
                  type="date"
                  value={leaveData.absence_date.split(" - ")[0] || ""}
                  onChange={(e) =>
                    handleChangeDateRange(
                      e.target.value,
                      leaveData.absence_date.split(" - ")[1] || ""
                    )
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="วันที่สิ้นสุด"
                  name="absence_date_end"
                  type="date"
                  value={leaveData.absence_date.split(" - ")[1] || ""}
                  onChange={(e) =>
                    handleChangeDateRange(
                      leaveData.absence_date.split(" - ")[0] || "",
                      e.target.value
                    )
                  }
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                label="วันที่ลาล่าสุด"
                value={leaveData.last_leave_date}
                InputProps={{ readOnly: true }}
                fullWidth
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="รายละเอียดการลา"
                name="leave_status"
                multiline
                rows={3}
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
             <Button
                          variant="contained"
                          color="error"
                          sx={{ fontWeight: "bold", px: 4, py: 1, ml: 2 }}
                          onClick={handleBack}
                        >
                          ย้อนกลับ
                        </Button>
          </Box>
        </LeaveFormCard>

      </Container>
      <Footer>
          <Typography variant="body2">
            © {new Date().getFullYear()} โรงเรียนวัดราษฎร์ศรัทธาธรรม
          </Typography>
        </Footer>
    </Root>
  );
};

export default LeaveSystem;
