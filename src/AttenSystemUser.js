import React, { useState, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Grid,
  Card,
  Box,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import Avatar from "@mui/material/Avatar";
import logo from "../src/img/logo.png"
import Swal from "sweetalert2";



const Root = styled("div")(({ theme }) => ({
  backgroundColor: "#fdf3e3",
  minHeight: "100vh",
}));

const Header = styled(AppBar)(({ theme }) => ({
  backgroundColor: "#87ceeb",
  color: "#fff",
  padding: theme.spacing(3),
}));

const ProfileCard = styled(Card)(({ theme }) => ({
  backgroundColor: "#fff",
  padding: theme.spacing(3),
  borderRadius: 10,
  boxShadow: "0px 5px 15px rgba(0,0,0,0.2)",
  marginBottom: theme.spacing(4),
  marginTop: theme.spacing(4),
}));

const Clock = styled(Box)(({ theme }) => ({
  fontSize: "2.5rem",
  color: "#228b22",
  fontWeight: "bold",
  margin: theme.spacing(4, 0),
  textAlign: "center",
}));

const Footer = styled("footer")(({ theme }) => ({
  padding: theme.spacing(2),
  textAlign: "center",
  marginTop: theme.spacing(27),
  backgroundColor: "#fafafa",
  color: "#555",
}));

const AttenSystemUser = () => {
  const [userData, setUserData] = useState({
    tec_id: "",
    tec_name: "",
    role: "",
    t_profile: "",
    position: "",
  });

  const [currentTime, setCurrentTime] = useState(new Date());

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
          if (data.user.role === "admin" || data.user.role === "user") {
            setUserData(data.user);
          } else {
            alert("Access Denied");
            localStorage.removeItem("token");
            window.location = "/login";
          }
        } else {
          alert("Authentication failed");
          localStorage.removeItem("token");
          window.location = "/login";
        }
      })
      .catch((error) => console.error("Error:", error));

    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("password"); // ✅ ลบรหัสผ่านออก
    window.location = "/login";
  };

  const handleNavigation = (path) => {
    window.location = path;
  };

  const handleCheckIn = () => {
    const savedPassword = localStorage.getItem("password");
  
    Swal.fire({
      title: "ยืนยันการลงเวลาเข้า",
      input: "password",
      inputPlaceholder: "กรอกรหัสผ่าน...",
      showCancelButton: true,
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
      inputAttributes: {
        autocapitalize: "off",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const enteredPassword = result.value;
  
        if (enteredPassword !== savedPassword) {
          Swal.fire("ผิดพลาด!", "รหัสผ่านไม่ถูกต้อง", "error");
          return;
        }
  
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
  
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
              .then((res) => res.json())
              .then((data) => {
                const locationIn = data.display_name;
  
                fetch(`${process.env.REACT_APP_API_URL}/checkin`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tec_id: userData.tec_id,
                    tec_name: userData.tec_name,
                    location_in: locationIn,
                  }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.status === "ok") {
                      Swal.fire("สำเร็จ!", "ลงเวลาเข้าทำงานเรียบร้อย", "success");
                    } else {
                      Swal.fire("ผิดพลาด!", "Error: " + data.message, "error");
                    }
                  })
                  .catch((err) => {
                    console.error("Fetch error:", err);
                    Swal.fire(
                      "ผิดพลาด!",
                      "ไม่สามารถลงเวลาเข้าได้ โปรดลองอีกครั้ง",
                      "error"
                    );
                  });
              })
              .catch((err) =>
                console.error("Error fetching location data:", err)
              );
          });
        } else {
          Swal.fire("ผิดพลาด!", "เบราว์เซอร์ของคุณไม่รองรับ Geolocation", "error");
        }
      }
    });
  };

  const handleCheckOut = () => {
    const savedPassword = localStorage.getItem("password");
  
    Swal.fire({
      title: "ยืนยันการลงเวลาออก",
      input: "password",
      inputPlaceholder: "กรอกรหัสผ่าน...",
      showCancelButton: true,
      confirmButtonText: "ตกลง",
      cancelButtonText: "ยกเลิก",
      inputAttributes: {
        autocapitalize: "off",
      },
    }).then((result) => {
      if (result.isConfirmed) {
        const enteredPassword = result.value;
  
        if (enteredPassword !== savedPassword) {
          Swal.fire("ผิดพลาด!", "รหัสผ่านไม่ถูกต้อง", "error");
          return;
        }
  
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
  
            fetch(
              `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
            )
              .then((res) => res.json())
              .then((data) => {
                const locationOut = data.display_name;
  
                fetch(`${process.env.REACT_APP_API_URL}/checkout`, {
                  method: "PUT",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    tec_id: userData.tec_id,
                    location_out: locationOut,
                  }),
                })
                  .then((res) => res.json())
                  .then((data) => {
                    if (data.status === "ok") {
                      Swal.fire("สำเร็จ!", "ลงเวลาออกงานเรียบร้อย", "success");
                    } else {
                      Swal.fire("ผิดพลาด!", "Error: " + data.message, "error");
                    }
                  })
                  .catch((err) => {
                    console.error("Fetch error:", err);
                    Swal.fire(
                      "ผิดพลาด!",
                      "ไม่สามารถลงเวลาออกงานได้ โปรดลองอีกครั้ง",
                      "error"
                    );
                  });
              })
              .catch((err) =>
                console.error("Error fetching location data:", err)
              );
          });
        } else {
          Swal.fire("ผิดพลาด!", "เบราว์เซอร์ของคุณไม่รองรับ Geolocation", "error");
        }
      }
    });
  };

  const currentDateText = currentTime.toLocaleDateString("th-TH", {
  day: "numeric",
  month: "long",
  year: "numeric"
});

  return (
    <Root>
      <Header position="static">
        <Toolbar>
        <Avatar src={logo} sx={{ width: 70, height: 70, marginRight: 2 }} alt="Logo"/>
          <Typography variant="h5" color="black" fontWeight="bold">
            ระบบลงเวลาปฏิบัติงานราชการโรงเรียนวัดราษฎร์ศรัทธาธรรม
          </Typography>
        </Toolbar>
      </Header>

      <Container>
        <ProfileCard>
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              <Box
                component="img"
                src={
                  userData.t_profile
                    ? `${process.env.REACT_APP_API_URL}/uploads/${userData.t_profile}`
                    : "https://via.placeholder.com/100" // Default image
                }
                alt="profile"
                width={120}
                height={120}
                borderRadius="50%"
                boxShadow="0px 3px 10px rgba(0,0,0,0.1)"
              />
            </Grid>
            <Grid item>
              <Typography variant="h5" fontWeight="bold">
                {userData.tec_name || "ชื่อผู้ใช้งาน"}
              </Typography>
              <Typography color="textSecondary" variant="subtitle1">
                {userData.position || "ตำแหน่งงาน"}
              </Typography>
            </Grid>
          </Grid>
          <Button
            variant="outlined"
            color="primary"
            sx={{ fontWeight: "bold", px: 2 }}
            onClick={handleLogout}
          >
            Logout
          </Button>
        </ProfileCard>

        <Clock>{currentDateText} - {currentTime.toLocaleTimeString("th-TH", { hour12: false })}</Clock>

        <Grid container justifyContent="center" spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              sx={{ fontWeight: "bold", px: 3, py: 1 }}
              onClick={handleCheckIn}
            >
              ลงเวลาเข้างาน
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="secondary"
              sx={{ fontWeight: "bold", px: 3, py: 1 }}
              onClick={handleCheckOut}
            >
              ลงเวลาออกงาน
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              sx={{
                backgroundColor: "#f8b400",
                color: "#fff",
                fontWeight: "bold",
                px: 3,
                py: 1,
              }}
              onClick={() => handleNavigation("/leave")}
            >
              ลาราชการ
            </Button>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" spacing={2} mt={3} >
                  {/* <Grid item>
                    <Button variant="outlined" color="primary" sx={{ fontWeight: 'bold', px: 2 }}>
                      โหลดไฟล์ใบลา
                    </Button>
                  </Grid> */}
                  <Grid item>
                    <Button
                      variant="outlined"
                      sx={{ fontWeight: "bold", px: 2,
                        backgroundColor: "#a52a2a",
                        color: "#ffffff",
                        px: 3,
                        py: 1,
                       }}
                      onClick={() => handleNavigation("/atten")}
                    >
                      ดูรายการเข้าออก
                    </Button>
                    </Grid> 
                  <Grid item>        
                    <Button
                      variant="outlined"
                      mr={5}
                      sx={{ fontWeight: "bold", px: 3,
                        py: 1, color: "#ffffff", backgroundColor: "#708090",}}
                      onClick={() => handleNavigation("/leavedirect")}
                    >
                      ดูรายการลา
                    </Button>
                  </Grid>
                </Grid>

      </Container>
      <Footer>
          <Typography variant="body2">
            © {new Date().getFullYear()} โรงเรียนวัดราษฎร์ศรัทธาธรรม
          </Typography>
        </Footer>
    </Root>
  );
};

export default AttenSystemUser;
