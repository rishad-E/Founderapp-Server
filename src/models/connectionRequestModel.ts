import { Document, model, Schema, Types } from "mongoose";

export interface IRequest extends Document{
    sender:Types.ObjectId,
    receiver:Types.ObjectId,
    status:string
}

const connectionRequestSchema = new Schema({
    sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
},
    { timestamps: true }
)

export default model<IRequest>('Request', connectionRequestSchema);