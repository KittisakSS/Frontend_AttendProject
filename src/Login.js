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

const theme = createTheme();

export default function SignIn() {
  // Use state to manage form values
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    const jsonData = { email, password };
  
    fetch('http://localhost:3333/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(jsonData),
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === "ok") {
          alert("Login successful");
          localStorage.setItem("token", data.token);
          localStorage.setItem("role", data.role);  // ✅ เพิ่มการเก็บ role ลงใน localStorage
          localStorage.setItem("password", password);  // ✅ เก็บรหัสผ่าน
  
          // Check role and navigate
          if (data.role === "admin") {
            window.location = "/users";
          } else if (data.role === "user") {
            window.location = "/user";
          } else if (data.role === "director") {
            window.location = "/director";
          } else {
            alert("Invalid role");
          }
        } else {
          alert("Login failed: " + data.message);
        }
      })
      .catch((error) => console.error('Error:', error));
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
        <Grid item xs={12} sm={8} md={4} sx={{ margin: 'auto', maxWidth: 400 }}>
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
                placeholder="Enter your Email"
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
                placeholder="Enter your password"
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

