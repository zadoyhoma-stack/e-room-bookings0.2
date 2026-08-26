const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, 'database.json');
try {
  const data = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  if (data.rooms) {
    const initialLength = data.rooms.length;
    data.rooms = data.rooms.filter(r => r.id !== 'r15');
    console.log(`Rooms before: ${initialLength}, after: ${data.rooms.length}`);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');
    console.log('Successfully removed room 15');
  }
} catch (e) {
  console.error('Error:', e.message);
}
