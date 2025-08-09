import { useRef, useState, useEffect, useCallback, useMemo } from "react";
import type { MatrixPosition, PictureAuthProps } from "./index";

export default function PictureAuth({
  userSetup,
  setUserSetup,
  mode = "auth",
  onSuccess,
  onFailure,
  cellSize = 50, // Default cell size
  canvasWidth = 300, // Default canvas width
  canvasHeight = 300, // Default canvas height
}: PictureAuthProps) {
  const { chosenNumber, pictureDataUrl } = userSetup || {};

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [numberMatrix, setNumberMatrix] = useState<number[][]>([]);
  const [matrixPosition, setMatrixPosition] = useState<MatrixPosition>({
    x: 0,
    y: 0,
  });
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number }>({
    x: 0,
    y: 0,
  });
  const dragAnimationRef = useRef<number>(0);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);
  const [matrixOpacity, setMatrixOpacity] = useState<number>(1);

  const isSetupMode = useMemo(() => mode === "setup", [mode]);
  const isAuthTestMode = useMemo(() => mode === "auth-test", [mode]);

  // Calculate dynamic grid size based on canvas dimensions
  const getGridSize = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return 36; // fallback

    const maxCanvasDimension = Math.max(canvas.width, canvas.height);
    const targetMatrixSize = maxCanvasDimension * 3; // Double the larger canvas dimension
    const gridSize = Math.ceil(targetMatrixSize / cellSize);

    return gridSize;
  }, [cellSize]);

  // Generate random number matrix
  const generateNumberMatrix = useCallback(() => {
    if (chosenNumber === undefined) return [];

    const gridSize = getGridSize();
    const matrix: number[][] = [];
    for (let i = 0; i < gridSize; i++) {
      const row: number[] = [];
      for (let j = 0; j < gridSize; j++) {
        row.push(Math.floor(Math.random() * 10));
      }
      matrix.push(row);
    }

    // Ensure the chosen number appears at least once in the matrix
    const randomRow = Math.floor(Math.random() * gridSize);
    const randomCol = Math.floor(Math.random() * gridSize);
    matrix[randomRow][randomCol] = chosenNumber;

    return matrix;
  }, [chosenNumber, getGridSize]);

  // Draw on canvas
  const drawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;

    function drawMatrix() {
      if (!ctx || !canvas || numberMatrix.length === 0) return;

      // Only draw matrix if target position has been set (userSetup exists)
      if (!userSetup?.chosenPosition || mode === "setup") return;

      // Set matrix opacity for fade effect
      ctx.globalAlpha = matrixOpacity;

      // Don't draw matrix background to hide edges

      // Draw grid and numbers - only draw cells that are at least partially visible
      for (let row = 0; row < getGridSize(); row++) {
        for (let col = 0; col < getGridSize(); col++) {
          const x = matrixPosition.x + col * cellSize;
          const y = matrixPosition.y + row * cellSize;

          // Only draw if the cell is at least partially visible on canvas
          if (
            x + cellSize > 0 &&
            x < canvas.width &&
            y + cellSize > 0 &&
            y < canvas.height
          ) {
            const number = numberMatrix[row][col];

            // Make background transparent - no fill, no borders

            // Draw number with white text and subtle shadow (same for all numbers)
            ctx.shadowColor = "rgba(0, 0, 0, 0.4)";
            ctx.shadowBlur = 1;
            ctx.shadowOffsetX = 1;
            ctx.shadowOffsetY = 1;
            ctx.fillStyle = "white";

            ctx.font = "bold 24px Helvetica, Arial, sans-serif";
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillText(number.toString(), x + cellSize / 2, y + cellSize / 2);

            // Reset shadow for next drawings
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
          }
        }
      }

      // Reset global alpha
      ctx.globalAlpha = 1;
    }

    function drawTargetPosition() {
      if (!ctx) return;

      // Draw user's chosen position if in setup mode and position is set
      if (isSetupMode && userSetup?.chosenPosition) {
        ctx.strokeStyle = "#ff0000";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(
          userSetup.chosenPosition.x,
          userSetup.chosenPosition.y,
          25,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // In authentication mode, show the target position
      if (!isSetupMode && isAuthTestMode && userSetup?.chosenPosition) {
        ctx.strokeStyle = "#00ff00";
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.arc(
          userSetup.chosenPosition.x,
          userSetup.chosenPosition.y,
          25,
          0,
          2 * Math.PI
        );
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // Clear canvas once at the start
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw background picture if available and loaded
    if (pictureDataUrl && imageLoaded && imageRef.current) {
      const img = imageRef.current;

      // Calculate scaling to fill canvas (center crop)
      const imgAspect = img.width / img.height;
      const canvasAspect = canvas.width / canvas.height;

      let drawWidth, drawHeight, offsetX, offsetY;

      if (imgAspect > canvasAspect) {
        // Image is wider - fit to height and crop sides
        drawHeight = canvas.height;
        drawWidth = drawHeight * imgAspect;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      } else {
        // Image is taller - fit to width and crop top/bottom
        drawWidth = canvas.width;
        drawHeight = drawWidth / imgAspect;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      }

      ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    // Always draw matrix and target position
    drawMatrix();
    drawTargetPosition();
  }, [
    pictureDataUrl,
    imageLoaded,
    numberMatrix,
    userSetup?.chosenPosition,
    mode,
    matrixOpacity,
    getGridSize,
    matrixPosition.x,
    matrixPosition.y,
    cellSize,
    isSetupMode,
    isAuthTestMode,
  ]);

  // Handle mouse down for dragging
  const handleMouseDown = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas || chosenNumber === undefined) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    if (isSetupMode && setUserSetup) {
      // Set the target position
      setUserSetup({
        chosenNumber,
        chosenPosition: { x, y },
        pictureDataUrl,
      });
      return;
    }

    // Check if clicking on any visible matrix cell for dragging
    // Only allow dragging if target position has been set
    if (!userSetup?.chosenPosition || mode === "setup") return;

    let clickedOnMatrix = false;
    for (let row = 0; row < getGridSize(); row++) {
      for (let col = 0; col < getGridSize(); col++) {
        const cellX = matrixPosition.x + col * cellSize;
        const cellY = matrixPosition.y + row * cellSize;

        // Check if click is on a visible cell
        if (
          cellX + cellSize > 0 &&
          cellX < canvas.width &&
          cellY + cellSize > 0 &&
          cellY < canvas.height &&
          x >= cellX &&
          x <= cellX + cellSize &&
          y >= cellY &&
          y <= cellY + cellSize
        ) {
          clickedOnMatrix = true;
          break;
        }
      }
      if (clickedOnMatrix) break;
    }

    if (clickedOnMatrix) {
      setIsDragging(true);
      setDragStart({ x: x - matrixPosition.x, y: y - matrixPosition.y });
    }
  };

  // Handle mouse move for dragging
  const handleMouseMove = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    // Cancel any previous animation frame
    if (dragAnimationRef.current) {
      cancelAnimationFrame(dragAnimationRef.current);
    }

    // Use requestAnimationFrame for smoother updates
    dragAnimationRef.current = requestAnimationFrame(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      setMatrixPosition({
        x: x - dragStart.x,
        y: y - dragStart.y,
      });
    });
  };

  // Handle mouse up for dropping
  const handleMouseUp = () => {
    // Cancel any pending animation frame
    if (dragAnimationRef.current) {
      cancelAnimationFrame(dragAnimationRef.current);
      dragAnimationRef.current = 0;
    }

    if (isDragging && !isSetupMode && userSetup?.chosenPosition) {
      // Check if the chosen number is aligned with the target position
      const tolerance = cellSize / 2; // Tolerance for matching position
      let authenticationResult = false;

      // Find the chosen number's position in the current matrix position
      for (let row = 0; row < getGridSize(); row++) {
        for (let col = 0; col < getGridSize(); col++) {
          if (numberMatrix[row][col] === chosenNumber) {
            const numberX = matrixPosition.x + col * cellSize + cellSize / 2;
            const numberY = matrixPosition.y + row * cellSize + cellSize / 2;

            const distance = Math.sqrt(
              (numberX - userSetup.chosenPosition.x) ** 2 +
                (numberY - userSetup.chosenPosition.y) ** 2
            );

            if (distance <= tolerance) {
              authenticationResult = true;
              break; // Exit both loops when we find a match
            }
          }
        }
        if (authenticationResult) break;
      }

      // Show result only once
      if (authenticationResult) {
        if (onSuccess) {
          onSuccess();
        }
      } else {
        if (onFailure) {
          onFailure();
        }
      }
    }

    setIsDragging(false);

    // Reset matrix position when dragging stops - use fade animation
    setTimeout(() => {
      regenerateMatrix();
    }, 100); // Small delay to allow authentication check to complete
  };

  // Function to animate matrix opacity smoothly
  const animateMatrixOpacity = useCallback(
    (
      startOpacity: number,
      targetOpacity: number,
      duration: number = 200,
      onComplete?: () => void
    ) => {
      const startTime = performance.now();

      const animateStep = (currentTime: number) => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Easing function for smooth transition
        const easedProgress =
          progress < 0.5
            ? 2 * progress * progress
            : 1 - Math.pow(-2 * progress + 2, 2) / 2;

        const currentOpacity =
          startOpacity + (targetOpacity - startOpacity) * easedProgress;
        setMatrixOpacity(currentOpacity);

        if (progress < 1) {
          requestAnimationFrame(animateStep);
        } else {
          setMatrixOpacity(targetOpacity);
          if (onComplete) onComplete();
        }
      };

      requestAnimationFrame(animateStep);
    },
    []
  );

  // Regenerate matrix
  const regenerateMatrix = () => {
    // Fade out
    animateMatrixOpacity(1, 0, 200, () => {
      // Regenerate matrix and reset position after fade out
      setNumberMatrix(generateNumberMatrix());

      const canvas = canvasRef.current;
      if (canvas) {
        const gridSize = getGridSize();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const matrixCenterX = (gridSize * cellSize) / 2;
        const matrixCenterY = (gridSize * cellSize) / 2;
        setMatrixPosition({
          x: centerX - matrixCenterX,
          y: centerY - matrixCenterY,
        });
      }

      // Fade back in after a small delay
      setTimeout(() => {
        animateMatrixOpacity(0, 1, 200);
      }, 50);
    });
  };

  // Initialize matrix on component mount or when chosen number changes
  useEffect(() => {
    if (chosenNumber !== undefined) {
      setNumberMatrix(generateNumberMatrix());
      // Position matrix so its center is at the center of the canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const gridSize = getGridSize();
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const matrixCenterX = (gridSize * cellSize) / 2;
        const matrixCenterY = (gridSize * cellSize) / 2;
        setMatrixPosition({
          x: centerX - matrixCenterX,
          y: centerY - matrixCenterY,
        });
      }
    }
  }, [chosenNumber, generateNumberMatrix, getGridSize, cellSize]);

  // Handle pictureDataUrl prop changes
  useEffect(() => {
    if (pictureDataUrl) {
      setImageLoaded(false);

      // Pre-load the image from prop
      const img = new Image();
      img.onload = () => {
        imageRef.current = img;
        setImageLoaded(true);
      };
      img.src = pictureDataUrl;
    }
  }, [pictureDataUrl]);

  // Update canvas when dependencies change
  useEffect(() => {
    drawCanvas();
  }, [drawCanvas]);

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (dragAnimationRef.current) {
        cancelAnimationFrame(dragAnimationRef.current);
      }
    };
  }, []);

  // Return null if chosenNumber is not provided
  if (chosenNumber === undefined || chosenNumber === null) {
    return null;
  }

  return (
    <canvas
      className="picture-auth-canvas"
      ref={canvasRef}
      width={canvasWidth}
      height={canvasHeight}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        cursor: isDragging
          ? "grabbing"
          : isSetupMode
          ? "crosshair"
          : userSetup?.chosenPosition
          ? "grab"
          : "default",
        display: "block",
        userSelect: "none",
      }}
    />
  );
}
