import { Request, Response } from 'express';
import {prisma} from '../utils/prisma';

const OPTIONS = [
  'Reply with:',
  '1 - Place an order',
  '99 - Checkout',
  '98 - Order history',
  '97 - Current order',
  '0 - Cancel order'
];

// Controller for handling session creation
export async function createSession(req: Request, res: Response) {
  const { deviceId } = req.body;
  if (!deviceId || typeof deviceId !== 'string') {
    return res.status(400).json({ message: 'deviceId required' });
  }

  const session = await prisma.session.upsert({
    where: {
      deviceId,
    },
    update: {}, // Do nothing if it already exists (or update a lastSeen timestamp if you want)
    create: {
      deviceId,
      // ... add any other required fields for creation here
    },
  });

  res.json({
    sessionId: session.id,
    message: `Welcome! What would you like to do?\n${OPTIONS.join('\n')}`,
    options: OPTIONS
  });
}
