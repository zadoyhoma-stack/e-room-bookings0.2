const fs = require('fs');

const data = JSON.parse(fs.readFileSync('./server/database.json', 'utf8'));
const bookings = data.bookings || [];

const overlaps = [];

for (let i = 0; i < bookings.length; i++) {
  for (let j = i + 1; j < bookings.length; j++) {
    const b1 = bookings[i];
    const b2 = bookings[j];

    if (
      b1.roomId === b2.roomId &&
      b1.date === b2.date &&
      (b1.status === 'pending' || b1.status === 'approved') &&
      (b2.status === 'pending' || b2.status === 'approved')
    ) {
      if (
        (b1.startTime >= b2.startTime && b1.startTime < b2.endTime) ||
        (b1.endTime > b2.startTime && b1.endTime <= b2.endTime) ||
        (b1.startTime <= b2.startTime && b1.endTime >= b2.endTime)
      ) {
        overlaps.push({ b1, b2 });
      }
    }
  }
}

console.log(`Found ${overlaps.length} overlapping pairs.`);
overlaps.forEach(o => {
  console.log(`Overlap in room ${o.b1.roomId} on ${o.b1.date}:`);
  console.log(`  B1: ${o.b1.id} (${o.b1.startTime}-${o.b1.endTime}) status=${o.b1.status}`);
  console.log(`  B2: ${o.b2.id} (${o.b2.startTime}-${o.b2.endTime}) status=${o.b2.status}`);
});
