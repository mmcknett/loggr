import { useState } from "react";

export function useInProgress(asyncFn: () => Promise<void>): [() => Promise<void>, boolean] {
  const [numInProgress, setNumInProgress] = useState(0);

  const run = async () => {
    setNumInProgress(val => val + 1);
    await asyncFn();
    setNumInProgress(val => val - 1);
  };

  const inProgress = numInProgress > 0;
  return [run, inProgress];
}