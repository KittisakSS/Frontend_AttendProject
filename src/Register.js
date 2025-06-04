import * as React from "react";
import { useState } from "react";
import Avatar from "@mui/material/Avatar";
import Button from "@mui/material/Button";
import CssBaseline from "@mui/material/CssBaseline";
import TextField from "@mui/material/TextField";
import Link from "@mui/material/Link";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import { createTheme, ThemeProvider } from "@mui/material/styles";

import logo from "../src/img/logo.png";

const theme = createTheme();

export default function SignUp() {
  const [formData, setFormData] = useState({
    tecName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    position: "",
    profileImage: null,
  });

  const handleBack = (event) => {
    event.preventDefault();
    window.location = "/usermanage";
  };
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value, files, type } = e.target;
    if (type === "file") {
      setFormData({
        ...formData,
        [name]: files[0],
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    // ตรวจสอบข้อมูลที่กรอกครบถ้วน
    if (
      !formData.tecName ||
      !formData.email ||
      !formData.password ||
      !formData.confirmPassword ||
      !formData.role ||
      !formData.position
    ) {
      setError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    // ตรวจสอบรหัสผ่านตรงกัน
    if (formData.password !== formData.confirmPassword) {
      setError("รหัสผ่านและยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setError("");

    // สร้าง FormData สำหรับการส่งข้อมูล
    const formDataToSend = new FormData();
    formDataToSend.append("tec_name", formData.tecName);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("password", formData.password);
    formDataToSend.append("role", formData.role);
    formDataToSend.append("position", formData.position);

    if (formData.profileImage) {
      formDataToSend.append("profileImage", formData.profileImage);
    }

    try {
      const response = await fetch("http://localhost:3333/register", {
        method: "POST",
        body: formDataToSend,
      });

      const data = await response.json();

      if (data.status === "ok") {
        alert("สมัครสมาชิกสำเร็จ");
        window.location = "/login";
      } else {
        setError(data.message || "เกิดข้อผิดพลาดในการสมัครสมาชิก");
      }
    } catch (err) {
      console.error("Error:", err);
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อกับเซิร์ฟเวอร์");
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: "100vh" }}>
        <Grid
          item
          xs={12}
          sx={{
            backgroundColor: "#a6dcef",
            display: "flex",
            alignItems: "center",
            padding: "16px 32px",
          }}
        >
          <Avatar
            src={logo}
            sx={{ width: 70, height: 70, marginRight: 2 }}
            alt="Logo"
          />
          <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
            ระบบลงเวลาปฏิบัติงานราชการโรงเรียนวัดราชภัฏศรัทธาธรรม
          </Typography>
        </Grid>
        <CssBaseline />
        <Grid
          item
          xs={12}
          sm={8}
          md={5}
          component={Box}
          sx={{
            margin: "auto",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: 3,
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Avatar sx={{ m: 1, bgcolor: "secondary.main" }} />
          <Typography component="h1" variant="h5">
            Sign Up
          </Typography>
          <Box
            component="form"
            noValidate
            onSubmit={handleSubmit}
            sx={{ mt: 3 }}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  ชื่อ-สกุล (ระบุคำนำหน้า)
                </Typography>
                <TextField
                  required
                  fullWidth
                  id="tecName"
                  name="tecName"
                  placeholder="Enter your full name"
                  value={formData.tecName}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Email
                </Typography>
                <TextField
                  required
                  fullWidth
                  id="email"
                  name="email"
                  placeholder="Enter your email address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Role
                </Typography>
                <TextField
                  required
                  fullWidth
                  id="role"
                  name="role"
                  placeholder="Enter your role"
                  value={formData.role}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Position
                </Typography>
                <TextField
                  required
                  fullWidth
                  id="position"
                  name="position"
                  placeholder="Enter your position"
                  value={formData.position}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  รหัสผ่าน
                </Typography>
                <TextField
                  required
                  fullWidth
                  name="password"
                  placeholder="Enter your password"
                  type="password"
                  id="password"
                  value={formData.password}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  ยืนยันรหัสผ่าน
                </Typography>
                <TextField
                  required
                  fullWidth
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  type="password"
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  error={!!error}
                  helperText={error}
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="body2" gutterBottom>
                  Input Image to your profile
                </Typography>
                <input
                  type="file"
                  name="profileImage"
                  accept="image/*"
                  onChange={handleChange}
                />
              </Grid>
            </Grid>
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            <Button
              variant="contained"
              color="error"
              sx={{ mt: 3, mb: 2 }}
              onClick={handleBack}
            >
              ย้อนกลับ
            </Button>
            <Grid container justifyContent="flex-end">
              <Grid item>
                <Link href="/login" variant="body2">
                  Already have an account? Sign in
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}
