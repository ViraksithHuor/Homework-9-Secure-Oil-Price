# Homework-9-Secure-Oil-Price

Bearer token: super_secret_token_2026

Username: admin

Password: oil123

Instructions:

Use `npm start` to run.

Go to http://localhost:3000/dashboard to view dashboard

Tests:

Bearer token positive: curl -H "Authorization: Bearer super_secret_token_2026" http://localhost:3000/api/oil-prices<br>
Bearer token missing: curl http://localhost:3000/api/oil-prices<br>
Bearer token negative: curl -H "Authorization: Bearer wrongtoken" http://localhost:3000/api/oil-prices

Spam the bearer token positive command to test rate limit