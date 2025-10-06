import fs from 'fs';
import path from 'path';

const cssFile = path.join(process.cwd(), 'src/index.css');
const css = fs.readFileSync(cssFile, 'utf8');

// Extract and validate color variables
const colorVars = css.match(/--[a-zA-Z-]+:\s[^;]+/g);
if (colorVars) {
  colorVars.forEach(variable => {
    if (variable.includes('hsl')) {
      console.log(`✅ Valid HSL color: ${variable}`);
    } else {
      console.warn(`⚠️ Non-HSL color found: ${variable}`);
    }
  });
}