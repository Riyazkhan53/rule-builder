import React, { useState } from "react";
import { Box, TextField, Button, Typography, Grid, MenuItem, IconButton, Dialog, DialogActions, DialogContent, DialogTitle } from "@mui/material";
import AddIcon from "@mui/icons-material/Add";

function RuleBuilder() {
  const [option, setOption] = useState("json"); // Toggle between JSON input and Manual creation
  const [componentName, setComponentName] = useState("");
  const [version, setVersion] = useState("");
  const [ruleName, setRuleName] = useState("");
  const [eqData, setEqData] = useState("");
  const [neqData, setNeqData] = useState("");
  const [manualRules, setManualRules] = useState([]);
  const [output, setOutput] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [logicalOperator, setLogicalOperator] = useState("AND");

  const addManualRule = () => {
    setManualRules([
      ...manualRules,
      { data: "", condition: "EQ", componentName, version, ruleName },
    ]);
  };

  const updateManualRule = (index, field, value) => {
    const updatedRules = [...manualRules];
    updatedRules[index][field] = value;
    setManualRules(updatedRules);
  };

  const autofillManualRules = () => {
    const updatedRules = manualRules.map((rule) => ({
      ...rule,
      componentName,
      version,
      ruleName,
    }));
    setManualRules(updatedRules);
  };

  const handleDialogClose = (operator) => {
    setLogicalOperator(operator);
    setDialogOpen(false);
    generateRuleWithOperator(operator);
  };

  const generateRule = () => {
    if (option === "json") {
      if (!componentName || !ruleName) {
        alert("Component Name and Rule Name are required.");
        return;
      }

      let eqJson, neqJson;
      try {
        eqJson = eqData ? JSON.parse(eqData) : {};
        neqJson = neqData ? JSON.parse(neqData) : {};
      } catch (error) {
        alert("Invalid JSON format.");
        return;
      }

      let rules = {};
      let ruleConditions = [];
      let subRuleLetter = "A";

      Object.keys(eqJson).forEach((key) => {
        const ruleKey = `com#${ruleName}#rule1${subRuleLetter}`;
        rules[ruleKey] = { eval: ["EQ", `_.${componentName}.${key}`, ""] };
        ruleConditions.push(`out.${ruleKey}`);
        subRuleLetter = String.fromCharCode(subRuleLetter.charCodeAt(0) + 1);
      });

      Object.keys(neqJson).forEach((key) => {
        const ruleKey = `com#${ruleName}#rule1${subRuleLetter}`;
        rules[ruleKey] = { eval: ["NEQ", `_.${componentName}.${key}`, "true"] };
        ruleConditions.push(`out.${ruleKey}`);
        subRuleLetter = String.fromCharCode(subRuleLetter.charCodeAt(0) + 1);
      });

      if (ruleConditions.length > 0) {
        rules[`com#${ruleName}#rule1`] = {
          eval: ["AND", ...ruleConditions],
          action: {
            print: { message: `${ruleName} should not be blank.`, printType: "error" },
          },
        };
      }

      setOutput(JSON.stringify(rules, null, 2));
    } else if (option === "manual") {
      if (!componentName || !version || !ruleName) {
        alert("Component Name, Version, and Rule Name are required.");
        return;
      }

      if (manualRules.length > 1) {
        setDialogOpen(true); // Open dialog to ask for AND/OR
      } else {
        generateRuleWithOperator("AND"); // Default to AND if only one rule
      }
    }
  };

  const generateRuleWithOperator = (operator) => {
    let rules = {};
    let ruleConditions = [];

    manualRules.forEach((rule, index) => {
      const ruleKey = `com#${rule.ruleName}#rule${index + 1}`;
      rules[ruleKey] = { eval: [rule.condition, `_.${rule.componentName}.${rule.data}`, ""] };
      ruleConditions.push(`out.${ruleKey}`);
    });

    if (ruleConditions.length > 0) {
      rules[`com#${ruleName}#rule1`] = {
        eval: [operator, ...ruleConditions],
        action: {
          print: { message: `${ruleName} validation failed.`, printType: "error" },
        },
      };
    }

    setOutput(JSON.stringify(rules, null, 2));
  };

  return (
    <Box sx={{ maxWidth: 800, mx: "auto" }}>
      <Typography variant="h4">Rule Builder</Typography>

      {/* Option Selector */}
      <TextField
        select
        label="Input Type"
        fullWidth
        value={option}
        onChange={(e) => setOption(e.target.value)}
        sx={{ mb: 2 }}
      >
        <MenuItem value="json">JSON Input</MenuItem>
        <MenuItem value="manual">Manual Creation</MenuItem>
      </TextField>

      {option === "json" && (
        <>
          <TextField
            fullWidth
            label="Component Name"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Rule Name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="EQ Data (JSON)"
            value={eqData}
            onChange={(e) => setEqData(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            multiline
            rows={3}
            label="NEQ Data (JSON)"
            value={neqData}
            onChange={(e) => setNeqData(e.target.value)}
            sx={{ mb: 2 }}
          />
        </>
      )}

      {option === "manual" && (
        <>
          <TextField
            fullWidth
            label="Component Name"
            value={componentName}
            onChange={(e) => setComponentName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Version"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            fullWidth
            label="Rule Name"
            value={ruleName}
            onChange={(e) => setRuleName(e.target.value)}
            sx={{ mb: 2 }}
          />
          <Button variant="contained" onClick={autofillManualRules} sx={{ mb: 2 }}>
            Autofill Rules
          </Button>

          {manualRules.map((rule, index) => (
            <Grid container spacing={2} key={index} sx={{ mb: 2 }}>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Data"
                  value={rule.data}
                  onChange={(e) => updateManualRule(index, "data", e.target.value)}
                />
              </Grid>
              <Grid item xs={3}>
                <TextField
                  select
                  fullWidth
                  label="Condition"
                  value={rule.condition}
                  onChange={(e) => updateManualRule(index, "condition", e.target.value)}
                >
                  <MenuItem value="EQ">EQ</MenuItem>
                  <MenuItem value="NEQ">NEQ</MenuItem>
                  <MenuItem value="DEQ">DEQ</MenuItem>
                </TextField>
              </Grid>
              <Grid item xs={3}>
                <TextField
                  fullWidth
                  label="Rule Name"
                  value={rule.ruleName}
                  onChange={(e) => updateManualRule(index, "ruleName", e.target.value)}
                />
              </Grid>
            </Grid>
          ))}

          <Button variant="outlined" startIcon={<AddIcon />} onClick={addManualRule}>
            Add Rule
          </Button>
        </>
      )}

      <Button variant="contained" color="primary" onClick={generateRule} sx={{ mt: 3 }}>
        Generate Rule
      </Button>

      {output && (
        <>
          <Typography variant="h6" sx={{ mt: 3 }}>
            Generated Rule:
          </Typography>
          <pre style={{ background: "#f4f4f4", padding: "10px", border: "1px solid #ddd" }}>
            {output}
          </pre>
        </>
      )}

      {/* Dialog for AND/OR Selection */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
        <DialogTitle>Select Logical Operator</DialogTitle>
        <DialogContent>
          <Typography>Select how to combine the rules:</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => handleDialogClose("AND")} color="primary">
            AND
          </Button>
          <Button onClick={() => handleDialogClose("OR")} color="primary">
            OR
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default RuleBuilder;