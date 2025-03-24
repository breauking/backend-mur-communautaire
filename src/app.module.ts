import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';

import { FirebaseStorageService } from './firebase/firebase-storage.service';
import { FirebaseStorageController } from './firebase/firebase-storage.controller';

import { ImageSchema } from './firebase/entities/image.entity';

@Module({
imports: [
MongooseModule.forRoot('mongodb://localhost:27017/auth-workshop'),
MongooseModule.forFeature([
  { name: 'Image', schema: ImageSchema },
]),
UsersModule,
AuthModule,
ConfigModule.forRoot({
envFilePath: '.env',
isGlobal: true,
}),
],
controllers: [AppController, FirebaseStorageController],
providers: [AppService, FirebaseStorageService],
})
export class AppModule {}