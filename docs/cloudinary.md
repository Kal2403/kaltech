# Cloudinary image uploads

KalTech uploads product and category images through the backend. Cloudinary
credentials must never be exposed to the browser or committed to Git.

## Environment variables

Configure these values in `server/.env`:

```text
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

Use the credentials from the Cloudinary environment intended for the current
deployment. The server reports a controlled error when the configuration is
missing; it never returns credential values.

## API contract

```http
POST /api/uploads/image
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

Multipart fields:

- `image`: one required JPEG, PNG, or WebP file, up to 5 MiB.
- `context`: optional `product` or `category`; defaults to `product`.

The endpoint returns an HTTPS URL and Cloudinary public identifier. Product and
category CRUD requests continue to store URLs, so existing external URLs remain
compatible.

## Existing records and lifecycle

No database migration is required. Existing image URLs remain readable and can
be replaced through the administrative forms.

The current product/category schemas do not persist Cloudinary `publicId`.
Automatic deletion and orphan cleanup are therefore intentionally deferred to a
future lifecycle change. Do not delete an existing remote asset before a new URL
has been saved successfully.
