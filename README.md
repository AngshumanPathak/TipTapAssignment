

# TipTap A4 Pagination Editor

A custom TipTap-based editor that supports **manual and automatic page breaks**, **page numbering**, and A4-style pagination.  
Built on top of the default TipTap layout template and extended with custom nodes and DOM calculations.

---
## For the interviewer
## 📖 Overview

This project started with the default TipTap editor template.  
Instead of creating a layout from scratch, the base template was adapted and extended with new **custom nodes** to achieve advanced features like:

- Manual page breaks
- Automatic page breaks based on DOM height
- Page numbering linked to page breaks
- Experimental header/footer nodes

---

## 🛠️ Approach

### 1. Manual Page Break
- Implemented via a **custom node**.
- A toolbar button inserts a page break at the **current cursor position**.

### 2. Automatic Page Break
A **hybrid approach** combining:
- **DOM height calculations**  
  Every time an action potentially disrupts page layout (e.g., font size change, paste event, style change), the editor checks the current DOM height.  
  If it exceeds the A4 height limit, a page break node is inserted.
- **Typing-based prediction**  
  While typing, the editor estimates where the DOM will exceed the A4 size using:
  - Current DOM height
  - Characters inserted
  - Approximate line height for the font

### 3. Page Numbers
- A separate **page number node** is created.
- Automatically increments whenever a page break is added.

### 4. Headers & Footers (Experimental)
- Custom header/footer nodes inserted alongside page breaks.
- Currently **disabled** due to calculation inaccuracies affecting page numbering.

---

## ✅ Achievements
- ✔️ Proper **manual page break** insertion
- ✔️ Reliable **automatic page break** with pagination
- ✔️ Functional **page numbering** tied to breaks

---

## ❌ Known Issues
- ❌ Header/Footer nodes throw off pagination calculations
- ❌ Page numbering starts **only after** the first page break

---

## 🚀 Future Improvements
- Start page numbering from **Page 1** (first page, no break required)
- Add a dedicated **header/footer toolbar button**
- Make headers/footers fit perfectly within the A4 layout without affecting content flow

---

## 📂 Tech Stack
- [TipTap](https://tiptap.dev/) – Headless editor framework
- Custom TipTap nodes & extensions
- DOM-based layout calculations





## 📄 License
MIT License – feel free to use and modify for your projects.










