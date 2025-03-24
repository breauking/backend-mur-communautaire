import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

@Schema()
export class Image extends Document {
    @Prop({ required: true })
    url: string; // Url de l'image dans firebase storage

    @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
    userId: MongooseSchema.Types.ObjectId;  // ID de l'utilisateur associé

    @Prop({ default: Date.now })
    createdAt: Date;
}

export const ImageSchema = SchemaFactory.createForClass(Image);
