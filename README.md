# BB10 Picture Auth

A React component that replicates the BlackBerry 10 picture password authentication interface.

## Installation

```bash
npm install @duc1607/bb10-picture-auth
```

## Usage

```typescript
import { useEffect, useState } from "react";
import PictureAuth from "@duc1607/bb10-picture-auth";
import { type SetupMode, type UserSetup } from "@duc1607/bb10-picture-auth";

export default function App() {
  const [userSetup, setUserSetup] = useState<UserSetup | null>(null);
  const [mode, setMode] = useState<SetupMode>("setup");
  const [setupStep, setSetupStep] = useState<
    null | "image" | "number" | "position" | "test" | "finish"
  >(null);
  const [pictureDataUrl, setPictureDataUrl] = useState<string | null>(null);

  const SIZE = 300;

  // Handle picture upload
  const handlePictureUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) return;

    const file = event.target.files?.[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const dataUrl = e.target?.result as string;
        setPictureDataUrl(dataUrl);

        setUserSetup((prevSetup) => {
          if (!prevSetup || prevSetup.chosenNumber === undefined) {
            return prevSetup;
          }
          return {
            ...prevSetup,
            pictureDataUrl: dataUrl || undefined,
          };
        });
      };
      reader.readAsDataURL(file);
    }
  };

  useEffect(() => {
    // Initialize user setup if not already set
    if (!userSetup) {
      setSetupStep("number");
    }
  }, [userSetup]);

  return (
    <div className="App">
      {mode === "auth" && (
        <PictureAuth
          userSetup={userSetup}
          mode={mode}
          onSuccess={() => console.log("Authentication successful!")}
          onFailure={() => console.log("Authentication failed!")}
          canvasWidth={SIZE}
          canvasHeight={SIZE}
        />
      )}

      {mode !== "auth" && (
        <div>
          <h1>Welcome to the Picture Password Setup</h1>
          {setupStep === "number" && (
            <div>
              <h2>Choose a Number</h2>
              <select
                onChange={(e) =>
                  setUserSetup({ chosenNumber: parseInt(e.target.value, 10) })
                }
              >
                <option value="">Select a number</option>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
              <button onClick={() => setSetupStep("image")}>Next</button>
            </div>
          )}
          {setupStep === "image" && (
            <div>
              <h2>Upload Your Picture</h2>
              <input
                type="file"
                accept="image/*"
                onChange={handlePictureUpload}
              />
              {pictureDataUrl && (
                <img
                  src={pictureDataUrl}
                  alt="Uploaded"
                  style={{ maxWidth: "200px" }}
                />
              )}
              <button onClick={() => setSetupStep("position")}>Next</button>
            </div>
          )}
          {(setupStep === "position" || setupStep === "test") && (
            <div>
              {setupStep === "position" ? (
                <h2>Click on the Picture to Set Position</h2>
              ) : (
                <h2>Test Your Setup</h2>
              )}
              <PictureAuth
                userSetup={userSetup}
                setUserSetup={setUserSetup}
                mode={mode}
                onSuccess={() => {
                  setSetupStep("finish");
                }}
                canvasWidth={SIZE}
                canvasHeight={SIZE}
              />
              {setupStep === "position" && (
                <button
                  onClick={() => {
                    setSetupStep("test");
                    setMode("auth-test");
                  }}
                >
                  Next
                </button>
              )}
            </div>
          )}
          {setupStep === "finish" && (
            <div>
              <h2>Setup Complete</h2>
              <p>Your picture password is ready to use!</p>
              <pre>{JSON.stringify(userSetup, null, 2)}</pre>
              <button onClick={() => setMode("auth")}>
                Start Authentication
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
```

## Features

- **Authentic BB10 Design**: Faithful recreation of the BlackBerry 10 picture password interface
- **Canvas Rendering**: High-performance matrix rendering with smooth animations
- **Touch/Mouse Support**: Works with both touch and mouse interactions
- **TypeScript Support**: Full TypeScript definitions included
- **Fade Animation**: Visual feedback with fade effects during interaction
- **Secure Authentication**: Position-based password verification

## Development

This component is built with:
- React 19+
- TypeScript
- HTML5 Canvas API
- Vite (for building)

## License

MIT
