import { Request, Response } from 'express';
import { EventUseCase } from '../../usecase/event.usecase.js';
import { catchAsync } from '../../middlewares/catchAsync.js';
import { uploadEventFiles } from '../services/upload.service.js';

export class EventController {
    constructor(private readonly eventUseCase: EventUseCase) { }

    create = catchAsync(async (req: Request, res: Response) => {
        const user = (req as any).user;
        const files = (req.files as Express.Multer.File[]) || [];
        let uploadedFiles: any[] = [];

        if (files.length) {
            uploadedFiles = await uploadEventFiles(files)
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
        const user = (req as any).user;
        const files = (req.files as Express.Multer.File[]) || [];
        let newAttachments: any[] = [];

        if (files.length > 0) {
            newAttachments = await uploadEventFiles(files);
        }

        const payload = {
            ...req.body,
            ...(newAttachments.length > 0 && { newAttachments }),
            ...(req.body.removedPublicIds && {
                removedPublicIds: Array.isArray(req.body.removedPublicIds)
                    ? req.body.removedPublicIds
                    : JSON.parse(req.body.removedPublicIds || '[]')
            })
        };

        const event = await this.eventUseCase.update(req.params.id, payload, user);
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
}
