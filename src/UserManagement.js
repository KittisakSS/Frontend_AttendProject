import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
} from "@mui/material";
import Grid from "@mui/material/Grid";
import Avatar from "@mui/material/Avatar";
import Typography from "@mui/material/Typography";
import "./css/UserManagement.css";

import logo from "../src/img/logo.png"
import Swal from "sweetalert2";

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
    tec_name: "",
    email: "",
    role: "",
    position: "",
    t_profile: "",
  });
  const [editId, setEditId] = useState(null);
  const [profileImage, setProfileImage] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("กรุณาเข้าสู่ระบบ");
      window.location = "/login";
    } else {
      fetch("http://localhost:3333/authen", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status !== "ok") {
            alert("Authentication failed");
            localStorage.removeItem("token");
            window.location = "/login";
          }
        })
        .catch(() => {
          alert("Error verifying token");
          localStorage.removeItem("token");
          window.location = "/login";
        });
    }
  }, []);

  const fetchUsers = () => {
    const token = localStorage.getItem("token");
    fetch("http://localhost:3333/users", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => setUsers(data))
      .catch(() => alert("Error fetching users"));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    setProfileImage(e.target.files[0]);
  };

  const handleSubmit = () => {
    Swal.fire({
      title: "กรอกรหัสผ่านเพื่อยืนยัน",
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
        const savedPassword = localStorage.getItem("password");
  
        if (enteredPassword !== savedPassword) {
          Swal.fire("ผิดพลาด!", "รหัสผ่านไม่ถูกต้อง", "error");
          return;
        }
  
        const token = localStorage.getItem("token");
        const url = editId
          ? `http://localhost:3333/users/${editId}`
          : "http://localhost:3333/register";
        const method = editId ? "PUT" : "POST";
  
        const formData = new FormData();
        formData.append("tec_name", form.tec_name);
        formData.append("email", form.email);
        formData.append("role", form.role);
        formData.append("position", form.position);
        if (profileImage) {
          formData.append("profileImage", profileImage);
        }
  
        fetch(url, {
          method,
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        })
          .then(() => {
            fetchUsers();
            setForm({ tec_name: "", email: "", role: "", position: "", t_profile: "" });
            setEditId(null);
            setProfileImage(null);
            Swal.fire("สำเร็จ!", "อัปเดตข้อมูลเรียบร้อย", "success");
          })
          .catch(() => Swal.fire("ผิดพลาด!", "Error updating user", "error"));
      }
    });
  };  

  const handleEdit = (user) => {
    setEditId(user.tec_id);
    setForm({
      tec_name: user.tec_name,
      email: user.email,
      role: user.role,
      position: user.position,
    });
  };

  const handleDelete = (id) => {
    const token = localStorage.getItem("token");
    fetch(`http://localhost:3333/users/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(() => fetchUsers())
      .catch(() => alert("Error deleting user"));
  };

  const handleUser = (event) => {
    event.preventDefault();
    window.location = "/users";
  };

  const handleSign = (event) => {
    event.preventDefault();
    window.location = "/register";
  };

  return (
    <div className="container">
      <Grid item xs={12} sx={{ backgroundColor: "#a6dcef", display: "flex", alignItems: "center", padding: "16px 32px" }}>
      <Avatar 
       src={logo} 
       sx={{ width: 70, height: 70, marginRight: 2 }} 
      alt="Logo"/>
        <Typography variant="h5" component="div" sx={{ fontWeight: "bold" }}>
          ระบบลงเวลาปฏิบัติงานราชการโรงเรียนวัดราชภัฏศรัทธาธรรม
        </Typography>
      </Grid>
      <h2 className="header">Manage Users</h2>

      {editId && (
        <div className="form-container">
          <h3>Edit User</h3>
          <form className="form">
            <TextField label="Name" name="tec_name" value={form.tec_name} onChange={handleChange} fullWidth />
            <TextField label="Email" name="email" value={form.email} onChange={handleChange} fullWidth />
            <TextField label="Role" name="role" value={form.role} onChange={handleChange} fullWidth />
            <TextField label="Position" name="position" value={form.position} onChange={handleChange} fullWidth />
            <input type="file" accept="image/*" onChange={handleImageChange} />
            <Button variant="contained" color="primary" onClick={handleSubmit} className="submit-button">
              Update
            </Button>
          </form>
        </div>
      )}

      <TableContainer component={Paper} className="table-container">
        <Table>
          <TableHead>
            <TableRow className="table-header">
              <TableCell>tec_id</TableCell>
              <TableCell>Name</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Role</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Profile</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.tec_id}>
                <TableCell>{user.tec_id}</TableCell>
                <TableCell>{user.tec_name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.role}</TableCell>
                <TableCell>{user.position}</TableCell>
                <TableCell>
                  <img src={`http://localhost:3333/uploads/${user.t_profile}`} alt="Profile" width="50" height="50" />
                </TableCell>
                <TableCell>
                  <Button variant="contained" color="primary" onClick={() => handleEdit(user)}>
                    Edit
                  </Button>
                  <Button variant="contained" color="secondary" onClick={() => handleDelete(user.tec_id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Button
        variant="contained"
        color="error"
        sx={{ fontWeight: "bold", margin: 5 }}
        onClick={handleUser}
      >
        ย้อนกลับ
      </Button>
      <Button
        variant="contained"
        color="success"
        sx={{ fontWeight: "bold", margin: 5 }}
        onClick={handleSign}
      >
        สมัคร
      </Button>

    </div>
  );
};

export default UserManagement;
