import { v4 as uuid4 } from 'uuid';

export const generateUUID = (): string => {
  return uuid4();
};
