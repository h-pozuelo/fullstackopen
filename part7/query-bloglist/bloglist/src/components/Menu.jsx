import {
  Box,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import React, { useState } from "react";
import { Link } from "react-router-dom";

const Menu = ({ name, handleLogout }) => {
  const [open, setOpen] = useState(false);

  const toggleDrawer = (newOpen) => () => {
    setOpen(newOpen);
  };

  const DrawerList = (
    <Box sx={{ width: 250 }} role="presentation" onClick={toggleDrawer(false)}>
      <List>
        <ListItem>
          <ListItemText primary={`${name} logged in`} />
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem component={Link} to="/" disablePadding>
          <ListItemButton>
            <ListItemText primary="blogs" />
          </ListItemButton>
        </ListItem>
        <ListItem component={Link} to="/users" disablePadding>
          <ListItemButton>
            <ListItemText primary="users" />
          </ListItemButton>
        </ListItem>
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleLogout}>
            <ListItemText primary="logout" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <div>
      <IconButton aria-label="menu" onClick={toggleDrawer(true)}>
        <MenuIcon />
      </IconButton>
      <Drawer open={open} onClose={toggleDrawer(false)}>
        {DrawerList}
      </Drawer>
    </div>
  );
};

export default Menu;
