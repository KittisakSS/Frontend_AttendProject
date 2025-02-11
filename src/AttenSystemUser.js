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
  marginTop: theme.spacing(4),
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
    window.location = "/login";
  };

  const handleCheckIn = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        )
          .then((res) => res.json())
          .then((data) => {
            const locationIn = data.display_name;

            fetch("http://localhost:3333/checkin", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                tec_id: userData.tec_id,
                tec_name: userData.tec_name,
                location_in: locationIn,
              }),
            })
              .then((res) => res.json())
              .then((data) => alert(data.message));
          })
          .catch((err) => console.error("Error fetching location data:", err));
      });
    }
  };

  const handleCheckOut = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords;

        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
        )
          .then((res) => res.json())
          .then((data) => {
            const locationOut = data.display_name;

            fetch("http://localhost:3333/checkout", {
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
                  alert("ลงเวลาออกงานสำเร็จ!");
                } else {
                  alert("Error: " + data.message);
                }
              })
              .catch((err) => {
                console.error("Fetch error:", err);
                alert("ไม่สามารถลงเวลาออกงานได้ โปรดลองอีกครั้ง");
              });
          })
          .catch((err) => console.error("Error fetching location data:", err));
      });
    } else {
      alert("Geolocation is not supported by this browser.");
    }
  };

  return (
    <Root>
      <Header position="static">
        <Toolbar>
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
                    ? `http://localhost:3333/uploads/${userData.t_profile}`
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

        <Clock>
          {currentTime.toLocaleTimeString("th-TH", { hour12: false })}
        </Clock>

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
        </Grid>

        <Grid item>
          <Button
            variant="contained"
            color="success"
            sx={{ fontWeight: "bold", px: 3, py: 1 }}
            onClick={() => (window.location = `/atten/${userData.tec_id}`)}
          >
            ดูรายการเข้าออก
          </Button>
        </Grid>

        <Footer>
          <Typography variant="body2">
            © {new Date().getFullYear()} โรงเรียนวัดราษฎร์ศรัทธาธรรม
          </Typography>
        </Footer>
      </Container>
    </Root>
  );
};

export default AttenSystemUser;
