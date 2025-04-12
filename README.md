# JawaStock - Digital Asset Marketplace

JawaStock is a modern digital asset marketplace platform inspired by Shutterstock, designed to facilitate the sharing, discovery, and purchase of high-quality digital assets. The platform allows creators to upload their work and users to browse, preview, and purchase assets with various license types.

## Features

- **User Authentication**: Secure registration and login system with role-based access (user, contributor, admin)
- **Asset Management**: Upload, browse, and manage digital assets including photos, videos, vectors, illustrations, and music
- **Asset Discovery**: Search, filter, and sort functionality to find the perfect assets
- **Shopping Cart**: Add assets to cart with selected license types for batch purchases
- **Checkout Process**: Secure payment processing with Stripe integration
- **User Dashboard**: Track purchases, uploads, and account information
- **Admin Panel**: Approve/reject asset submissions and manage platform content
- **Responsive Design**: Optimized for all device sizes using Tailwind CSS and ShadCN UI components

## Tech Stack

### Frontend
- React
- TypeScript
- Tailwind CSS
- ShadCN UI Components
- React Query
- React Hook Form with Zod validation
- Wouter for routing
- Vite for development and building

### Backend
- Node.js
- Express
- PostgreSQL with Drizzle ORM
- Passport.js for authentication
- Cloudinary for asset storage and transformation
- Stripe for payment processing

### Deployment
- Cloudflare Pages (current)
- Optional Netlify deployment (configured)

## Getting Started

### Prerequisites
- Node.js 20 or later
- PostgreSQL database
- Cloudinary account
- Stripe account (for payments)

### Installation

1. Clone the repository
```bash
git clone https://github.com/your-username/jawastock.git
cd jawastock
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
Create a `.env` file in the root directory with the following variables:
```
# Database
DATABASE_URL=postgresql://username:password@localhost:5432/jawastock

# Cloudinary
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Stripe
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

# Session
SESSION_SECRET=your_session_secret
```

4. Initialize the database
```bash
npm run db:push
```

5. Start the development server
```bash
npm run dev
```

The application will be available at http://localhost:5000.

## Deployment

### Perbandingan Platform Deployment

| Fitur | Cloudflare Pages | Netlify |
|-------|-----------------|---------|
| Build time | Cepat | Cepat |
| Serverless functions | ✅ | ✅ |
| Edge functions | ✅ | ✅ (lebih terbatas) |
| Batas bandwith | Lebih tinggi | Lebih rendah pada tier gratis |
| Custom domain | ✅ | ✅ |
| SSL/TLS | Otomatis | Otomatis |
| CI/CD | GitHub, GitLab | GitHub, GitLab, Bitbucket |
| Database | Tidak terintegrasi langsung | Tidak terintegrasi langsung |
| Harga | Tier free lebih murah | Tier berbayar lebih murah |
| CDN | Cloudflare CDN Global | Netlify CDN Global |

### Cloudflare Pages (Setup Saat Ini)
Proyek ini dikonfigurasi untuk deployment di Cloudflare Pages menggunakan pengaturan di `cloudflare.toml` dan `wrangler.toml`. 

Untuk deploy:
1. Push kode Anda ke repositori GitHub
2. Hubungkan repositori ke Cloudflare Pages
3. Konfigurasi pengaturan build sesuai file `cloudflare.toml`
4. Siapkan variabel lingkungan di dashboard Cloudflare Pages

### Netlify (Setup Alternatif)
Project ini dapat di-deploy di Netlify menggunakan konfigurasi `netlify.toml` yang disediakan.

Untuk deploy ke Netlify:

1. Push kode Anda ke repositori GitHub
2. Login ke [Netlify](https://app.netlify.com/)
3. Klik "Add new site" → "Import an existing project"
4. Pilih repositori GitHub Anda
5. Konfigurasi pengaturan build:
   - Build command: `npm run build`
   - Publish directory: `dist`

6. Konfigurasi variabel lingkungan di dashboard Netlify:
   - DATABASE_URL: URL database PostgreSQL Anda (gunakan layanan seperti Neon, Supabase, atau Railway)
   - CLOUDINARY_CLOUD_NAME: Nama cloud Cloudinary Anda
   - CLOUDINARY_API_KEY: API key Cloudinary Anda
   - CLOUDINARY_API_SECRET: API secret Cloudinary Anda
   - STRIPE_SECRET_KEY: Secret key Stripe Anda (opsional jika menggunakan pembayaran)
   - SESSION_SECRET: String acak untuk keamanan sesi

7. Klik "Deploy site"

8. Setelah deployment, Anda perlu menjalankan migrasi database. Ini dapat dilakukan dengan:
   - Menggunakan Netlify CLI: `netlify functions:invoke db-migrate`
   - Atau, tambahkan migrasi otomatis pada saat startup aplikasi

#### Mengatasi Masalah Netlify

Jika Anda mengalami masalah dengan deployment Netlify:

1. Periksa log build di dashboard Netlify
2. Pastikan semua variabel lingkungan telah dikonfigurasi dengan benar
3. Periksa apakah database PostgreSQL dapat diakses dari Netlify Functions
4. Jika mengalami masalah dengan modul native seperti `sharp`, pastikan telah menambahkan ke `external_node_modules` di `netlify.toml`

**Kesalahan Umum dan Solusinya:**

1. **Error: "vite not found"**
   - Solusi: Pastikan NODE_ENV=development di environment variables atau gunakan `npm install --include=dev` dalam build command

2. **Error: Module not found: Can't resolve [package]**
   - Solusi: Pindahkan package dari devDependencies ke dependencies di package.json

3. **Error: Function invocation timed out**
   - Solusi: Tambahkan `timeout = 30` di konfigurasi fungsi di netlify.toml

4. **Error: Failed to connect to database**
   - Solusi: Pastikan alamat database dapat diakses dari luar dan kredensial benar
   - Gunakan database yang mendukung koneksi dari serverless functions (Neon, Supabase, Railway)

## Project Structure

```
jawastock/
├── client/              # Frontend React application
│   ├── src/
│   │   ├── components/  # UI components
│   │   ├── contexts/    # React contexts (auth, cart)
│   │   ├── hooks/       # Custom React hooks
│   │   ├── lib/         # Utility functions and API client
│   │   ├── pages/       # Application pages
│   │   └── App.tsx      # Main application component
├── server/              # Backend Express server
│   ├── cloudinary.ts    # Cloudinary integration
│   ├── db.ts            # Database connection
│   ├── index.ts         # Server entry point
│   ├── routes.ts        # API routes
│   ├── storage.ts       # Data storage interface
│   ├── upload.ts        # File upload handling
│   └── vite.ts          # Vite integration for development
├── shared/              # Shared code between frontend and backend
│   └── schema.ts        # Database schema and types
├── functions/           # Cloudflare serverless functions
└── scripts/             # Deployment and maintenance scripts
```

## License

[MIT License](LICENSE)

## Contact

For questions or support, please open an issue on the repository.