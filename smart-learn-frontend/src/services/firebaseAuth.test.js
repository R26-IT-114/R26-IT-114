import {
  browserLocalPersistence,
  browserSessionPersistence,
  setPersistence,
} from 'firebase/auth';
import { setAuthPersistenceMode } from './firebaseAuth';

vi.mock('firebase/auth', async () => {
  const actual = await vi.importActual('firebase/auth');
  return {
    ...actual,
    setPersistence: vi.fn().mockResolvedValue(undefined),
  };
});

describe('setAuthPersistenceMode', () => {
  it('uses local persistence when rememberMe is true', async () => {
    await setAuthPersistenceMode(true);

    expect(setPersistence).toHaveBeenCalledWith(expect.anything(), browserLocalPersistence);
  });

  it('uses session persistence when rememberMe is false', async () => {
    await setAuthPersistenceMode(false);

    expect(setPersistence).toHaveBeenCalledWith(expect.anything(), browserSessionPersistence);
  });
});
