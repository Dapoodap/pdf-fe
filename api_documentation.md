# PDF Toolkit Backend API Documentation

**Base URL**: `http://localhost:8000`  
**Authentication**: Most endpoints require a Bearer Token via the `Authorization` header (`Authorization: Bearer <token>`) or an API Key via the `X-API-Key` header. If no token/key is provided, strict backend limits apply (100MB max per file, max 3 files for merge).

---

## 1. Authentication (Auth)

### 1.1 Register User
Register a new user account.

- **Method**: `POST`
- **Endpoint**: `/auth/register`
- **Headers**: `Content-Type: application/json`
- **Request Body** (JSON):
```json
{
  "username": "johndoe",
  "password": "securepassword123",
  "email": "johndoe@example.com"
}
```
- **Response** (200 OK):
```json
{
  "message": "Registration successful for johndoe."
}
```

### 1.2 Login User
Authenticate and receive a JWT Access Token.

- **Method**: `POST`
- **Endpoint**: `/auth/login`
- **Headers**: `Content-Type: application/x-www-form-urlencoded`
- **Request Body** (Form Data):
  - `username` (string): Username
  - `password` (string): Password
- **Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
  "token_type": "bearer"
}
```

### 1.3 Get Me (Profile & Subscription Status)
Retrieve current user's profile and dynamic membership status.

- **Method**: `GET`
- **Endpoint**: `/auth/me`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
```json
{
  "id": 1,
  "username": "johndoe",
  "email": "johndoe@example.com",
  "membership_status": "premium",
  "subscription_start_date": "2024-05-18T10:30:00Z",
  "subscription_end_date": "2024-06-18T10:30:00Z",
  "total_files_processed": 5
}
```
*(Note: `membership_status` can be `"basic"`, `"premium"`, or `"expired"`).*

---

## 2. Pricing & Subscriptions

### 2.1 Get Pricing Plans
Get all available pricing plans.

- **Method**: `GET`
- **Endpoint**: `/pricing/`
- **Response** (200 OK):
```json
[
  {
    "id": 1,
    "price": 10000.0,
    "description": "Premium Monthly",
    "plan_type": "monthly",
    "duration_days": 30
  }
]
```

### 2.2 Subscribe (Create Transaction & Subscription)
Subscribe to a plan. Automatically accumulates days if the user already has an active subscription. Prepares the transaction for Midtrans.

- **Method**: `POST`
- **Endpoint**: `/transaction/subscribe`
- **Headers**: `Authorization: Bearer <token>`
- **Request Body** (JSON):
```json
{
  "pricing_id": 1
}
```
- **Response** (200 OK):
```json
{
  "message": "Subscription successful",
  "transaction_id": 5,
  "subscription_id": 2,
  "start_date": "2024-05-18T10:30:00Z",
  "end_date": "2024-06-18T10:30:00Z"
}
```

### 2.3 Get Transaction History
Retrieve the logged in user's transactions.

- **Method**: `GET`
- **Endpoint**: `/transaction/`
- **Headers**: `Authorization: Bearer <token>`
- **Response** (200 OK):
```json
[
  {
    "id": 5,
    "amount": 10000.0,
    "status": "pending",
    "created_at": "2024-05-18T10:30:00Z"
  }
]
```

---

## 3. History

### 3.1 Get Download URL
Retrieve a temporary presigned URL (valid for 60 mins) to download a previously processed file.

- **Method**: `GET`
- **Endpoint**: `/history/{history_id}/download-url`
- **Headers**: `Authorization: Bearer <token>`
- **Path Parameter**: `history_id` (integer)
- **Response** (200 OK):
```json
{
  "url": "https://storage.googleapis.com/your-bucket/pdf/merge/file.pdf?X-Goog-Algorithm=...",
  "expires_in": "60 minutes",
  "file_name": "1234abcd_merged.pdf"
}
```

### 3.2 Get User File History
Fetch all file processing history associated with a specific user.

- **Method**: `GET`
- **Endpoint**: `/history/user/{user_id}`
- **Headers**: `Authorization: Bearer <token>`
- **Path Parameter**: `user_id` (integer)
- **Response** (200 OK):
```json
[
  {
    "id": 1,
    "service_id": 2,
    "file_name": "1234abcd_merged.pdf",
    "file_type": "pdf",
    "created_at": "2024-05-18T10:30:00Z"
  }
]
```

---

## 4. PDF Manipulation

### 4.1 Merge PDFs
Combine multiple PDF files into one.

- **Method**: `POST`
- **Endpoint**: `/manipulate/merge`
- **Headers**: `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`
- **Request Body** (Form Data):
  - `files` (File Upload List): At least 2 PDF files.
  - `rotations` (String, Optional): JSON array of rotation degrees mapping to each file (e.g., `[90, 0, 180]`).
- **Response** (200 OK):
```json
{
  "message": "Success",
  "history_id": 2,
  "file_path": "pdf/merge/uuid_merged.pdf",
  "file_name": "uuid_merged.pdf",
  "download_url": "https://storage.googleapis.com/..."
}
```

### 4.2 Rotate PDF Pages
Rotate specific pages in a PDF.

- **Method**: `POST`
- **Endpoint**: `/manipulate/rotate`
- **Headers**: `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`
- **Request Body** (Form Data):
  - `file` (File Upload): The PDF file.
  - `degrees` (Integer): Degrees to rotate (e.g., `90`, `180`, `270`).
  - `pages` (String, Optional): JSON array of page indices to rotate (0-indexed). If omitted, rotates all pages. (e.g., `[0, 2]`).
- **Response** (200 OK): Same as Merge response format.

### 4.3 Reorder/Extract PDF Pages
Create a new PDF containing only specific pages in a specific order.

- **Method**: `POST`
- **Endpoint**: `/manipulate/order`
- **Headers**: `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`
- **Request Body** (Form Data):
  - `file` (File Upload): The PDF file.
  - `pages` (String): JSON array of page indices representing the new order (0-indexed). (e.g., `[2, 0, 1]`).
- **Response** (200 OK): Same as Merge response format.

### 4.4 Lock PDF
Encrypt a PDF with a password.

- **Method**: `POST`
- **Endpoint**: `/manipulate/lock`
- **Headers**: `Content-Type: multipart/form-data`, `Authorization: Bearer <token>`
- **Request Body** (Form Data):
  - `file` (File Upload): The PDF file.
  - `password` (String): The password to secure the file.
- **Response** (200 OK): Same as Merge response format.

---

## 5. PDF Conversion

*(Note: All Conversion endpoints return the same JSON Response format as the Manipulation endpoints, containing the `download_url` and `history_id`)*

### 5.1 PDF to Images
Extract pages from a PDF to PNG images. Returns a `.zip` if multiple pages, or a single `.png` if 1 page.

- **Method**: `POST`
- **Endpoint**: `/convert/pdf-to-images`
- **Request Body** (Form Data):
  - `file` (File Upload): The PDF file.

### 5.2 PDF to Word (Docx)
Convert PDF to Microsoft Word format.

- **Method**: `POST`
- **Endpoint**: `/convert/pdf-to-docx`
- **Request Body** (Form Data):
  - `file` (File Upload): The PDF file.

### 5.3 PDF to Excel (Xlsx)
Extract tables from a PDF to Microsoft Excel format.

- **Method**: `POST`
- **Endpoint**: `/convert/pdf-to-xlsx`
- **Request Body** (Form Data):
  - `file` (File Upload): The PDF file.

### 5.4 PDF to PowerPoint (Pptx)
Convert PDF pages to PowerPoint slides.

- **Method**: `POST`
- **Endpoint**: `/convert/pdf-to-pptx`
- **Request Body** (Form Data):
  - `file` (File Upload): The PDF file.

### 5.5 Any Format to PDF
Convert an image or Office document to PDF. Supported formats: `.png`, `.jpg`, `.jpeg`, `.docx`, `.xlsx`, `.pptx`.

- **Method**: `POST`
- **Endpoint**: `/convert/to-pdf`
- **Request Body** (Form Data):
  - `file` (File Upload): The source file.
