# BB10 Picture Auth

A React component that replicates the BlackBerry 10 picture password authentication interface.

## Installation

```bash
npm install @duc1607/bb10-picture-auth
```

## Usage

```typescript
import React, { useState } from 'react';
import { PictureAuth, UserSetup, SetupMode } from '@duc1607/bb10-picture-auth';

function App() {
  const [userSetup, setUserSetup] = useState<UserSetup | null>(null);
  const [mode, setMode] = useState<SetupMode>('setup');

  const handleSetupComplete = (setup: UserSetup) => {
    setUserSetup(setup);
    setMode('authenticate');
    console.log('Setup completed:', setup);
  };

  const handleAuthComplete = (success: boolean, setup?: UserSetup) => {
    if (success) {
      console.log('Authentication successful!');
    } else {
      console.log('Authentication failed');
    }
  };

  return (
    <div>
      {mode === 'setup' ? (
        <PictureAuth
          mode="setup"
          onComplete={handleSetupComplete}
        />
      ) : (
        <PictureAuth
          userSetup={userSetup}
          mode="authenticate"
          onComplete={handleAuthComplete}
        />
      )}
    </div>
  );
}

export default App;
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
