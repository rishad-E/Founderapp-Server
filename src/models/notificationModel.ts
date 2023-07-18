import { Document, model, Schema, Types } from "mongoose";

export interface INotification extends Document {
    type: string,
    sender: Types.ObjectId,
    receiver: Types.ObjectId,
    message: string,
    isRead: boolean
}

const notificationSchema = new Schema({
    type: {type: String, required: true },
    sender: { type: Types.ObjectId, ref: "User", required: true },
    receiver: { type: Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    isRead:{type:Boolean, default:false}
},
    { timestamps: true }
)

export default model<INotification>('Notification', notificationSchema);
