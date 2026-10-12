export type WheelInput = {
  width: number;
  offset: number;
  diameter: number;
};

const MM_PER_INCH = 25.4;

/** Distance from the mounting face to the inner edge, in mm. */
export function backspaceMm(wheel: WheelInput): number {
  return (wheel.width * MM_PER_INCH) / 2 + wheel.offset;
}

/** Distance from the mounting face to the outer edge, in mm. */
export function frontspaceMm(wheel: WheelInput): number {
  return (wheel.width * MM_PER_INCH) / 2 - wheel.offset;
}

export type OffsetResult = {
  innerChange: number;
  outerChange: number;
  diameterChange: number;
  oldBackspace: number;
  newBackspace: number;
  oldFrontspace: number;
  newFrontspace: number;
  valid: boolean;
};

/** Compare two wheels without depending on the interactive component. */
export function computeOffset(original: WheelInput, replacement: WheelInput): OffsetResult {
  const oldBackspace = backspaceMm(original);
  const newBackspace = backspaceMm(replacement);
  const oldFrontspace = frontspaceMm(original);
  const newFrontspace = frontspaceMm(replacement);
  const rawDiameter = replacement.diameter - original.diameter;
  const diameterShift = (rawDiameter * MM_PER_INCH) / 2;

  const valid =
    Number.isFinite(original.width) &&
    Number.isFinite(original.offset) &&
    Number.isFinite(original.diameter) &&
    Number.isFinite(replacement.width) &&
    Number.isFinite(replacement.offset) &&
    Number.isFinite(replacement.diameter) &&
    original.width > 0 &&
    replacement.width > 0;

  return {
    innerChange: newBackspace - oldBackspace + diameterShift,
    outerChange: newFrontspace - oldFrontspace + diameterShift,
    diameterChange: rawDiameter,
    oldBackspace,
    newBackspace,
    oldFrontspace,
    newFrontspace,
    valid,
  };
}
