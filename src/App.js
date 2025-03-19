import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Drawer, List, ListItem, ListItemText, Toolbar, Typography, Box } from "@mui/material";
import RuleBuilder from "./RuleBuilder";
import EdepsExtractor from "./EdepsExtractor";
import TemplateQueryGenerator from "./TemplateQueryGenerator";
// import UnderDevelopment from "./UnderDevelopment";

const drawerWidth = 240;

const Sidebar = () => (
  <Drawer variant="permanent" sx={{ width: drawerWidth, flexShrink: 0 }}>
    <Toolbar />
    <List>
      <ListItem button component={Link} to="/">
        <ListItemText primary="🏠 Home" />
      </ListItem>
      <ListItem button component={Link} to="/rule-builder">
        <ListItemText primary="🛠 Rule Builder" />
      </ListItem>
      <ListItem button component={Link} to="/edeps-extractor">
        <ListItemText primary="📌 Edeps Extractor" />
      </ListItem>
      <ListItem button component={Link} to="/template-query-generator">
        <ListItemText primary="📌 Template Query Generator" />
      </ListItem>
      <ListItem button component={Link} to="/option3">
        <ListItemText primary="📌 Option 3" />
      </ListItem>
      <ListItem button component={Link} to="/option4">
        <ListItemText primary="📌 Option 4" />
      </ListItem>
    </List>
  </Drawer>
);

const Home = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">Welcome to Riyaz Creations!!</Typography>
  </Box>
);

const UnderDevelopment = () => (
  <Box sx={{ p: 3 }}>
    <Typography variant="h4">🚧 Under Development 🚧</Typography>
  </Box>
);

function App() {
  return (
    <Router>
      <Box sx={{ display: "flex" }}>
        <Sidebar />
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/rule-builder" element={<RuleBuilder />} />
            <Route path="/edeps-extractor" element={<EdepsExtractor />} />
            <Route path="/template-query-generator" element={<TemplateQueryGenerator />} />
            <Route path="/option3" element={<UnderDevelopment />} />
            <Route path="/option4" element={<UnderDevelopment />} />
          </Routes>
        </Box>
      </Box>
    </Router>
  );
}

export default App;
