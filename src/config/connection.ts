import mongoose from "mongoose";

export default function (connectionString:string) {
    mongoose.set("strictQuery", true);
    mongoose.connect(connectionString)
        .then(() => {
            console.log("Database connected successfully")
        }).catch(console.error)
}