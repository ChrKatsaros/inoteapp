import express from 'express';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 10000;

// Σερβίρει τα αρχεία του build φακέλου
app.use(express.static(path.join(process.cwd(), 'build')));

// Για όλα τα routes, στέλνει το index.html (για React Router)
app.get('*', (req, res) => {
  res.sendFile(path.resolve(process.cwd(), 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Frontend server running on port ${PORT}`);
});
