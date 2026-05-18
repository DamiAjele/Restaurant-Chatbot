import { Request, Response } from 'express';
import * as chatService from '../services/chatService';

// Controller for handling chat messages
export async function handleChat(req: Request, res: Response) {
  const { sessionId, message } = req.body;
  if (!sessionId || typeof sessionId !== 'string') {
    return res.status(400).json({ message: 'sessionId required' });
  }
  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({ message: 'message is required' });
  }

  try {
    const result = await chatService.handleMessage(sessionId, message.trim());
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ message: err.message || 'Server error' });
  }
}
