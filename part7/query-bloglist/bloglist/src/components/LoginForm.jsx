import { Box, Button, TextField, Typography } from "@mui/material";
import React from "react";

const LoginForm = ({
  onSubmit,
  username,
  handleUsernameChange,
  password,
  handlePasswordChange,
}) => {
  return (
    <>
      <Typography variant="h2">log in to application</Typography>
      <Box
        component="form"
        sx={{ "& .MuiTextField-root": { m: 1, width: "25ch" } }}
        onSubmit={onSubmit}
      >
        <div>
          <TextField
            label="username"
            type="text"
            name="Username"
            value={username}
            onChange={handleUsernameChange}
          />
        </div>
        <div>
          <TextField
            label="password"
            type="password"
            name="Password"
            value={password}
            onChange={handlePasswordChange}
          />
        </div>
        <Button variant="contained" type="submit">
          login
        </Button>
      </Box>
    </>
  );
};

export default LoginForm;
