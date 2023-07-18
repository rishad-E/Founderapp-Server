import { Document, model, Schema, Types } from "mongoose";

export interface IUser extends Document {
    userName: string;
    email: string;
    password: string;
    status: string;
    gender: string;
    age: number;
    intro: string;
    websiteUrl: string;
    profilePhoto:string;
    location: { country: string, state: string, city: string };
    eduction: string;
    employment: string;
    isTechnical: number;
    accomplishments: string;
    haveIdea: string;
    responsibilities:string[];
    interests:string[];
    activelySeeking:number;
    cofounderTechnical:number;
    cofounderHasIdea:number;
    locationPreference:number;
    cofounderResponsibilities:string[];
    connections: Types.ObjectId[];
}

const userSchema = new Schema({
    userName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    status: { type: String, default: "Active" },
    age: { type: Number },
    gender: String,
    intro: String,
    profilePhoto:String,
    websiteUrl: String,
    location: {
        country: String,
        state: String,
        city: String
    },
    isTechnical: { type: Number },
    accomplishments: { type: String },
    haveIdea: { type: String },
    education: String,
    employment: String,
    responsibilities: [String],
    interests: [String],
    activelySeeking:{type:Number},
    cofounderTechnical:{type:Number},
    cofounderHasIdea:{type:Number},
    locationPreference:{type:Number},
    cofounderResponsibilities:[String],
    connections: [{ type: Types.ObjectId, ref: 'User' }]
},
    { timestamps: true }
)

export default model<IUser>('User', userSchema);
