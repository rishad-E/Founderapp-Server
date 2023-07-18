import { Document, model, Schema, Types } from "mongoose";

export interface IChat extends Document{
    sender:Types.ObjectId,
    receiver:Types.ObjectId,
    message:string,
    createdAt:Date,
}

const chatSchema = new Schema({
    sender: { type: Types.ObjectId, ref:"User", required: true },
    receiver: { type: Types.ObjectId, ref:"User", required: true },
    message: { type: String, required: true },
},
    { timestamps: true }
)

export default model<IChat>('Chat', chatSchema);
