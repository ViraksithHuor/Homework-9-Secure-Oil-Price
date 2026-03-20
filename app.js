const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const basicAuth = require("express-basic-auth");
const session = require("express-session");

const app = express();
const PORT = process.env.PORT || 3000;

const BEARER_TOKEN = "super_secret_token_2026";
const AUTH_USERNAME = "admin";
const AUTH_PASSWORD = "oil123";
const LOCAL_ORIGIN = "http://localhost:3000";

const oilPrices = {
  "market": "Global Energy Exchange",
  "last_updated": "2026-03-15T12:55:00Z",
  "currency": "USD",
  "data": [
    {
      "symbol": "WTI",
      "name": "West Texas Intermediate",
      "price": 78.45,
      "change": 0.12
    },
    {
      "symbol": "BRENT",
      "name": "Brent Crude",
      "price": 82.30,
      "change": -0.05
    },
    {
      "symbol": "NAT_GAS",
      "name": "Natural Gas",
      "price": 2.15,
      "change": 0.02
    }
  ]
}

// Middleware setup

function ipFilter(req, res, next) {
  const allowedIps = ["127.0.0.1", "::1", "::ffff:127.0.0.1"];
  const requestIp = req.ip || req.connection.remoteAddress;

  if (allowedIps.includes(requestIp)) {
    return next();
  }

  return res.status(403).json({ error: "Forbidden: IP not allowed" });
}

app.use(ipFilter);

app.use(
  cors({
    origin: LOCAL_ORIGIN
  })
);

const limiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  message: {
    error: "Too many requests. Please try again in 1 minute."
  },
  standardHeaders: true,
  legacyHeaders: false
});

app.use(limiter);

app.use(
  session({
    secret: "super_secret_session_key",
    resave: false,
    saveUninitialized: false
  })
);

app.use(express.json());

// Bearer token auth function

function bearerAuth(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ error: "Unauthorized: Missing Authorization header" });
  }

  if (!authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Unauthorized: Invalid auth format" });
  }

  const token = authHeader.split(" ")[1];

  if (token !== BEARER_TOKEN) {
    return res.status(401).json({ error: "Unauthorized: Invalid token" });
  }

  next();
}

// Dashboard functions

const dashboardBasicAuth = basicAuth({
  users: {
    [AUTH_USERNAME]: AUTH_PASSWORD
  },
  challenge: true,
  unauthorizedResponse: "Unauthorized"
});

function dashboardAuth(req, res, next) {
  if (req.session && req.session.isDashboardAuthenticated) {
    return next();
  }

  dashboardBasicAuth(req, res, function () {
    req.session.isDashboardAuthenticated = true;
    next();
  });
}

// Routes

app.get("/", (req, res) => {
  res.send("Energy API is running");
});

app.get("/api/oil-prices", bearerAuth, (req, res) => {
  res.json(oilPrices);
});

app.get("/dashboard", dashboardAuth, (req, res) => {
  const rows = oilPrices.data
    .map(
      (item) => `
<tr>
<td>${item.symbol}</td>
<td>${item.name}</td>
<td>${item.price}</td>
<td>${item.change}</td>
</tr>`
    )
    .join("");

  res.send(`
<!DOCTYPE html>
<html>
<body>
<h1>${oilPrices.market}</h1>
<p>${oilPrices.last_updated}</p>

<table border="1">
<tr>
<th>Symbol</th>
<th>Name</th>
<th>Price</th>
<th>Change</th>
</tr>
${rows}
</table>

<a href="/logout">Logout</a>
</body>
</html>
  `);
});

app.get("/logout", (req, res) => {
  req.session.destroy(() => {
    res.send("<h1>Logged Out</h1><a href='/'>Home</a>");
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});