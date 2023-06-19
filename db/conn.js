const mongoose = require("mongoose");

const DB = process.env.DATABASE;

mongoose.connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("Database connected successfully"))
.catch((err) => console.log("Error connecting to database: ", err));