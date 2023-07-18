import { Document, model, Schema, Types } from "mongoose";

export interface Event extends Document{
    mentorName:string;
    title:string;
    description:string;
    dateAndTime:Date;
    venue:string;
    joinLink:string;
    enrollmentFee:number;
    mentorImage:string;
    attendees:Types.ObjectId[];
}

const eventSchema = new Schema({
    mentorName:{ type:String, required:true },
    title:{ type:String, required:true },
    description:{ type:String, required:true },
    dateAndTime:{type:Date, required:true},
    venue:{type:String,required:true},
    joinLink:{type:String,required:true},
    enrollmentFee:{type:Number,required:true},
    mentorImage:{type:String, required:true},
    attendees:{ type:[Types.ObjectId], ref: 'User' },
},
    { timestamps: true }
)

export default model<Event>('Event', eventSchema);
