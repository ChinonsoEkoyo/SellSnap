const fs = require('fs');

const colorTokensFile = './color-tokens.json';
const typoTokensFile = './design-tokens.tokens.json';
const outputFile = './tokens.css';

const colorData = JSON.parse(fs.readFileSync(colorTokensFile, 'utf-8'));
const typoData = JSON.parse(fs.readFileSync(typoTokensFile, 'utf-8'));

function resolveColorRef(val, data) {
  if (typeof val === 'string' && val.startsWith('{') && val.endsWith('}')) {
    const path = val.slice(1, -1).split('.');
    let curr = data;
    for (const key of path) {
      if (curr && typeof curr === 'object' && key in curr) {
        curr = curr[key];
      } else {
        console.warn(`Warning: Could not resolve reference ${val}`);
        return val; // Return unresolved string
      }
    }
    return resolveColorRef(curr, data);
  }
  return val;
}

function toKebab(str) {
  return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
}

let css = `/* Auto-generated CSS Variables */\n\n`;

// 1. Color Roles
css += `/* Color Roles */\n`;
css += `:root {\n`;
const lightRoles = colorData.color.role.light;
for (const [key, val] of Object.entries(lightRoles)) {
  const resolved = resolveColorRef(val, colorData);
  css += `  --color-${toKebab(key)}: ${resolved};\n`;
}
css += `}\n\n`;

css += `[data-theme="dark"] {\n`;
const darkRoles = colorData.color.role.dark;
for (const [key, val] of Object.entries(darkRoles)) {
  const resolved = resolveColorRef(val, colorData);
  css += `  --color-${toKebab(key)}: ${resolved};\n`;
}
css += `}\n\n`;

// 2. Typography
css += `/* Typography */\n`;
css += `:root {\n`;

const pxProperties = new Set(['fontSize', 'lineHeight', 'letterSpacing', 'paragraphIndent', 'paragraphSpacing']);

function parseTypo(node, prefix = []) {
  if (node && typeof node === 'object') {
    if (node.type && node.value) {
      const val = node.value;
      if (typeof val === 'object') {
        for (const [vKey, vVal] of Object.entries(val)) {
          let cssVal = vVal;
          if (typeof cssVal === 'number' && pxProperties.has(vKey)) {
            cssVal = cssVal === 0 && vKey === 'letterSpacing' ? '0' : `${cssVal}px`;
          }
          if (vKey === 'fontFamily' && typeof cssVal === 'string' && cssVal.includes(' ')) {
            cssVal = `'${cssVal}'`;
          }
          const varName = [...prefix, toKebab(vKey)].join('-');
          css += `  --${varName}: ${cssVal};\n`;
        }
      } else {
        const varName = prefix.join('-');
        css += `  --${varName}: ${val};\n`;
      }
    } else {
      for (const [key, child] of Object.entries(node)) {
        if (key === 'extensions') continue; // Skip figma specific metadata
        parseTypo(child, [...prefix, toKebab(key)]);
      }
    }
  }
}

parseTypo(typoData);

css += `}\n`;

fs.writeFileSync(outputFile, css);
console.log(`Successfully generated CSS variables to ${outputFile}`);
