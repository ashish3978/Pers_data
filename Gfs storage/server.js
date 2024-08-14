const express = require('express');
const path = require('path');
const { exec } = require('child_process');
const archiver = require('archiver');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const fs = require('fs');
const registerRoutes = require('./routes/routes');
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/userRoutes');
const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(bodyParser.json());

// Routes
app.use('/api', registerRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Connect to MongoDB
mongoose.connect('mongodb://admin:root@127.0.0.1:27017/?authSource=admin', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => {
  console.log('MongoDB connected');
}).catch(err => {
  console.error(err);
});

const dbName = 'db_Ashish1';
const tempBackupDir = path.join(__dirname, 'tempBackup');
const backupDir = path.join(__dirname, 'backup');
const zipSavePath = path.join(backupDir, 'backup.zip');
const mongodumpPath = '"C:\\Program Files\\MongoDB\\Tools\\100\\bin\\mongodump.exe"';
const mongoUri = 'mongodb://admin:root@127.0.0.1:27017/?authSource=admin'; // MongoDB URI without the database name

// Function to create MongoDB backup
function createBackup() {
    return new Promise((resolve, reject) => {
        const command = `${mongodumpPath} --uri="${mongoUri}" --db=${dbName} --out="${tempBackupDir}"`;
        console.log(`Executing command: ${command}`);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error creating backup: ${stderr}`);
                return reject(`Error creating backup: ${stderr}`);
            }
            console.log('Backup created successfully:', stdout);
            resolve(stdout);
        });
    });
}

// Function to zip the backup folder
function zipBackup() {
    return new Promise((resolve, reject) => {
        if (!fs.existsSync(backupDir)) {
            fs.mkdirSync(backupDir, { recursive: true });
        }

        const output = fs.createWriteStream(zipSavePath);
        const archive = archiver('zip', { zlib: { level: 9 } });

        output.on('close', () => {
            console.log(`Backup zipped successfully: ${zipSavePath}`);
            // Clean up the temporary backup directory
            fs.rmSync(tempBackupDir, { recursive: true, force: true });
            resolve(zipSavePath);
        });

        archive.on('error', (err) => {
            console.error('Error during zipping:', err);
            reject(err);
        });

        archive.pipe(output);
        archive.directory(tempBackupDir, false);
        archive.finalize();
    });
}

// Endpoint to trigger the backup and create the ZIP file
app.get('/create-backup', async (req, res) => {
    try {
        await createBackup();
        await zipBackup();
        res.status(200).send('Backup zip created successfully');
    } catch (err) {
        res.status(500).send(`Error: ${err}`);
    }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
