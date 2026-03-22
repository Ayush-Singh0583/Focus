// ================= CORS FIX =================

// domains allowed to call backend
const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173'
];

const corsOptions = {
  origin: function (origin, callback) {

    // allow server-to-server or curl
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.log("Blocked by CORS:", origin);
      callback(new Error("Not allowed by CORS"));
    }

  },

  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization']
};

app.use(cors(corsOptions));

// IMPORTANT → preflight must use SAME options
app.options('*', cors(corsOptions));