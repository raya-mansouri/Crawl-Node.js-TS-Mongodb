import mongoose, { Document, Schema } from 'mongoose';

export interface IWebsite extends Document {
  name: string;
  domain: string;
  stars: number;
  expirationDate: Date;
  city: string;
}

const websiteSchema: Schema = new Schema({
  name: { type: String, required: true },
  domain: { type: String, required: true },
  stars: { type: Number, required: true },
  expirationDate: { type: Date, required: true },
  city: { type: String, required: true },
});

const Website = mongoose.model<IWebsite>('Website', websiteSchema);

export default Website;