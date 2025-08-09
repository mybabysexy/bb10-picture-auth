export { default as PictureAuth } from './PictureAuth';

export interface MatrixPosition {
  x: number;
  y: number;
}

export interface UserSetup {
  chosenNumber: number;
  chosenPosition?: { x: number; y: number };
  pictureDataUrl?: string;
}

export type SetupMode = "setup" | "auth-test" | "auth";

export interface PictureAuthProps {
  userSetup: UserSetup | null;
  setUserSetup?: (setup: UserSetup | null) => void;
  mode?: SetupMode;
  onSuccess?: () => void;
  onFailure?: () => void;
  cellSize?: number;
  canvasWidth?: number;
  canvasHeight?: number;
  tolerance?: number;
}
