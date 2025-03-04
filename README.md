# Prismalux 🌓 - Prisma Schema Syntax Highlighter

[![npm version](https://img.shields.io/npm/v/prismalux.svg?style=flat-square)](https://www.npmjs.com/package/prismalux)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

✨ **Prismalux** is a lightweight **CLI tool & library** for highlighting **Prisma schema** in the terminal.  
It supports **CommonJS (CJS)** and **ES Modules (ESM)**, making it easy to integrate into **CLI applications** or use in **Node.js projects**.

---

## 🚀 Features

✔ **Syntax highlighting** for Prisma schema files  
✔ **Works as CLI & library** (use as `prismalux [path]` or import in code)  
✔ **Supports both ESM & CommonJS** (`import` and `require`)  
✔ **No dependencies** - pure **TypeScript + Node.js**

---

## 📸 Preview

![Prismalux Syntax Highlighting](https://raw.githubusercontent.com/unbywyd/prismalux/main/assets/preview.png)

---

### **📦 Get Started**

If you just want to run **Prismalux** without installing it, simply use:

```sh
npx prismalux
```

This will **automatically find** the Prisma schema in the current directory (e.g., `prisma/schema.prisma`).  
If your schema is located elsewhere, specify the path manually:

```sh
npx prismalux ./path/to/schema.prisma
```

---

### **Global Installation (CLI)**

If you want to use **Prismalux** as a command-line tool:

```sh
npm install -g prismalux
```

Now you can run:

```sh
prismalux [path_to_schema]
```

---

## 🎮 Usage

### **1️⃣ CLI Mode**

```sh
# Display help
prismalux --help

# Show version
prismalux --version

# Highlight Prisma schema (auto-detects "prisma/schema.prisma")
prismalux

# Highlight a specific file
prismalux ./custom/schema.prisma
```

### **2️⃣ Import in Code**

#### **📦 ESM (ES Modules)**

```typescript
import PrismaHighlighter from "prismalux";

const schema = `
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  role      Role
  createdAt DateTime @default(now())
}
`;

console.log(PrismaHighlighter.highlight(schema));
```

#### **📦 CommonJS (CJS)**

```javascript
const { PrismaHighlighter, highlight } = require("prismalux");

console.log(highlight(schema));
```

---

## 🔧 Configuration

Prismalux allows you to customize colors and disable highlighting if needed.

```typescript
const highlighter = new PrismaHighlighter({
  enableColors: true,
  colors: {
    yellow: "\x1b[38;5;220m", // Custom yellow
    orange: "\x1b[38;5;214m", // Custom orange
  },
});

console.log(highlighter.highlight(schema));
```

To **disable colors** (useful for logs):

```typescript
const plainHighlighter = new PrismaHighlighter({ enableColors: false });
console.log(plainHighlighter.highlight(schema));
```

---

## 📜 License

**MIT License** © [Artyom Gorlovetskiy](https://github.com/unbywyd)
