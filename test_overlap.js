const testCases = [
  { s1: "10:00", e1: "12:00", s2: "12:00", e2: "14:00", expect: false }, // Back to back
  { s1: "12:00", e1: "14:00", s2: "10:00", e2: "12:00", expect: false }, // Back to back
  { s1: "10:00", e1: "12:00", s2: "11:00", e2: "13:00", expect: true }, // Overlap right
  { s1: "11:00", e1: "13:00", s2: "10:00", e2: "12:00", expect: true }, // Overlap left
  { s1: "10:00", e1: "12:00", s2: "10:30", e2: "11:30", expect: true }, // Inside
  { s1: "10:30", e1: "11:30", s2: "10:00", e2: "12:00", expect: true }, // Encompassing
  { s1: "10:00", e1: "12:00", s2: "10:00", e2: "12:00", expect: true }, // Exact
  { s1: "10:00", e1: "11:00", s2: "10:30", e2: "11:30", expect: true },
];

function checkOverlap(bStartTime, bEndTime, startTime, endTime) {
  return (
    (startTime >= bStartTime && startTime < bEndTime) ||
    (endTime > bStartTime && endTime <= bEndTime) ||
    (startTime <= bStartTime && endTime >= bEndTime)
  );
}

testCases.forEach((tc, i) => {
  const result = checkOverlap(tc.s1, tc.e1, tc.s2, tc.e2);
  console.log(`Test ${i + 1}: ${result === tc.expect ? "PASS" : "FAIL"}`);
});
