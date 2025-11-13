import { Request, Response } from 'express';
import { EventUseCase } from '../../usecase/event.usecase.js';
import { catchAsync } from '../../middlewares/catchAsync.js';
import { getCloudinaryResourceType, uploadBufferToCloudinary } from '../services/upload.service.js';

export class EventController {
    constructor(private readonly eventUseCase: EventUseCase) { }

    create = catchAsync(async (req: Request, res: Response) => {
        const user = (req as any).user;
        const files = (req.files as Express.Multer.File[]) || [];
        let uploadedFiles: any[] = [];

        if (files.length) {
            console.log('Uploading files:', files.map(f => ({
                name: f.originalname,
                type: f.mimetype,
                size: f.size
            })));

            uploadedFiles = await Promise.all(
                files.map(async (file) => {
                    try {
                        const resourceType = getCloudinaryResourceType(file.mimetype);
                        const result: any = await uploadBufferToCloudinary(
                            file.buffer,
                            'edentu/events',
                            resourceType
                        );

                        console.log('Upload result:', {
                            filename: file.originalname,
                            url: result.secure_url,
                            resourceType: result.resource_type,
                            format: result.format
                        });

                        return {
                            url: result.secure_url,
                            public_id: result.public_id,
                            filename: file.originalname,
                            provider: 'cloudinary',
                            size: file.size,
                            type: file.mimetype,
                            resource_type: result.resource_type,
                            format: result.format,
                        };
                    } catch (error) {
                        console.error(`Failed to upload ${file.originalname}:`, error);
                        throw new Error(`Failed to upload ${file.originalname}: ${error?.message || ''}`);
                    }
                })
            );
        }

        const payload = {
            ...req.body,
            attachments: uploadedFiles,
        };

        const event = await this.eventUseCase.create(payload, user);
        res.status(201).json(event);
    });

    list = catchAsync(async (req: Request, res: Response) => {
        const events = await this.eventUseCase.list((req as any).user, req.query);
        res.status(200).json(events);
    });

    getById = catchAsync(async (req: Request, res: Response) => {
        const event = await this.eventUseCase.getById(req.params.id, (req as any).user);
        res.json(event);
    });

    update = catchAsync(async (req: Request, res: Response) => {
        const event = await this.eventUseCase.update(req.params.id, req.body, (req as any).user);
        res.json(event);
    });

    remove = catchAsync(async (req: Request, res: Response) => {
        await this.eventUseCase.remove(req.params.id, (req as any).user);
        res.json({ ok: true });
    });

    addParticipants = catchAsync(async (req: Request, res: Response) => {
        await this.eventUseCase.addUsers(req.params.id, (req as any).user, req.body.participants);
        res.json({ success: true, message: `Successfully ${req.body.participants.length} participants added` });
    });

    listEligibleUsers = catchAsync(async (req: Request, res: Response) => {
        const users = await this.eventUseCase.listEligibleUsers(
            req.params.id,
            (req as any).user.id
        );
        res.json(users);
    });

    uploadFiles = catchAsync(async (req: Request, res: Response) => {
        const files = (req.files as Express.Multer.File[]) || [];
        if (!files.length)
            return res.status(400).json({ message: 'No files uploaded' });

        const uploadedFiles = await Promise.all(
            files.map(async (file) => {
                const result: any = await uploadBufferToCloudinary(file.buffer);
                return {
                    url: result.secure_url,
                    filename: file.originalname,
                    provider: 'cloudinary',
                    size: file.size,
                    type: file.mimetype,
                };
            })
        );

        res.status(200).json({ attachments: uploadedFiles });
    });
}
