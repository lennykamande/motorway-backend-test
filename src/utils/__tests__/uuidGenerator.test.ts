import { v4 as uuid4 } from 'uuid';
import { vi } from 'vitest';

import { generateUUID } from '@app/utils/uuidGenerator';

vi.mock('uuid', () => ({
  v4: vi.fn(),
}));

describe('generateUUID', () => {
  it('should generate a UUIDv4', () => {
    const mockUUID = '123e4567-e89b-12d3-a456-426614174000';
    (uuid4 as vi.fn).mockReturnValue(mockUUID);

    const result = generateUUID();

    expect(uuid4).toHaveBeenCalled();
    expect(result).toBe(mockUUID);
  });
});
