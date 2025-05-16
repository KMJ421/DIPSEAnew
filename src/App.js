import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import Page1 from './pages/Page1';
import Page2 from './pages/Page2';
import Page3 from './pages/Page3';

import {
  Box,
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
} from '@mui/material';

import MenuIcon from '@mui/icons-material/Menu';
import VideocamOutlinedIcon from '@mui/icons-material/VideocamOutlined';
import MicOutlinedIcon from '@mui/icons-material/MicOutlined';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

import './App.css'; // 👈 외부 CSS 파일 import

const drawerWidth = 72;

function NavigationRail() {
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(true);

  const navItems = [
    { icon: <VideocamOutlinedIcon />, label: '동영상', path: '/' },
    { icon: <ChatBubbleOutlineIcon />, label: '시', path: '/page2' },
    { icon: <MicOutlinedIcon />, label: '음성', path: '/page3' },
  ];

  return (
    <Drawer
      variant="permanent"
      className="app-drawer"
      sx={{
        width: drawerWidth,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: drawerWidth,
        },
      }}
    >
      <Toolbar>
        <IconButton onClick={() => setOpen(!open)}>
          <MenuIcon />
        </IconButton>
      </Toolbar>

      <Collapse in={open}>
        <List>
          {navItems.map((item) => {
            const isSelected = location.pathname === item.path;
            return (
              <ListItem
                key={item.path}
                button
                disableRipple
                onClick={() => navigate(item.path)}
                className="app-list-item"
              >
                <Box
                  className={`app-icon-box ${isSelected ? 'selected' : ''}`}
                >
                  <ListItemIcon className="app-icon">
                    {item.icon}
                  </ListItemIcon>
                </Box>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: 12,
                    textAlign: 'center',
                    fontWeight: isSelected ? 'bold' : 'normal',
                    className: 'app-list-text'
                  }}
                />
              </ListItem>
            );
          })}
        </List>
      </Collapse>
    </Drawer>
  );
}

function App() {
  return (
    <Router>
      <Box className="app-container">
        <CssBaseline />
        <NavigationRail />

        <Box className="app-main">
          <AppBar position="static" className="app-appbar">
            <Toolbar sx={{ justifyContent: 'center' }}>
              <Typography className="app-title">
                DIPSEA
              </Typography>
            </Toolbar>
          </AppBar>

          <Box className="app-content">
            <Routes>
              <Route path="/" element={<Page1 />} />
              <Route path="/page2" element={<Page2 />} />
              <Route path="/page3" element={<Page3 />} />
            </Routes>
          </Box>
        </Box>
      </Box>
    </Router>
  );
}

export default App;