declare global {
  // Add type for global mongoose connection
  const mongoose: {
    conn: unknown | null;
    promise: Promise<unknown> | null;
  };
}

export {};