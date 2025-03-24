import { Injectable, Logger } from "@nestjs/common";
import * as admin from 'firebase-admin'
import { InjectModel } from '@nestjs/mongoose';

import { Model } from "mongoose";
import { Image } from "./entities/image.entity";
import { User } from "src/users/entities/user.entity";
@Injectable()
export class FirebaseStorageService {
    private readonly logger = new Logger(FirebaseStorageService.name);

    constructor(@InjectModel('Image') private readonly imageModel: Model<Image>, @InjectModel('User') private readonly userModel: Model<User>) {
        admin.initializeApp({
            credential: admin.credential.cert(require('../../firebase-admin.json')),
            storageBucket: 'gs://thefisher-3ad16.firebasestorage.app'
        });
    }

    async uploadFile(file: Express.Multer.File, userId: string): Promise<string> {
        const bucket = admin.storage().bucket();
        const fileName = Date.now() + '_' + file.originalname;

        const fileUpload = bucket.file(fileName);

        const stream = fileUpload.createWriteStream({
            metadata: {
                contentType: file.mimetype,
            }
        });

        return new Promise((resolve, reject) => {
            stream.on('error', (error) => {
                this.logger.error('Error uploading:', error);
                reject(error);
            });

            stream.on('finish', async () => {
                this.logger.log(`Successfully upload: ${fileName}`);
                const [url] = await fileUpload.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2030',
                });
                resolve(url);
                const publicUrl = fileUpload.publicUrl();

                // Sauvegarder l'URL dans MongoDB
                await this.saveImageUrl(publicUrl, userId);
            });

            stream.end(file.buffer);
        })
    }

    async getAllFiles(): Promise<any[]> {
        const bucket = admin.storage().bucket();
        
        try {
            const [files] = await bucket.getFiles();
            
            const urlMap = new Map<string, string>();

            // Générer les URLs publiques
            /*const urls = await Promise.all(
                files.map(async (file) => {
                    const [url] = await file.getSignedUrl({
                        action: 'read',
                        expires: '01-01-2030',
                    });
                    return url;
                })
            );
            const images = await this.imageModel.find().exec();

            const imagesWithUrlsAndUsernames = await Promise.all(images.map(async (image, index) => {
                // Récupérer l'utilisateur associé à l'`image.userId`
                const user = await this.userModel.findById(image.userId).select('username').exec();
                
                // Retourner l'URL et le username associé à l'image
                return {
                    url: urls[index],  // Associe l'URL au fichier
                    username: user ? user.username : 'Unknown',  // Si l'utilisateur existe, on récupère son `username`, sinon 'Unknown'
                };
            }));*/
    

            await Promise.all(files.map(async (file) => {
                const [url] = await file.getSignedUrl({
                    action: 'read',
                    expires: '01-01-2030',
                });
                urlMap.set(file.name, url);
            }));
    
            // Récupérer les images de la DB
            const images = await this.imageModel.find().exec();
    
            const imagesWithUrlsAndUsernames = await Promise.all(images.map(async (image) => {
                // Récupérer l'URL du fichier correspondant
                const fileName = image.url.split('/').pop(); // Extraire le nom de fichier
                const publicUrl = fileName && urlMap.has(fileName) ? urlMap.get(fileName)! : 'URL_INDISPONIBLE';
    
                // Récupérer l'utilisateur
                const user = await this.userModel.findById(image.userId).select('username').exec();
                
                return {
                    url: publicUrl,
                    username: user ? user.username : 'Unknown',
                };
            }));

            return imagesWithUrlsAndUsernames;
        
            //return urls;
        } catch (error) {
            this.logger.error('Error retrieving files:', error);
            throw new Error('Failed to retrieve files');
        }
    }

    // Sauvegarde l'URL de l'image dans MongoDB
    private async saveImageUrl(url: string, userId: string): Promise<Image> {
        const newImage = new this.imageModel({
            url,
            userId,
            createdAt: new Date(),
        });
        return newImage.save();
    }
    
}