// A Practice question's sample_input / sample_output can hold several sample
// cases joined by "//.//" (the same separator Learn pages use). Cases are paired
// by position and never trimmed (some outputs are whitespace-aligned tables); a
// side that has fewer cases stays empty rather than being repeated or dropped.
// Mirrors splitSampleCases() in the CLICK web app (index.html) so both show
// identical cases for the same question.
export const SAMPLE_CASE_DELIMITER = "//.//";

export interface SampleCase {
  input: string;
  output: string;
}

export function splitSampleCases(sampleInput: string | null | undefined, sampleOutput: string | null | undefined): SampleCase[] {
  const rawIn = sampleInput == null ? "" : String(sampleInput);
  const rawOut = sampleOutput == null ? "" : String(sampleOutput);
  if (!rawIn && !rawOut) return [];
  if (!rawIn.includes(SAMPLE_CASE_DELIMITER) && !rawOut.includes(SAMPLE_CASE_DELIMITER)) {
    return [{ input: rawIn, output: rawOut }];
  }
  const ins = rawIn.split(SAMPLE_CASE_DELIMITER);
  const outs = rawOut.split(SAMPLE_CASE_DELIMITER);
  return Array.from({ length: Math.max(ins.length, outs.length) }, (_, i) => ({
    input: ins[i] ?? "",
    output: outs[i] ?? "",
  }));
}
