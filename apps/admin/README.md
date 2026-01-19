<div align="center">

# DARK ADMIN
### DASHBOARD

![Next.js](https://img.shields.io/badge/next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-181818?style=for-the-badge&logo=supabase&logoColor=3ECF8E)
![React Hook Form](https://img.shields.io/badge/React_Hook_Form-EC5990?style=for-the-badge&logo=react-hook-form&logoColor=white)
![Zod](https://img.shields.io/badge/Zod-3068B7?style=for-the-badge&logo=zod&logoColor=white)

<br />

**The control center for the Dark Ecosystem.**
**Manages content, analyzes data, and controls configurations across all applications.**

</div>

---

## 📸 Visual Tour

<details open>
<summary><strong>Desktop View</strong></summary>
<br />
<div align="center">
  <img src="../../screenshots/admin/1.jpeg" alt="Desktop Preview" width="100%" style="border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
</div>
</details>

<br />

<details>
<summary><strong>Mobile Experience</strong></summary>
<br />
<div align="center">
  <img src="../../screenshots/admin/mobile.jpeg" alt="Mobile Preview" width="300" style="border-radius: 12px; border: 4px solid #333;">
</div>
</details>

---

## ✨ Key Features

*   **🛡️ Secure Authentication**: Robust RBAC (Role-Based Access Control) powered by Supabase Auth.
*   **📝 CMS Capabilities**: CRUD operations for Portfolio projects, Link-in-Bio entries, and Global Settings.
*   **🖼️ Media Management**: Integrated file upload for images and assets directly to Supabase Storage.
*   **✅ Type-Safe Forms**: Complex form handling made easy with React Hook Form and Zod validation.
*   **⚙️ Global Config**: Centralized control over feature flags and site-wide configurations.

---

## 🛠️ Tech Stack

| Category | Technology | Description |
| :--- | :--- | :--- |
| **Framework** | `Next.js 15` | App Router |
| **Database** | `Supabase` | PostgreSQL & Storage |
| **Forms** | `React Hook Form` | Form State Management |
| **Validation** | `Zod` | Schema Validation |
| **Security** | `Middleware` | Edge-based Protection |

---

## 🚀 Deployment

### Local Development

To start the development server specifically for the admin panel:

```bash
# From root
npm run dev:admin

# OR specifically
cd apps/admin
npm run dev
```

The application will launch at `http://localhost:3002`.

---

## 📄 License

**Copyright © 2026 Dionatha Goulart.**
All Rights Reserved.
