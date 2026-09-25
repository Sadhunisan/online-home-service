# Fixly Backend (Spring Boot)

REST API for the Fixly home services platform: auth (JWT), service categories,
providers, and bookings with a status lifecycle (PENDING → CONFIRMED →
IN_PROGRESS → COMPLETED / CANCELLED).

## Run it locally (zero setup)

You need Java 17+ and Maven installed. No database install needed —
it runs on an in-memory H2 database by default.

```bash
cd fixly-backend
mvn spring-boot:run
```

The API is now live at `http://localhost:8080`.

## API summary

| Method | Endpoint                     | Auth?         | Purpose                          |
|--------|-------------------------------|---------------|-----------------------------------|
| POST   | /api/auth/register            | No            | Create a CUSTOMER or PROVIDER account |
| POST   | /api/auth/login                | No            | Get a JWT token                   |
| GET    | /api/services                  | No            | List service categories           |
| GET    | /api/providers?serviceCategoryId=1 | No       | List providers, optionally filtered |
| POST   | /api/bookings                  | Yes (customer)| Create a booking                  |
| GET    | /api/bookings/my               | Yes           | List your bookings (customer) or assigned jobs (provider) |
| PATCH  | /api/bookings/{id}/status      | Yes           | Update a booking's status         |

Send the JWT as: `Authorization: Bearer <token>`

### Register example
```json
POST /api/auth/register
{
  "name": "Anjali Reddy",
  "email": "anjali@example.com",
  "password": "secret123",
  "phone": "9500000000",
  "role": "CUSTOMER"
}
```

### Book a service example
```json
POST /api/bookings
Authorization: Bearer <token>
{
  "serviceCategoryId": 1,
  "address": "12 Anna Nagar, Dharmapuri",
  "notes": "Fuse box tripping repeatedly",
  "preferredDate": "2026-09-10",
  "preferredTime": "15:30"
}
```

## Deploying to Render (free tier)

1. Push this `fixly-backend` folder to its own GitHub repo.
2. On Render.com → New → PostgreSQL → create a free database. Copy its
   **Internal Database URL**, username, and password.
3. On Render → New → Web Service → connect your GitHub repo.
   - Runtime: Docker is not required — Render auto-detects Maven/Java.
   - Build command: `mvn clean package -DskipTests`
   - Start command: `java -jar target/fixly-backend-1.0.0.jar`
4. Add these Environment Variables on the Render service:
   - `DATABASE_URL` = `jdbc:postgresql://<host>:5432/<dbname>` (from step 2, converted to JDBC form)
   - `DATABASE_USERNAME` = your Postgres username
   - `DATABASE_PASSWORD` = your Postgres password
   - `DATABASE_DRIVER` = `org.postgresql.Driver`
   - `JWT_SECRET` = a long random string (32+ characters)
   - `CORS_ORIGINS` = your frontend URL, e.g. `https://fixly.vercel.app`
5. Deploy. Render gives you a URL like `https://fixly-backend.onrender.com` —
   that's your API base URL for the frontend.

Note: Render's free web services sleep after inactivity and take ~30–50s to
wake on the first request. That's normal on the free tier.
