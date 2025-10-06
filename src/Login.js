import * as React from 'react';
import { useState } from 'react';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
// import Link from '@mui/material/Link';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import { createTheme, ThemeProvider } from '@mui/material/styles';

import logo from "../src/img/logo.png"
import Swal from 'sweetalert2';


const theme = createTheme();

export default function SignIn() {
  // Use state to manage form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

      // 🔍 เช็กว่าเว้น email หรือ password ไหม
  if (!email || !password) {
    Swal.fire({
      icon: "warning",
      title: "กรุณากรอกข้อมูลให้ครบถ้วน",
      text: "ทั้ง Email และ Password ต้องไม่เว้นว่าง",
      confirmButtonText: "ตกลง"
    });
    return;
  }
  
    const jsonData = { email, password };

      // 🌀 แสดง Popup Loading
  Swal.fire({
    title: 'กำลังเข้าสู่ระบบ...',
    text: 'กรุณารอสักครู่',
    allowOutsideClick: false,
    didOpen: () => {
      Swal.showLoading();
    }
  });
  
    fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    })
      .then((response) => response.json())
      .then((data) => {

        Swal.close(); // 🔒 ปิด popup loading ก่อน

        if (data.status === "ok") {
            Swal.fire({
            icon: "success",
            title: "เข้าสู่ระบบสำเร็จ",
            showConfirmButton: false,
            timer: 1500
          });

          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);  // ✅ เพิ่มการเก็บ role ลงใน localStorage
          localStorage.setItem("password", password);  // ✅ เก็บรหัสผ่าน
  
          // Check role and navigate
          // ✅ รอ 1.6 วินาที ก่อน redirect
          setTimeout(() => {
            if (data.role === "admin") {
              window.location = "/users";
            } else if (data.role === "user") {
              window.location = "/user";
            } else if (data.role === "director") {
              window.location = "/director";
            } else {
              Swal.fire({
                icon: "error",
                title: "บทบาทไม่ตรง",
                text: "ไม่สามารถเข้าสู่ระบบได้"
              });
            }
          }, 1600); // หน่วงเวลาหลัง Swal แสดงครบ
        } else {
        Swal.fire({
          icon: "error",
          title: "เข้าสู่ระบบล้มเหลว",
          text: data.message || "กรุณาตรวจสอบข้อมูลอีกครั้ง",
          confirmButtonText: "ตกลง"
        });
        }
      })
          .catch((error) => {
      Swal.close(); // 🔒 ปิด popup loading ถ้ามี error
      console.error('Error:', error);
      Swal.fire({
        icon: "error",
        title: "เกิดข้อผิดพลาด",
        text: "ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้",
        confirmButtonText: "ตกลง"
      });
    });
  };
  

  return (
    <ThemeProvider theme={theme}>
      <Grid container component="main" sx={{ height: '60vh' }}>
        <CssBaseline />
        {/* Header Section */}
        <Grid
          item
          xs={12}
          sx={{
            backgroundColor: '#a6dcef',
            display: 'flex',
            alignItems: 'center',
            padding: '16px 32px',
          }}
        >
          <Avatar src={logo} sx={{ width: 100, height: 100, marginRight: 2 }} alt="Logo"/>
          <Typography variant="h5" component="div" sx={{ fontWeight: 'bold' }}>
            ระบบลงเวลาปฏิบัติงานราชการโรงเรียนวัดราชภัฏศรัทธาธรรม
          </Typography>
        </Grid>
        {/* Form Section */}
        <Grid item xs={12} sm={8} md={4} sx={{ margin: 'auto', maxWidth: 400, px: 2 }}>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
          >
            <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 3 }}>
              <Typography component="h1" variant="h5" sx={{ mb: 2 }}>
                ลงชื่อเข้าใช้
              </Typography>
              <TextField
                margin="normal"
                required
                fullWidth
                id="email"
                label="Email"
                name="email"
                autoComplete="email"
                autoFocus
                placeholder="โปรดป้อนอีเมลของคุณ"
                value={email} // Set value from state
                onChange={(e) => setEmail(e.target.value)} // Update state when input changes
              />
              <TextField
                margin="normal"
                required
                fullWidth
                name="password"
                label="Password"
                type="password"
                id="password"
                autoComplete="current-password"
                placeholder="โปรดป้อนรหัสผ่าน"
                value={password} // Set value from state
                onChange={(e) => setPassword(e.target.value)} // Update state when input changes
              />
              {/* <Link href="#" variant="body2" sx={{ display: 'block', textAlign: 'right', mt: 1, mb: 3 }}>
                ลืมรหัสผ่าน?
              </Link> */}
              <Grid container spacing={2}>
                {/* <Grid item xs={6}>
                  <Button
                    fullWidth
                    variant="outlined"
                    sx={{
                      borderColor: '#000',
                      color: '#000',
                      '&:hover': {
                        borderColor: '#000',
                      },
                    }}
                    onClick={() => window.location = "/register"}
                  >
                    Sign Up
                  </Button>
                </Grid> */}
                <Grid item xs={6}>
                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    sx={{
                      bgcolor: '#000',
                      '&:hover': {
                        bgcolor: '#333',
                      },
                    }}
                  >
                    เข้าสู่ระบบ
                  </Button>
                </Grid>
              </Grid>
            </Box>
          </Box>
        </Grid>
      </Grid>
    </ThemeProvider>
  );
}

