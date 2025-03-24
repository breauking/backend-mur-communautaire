import { Controller, Post, Param, UploadedFile, UseInterceptors, Get, UseGuards, Request } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { FirebaseStorageService } from './firebase-storage.service'
import { JwtAuthGuard } from "src/auth/jwtAuthGuard";

@Controller('storage')
export class FirebaseStorageController {
    constructor(
        private readonly FirebaseStorageService: FirebaseStorageService,
    ) {}

    @Post('upload')
    @UseGuards(JwtAuthGuard)
    @UseInterceptors(FileInterceptor('file'))
    async uploadFile(@Request() req, @UploadedFile() file: Express.Multer.File) {
        const userId = req.user.userId;
        const fileUrl = await this.FirebaseStorageService.uploadFile(file, userId);
        return { fileUrl };
    }

    @Get('files')
    async getAllFiles() {
        return this.FirebaseStorageService.getAllFiles();
    }
}

