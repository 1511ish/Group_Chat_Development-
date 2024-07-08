// const { createServer } = require("http");
const http = require("http");
const { Server } = require("socket.io");
const express = require('express');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const cors = require('cors');
const multer = require('multer');
const upload = multer();
require('dotenv').config();

const User = require('./models/user');
const Chat = require('./models/chat');
const Group = require("./models/group");
const GroupMember = require('./models/group_member');
// const ForgetPasswordRequest = require('./models/forgot-password');

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');
const groupRoutes = require('./routes/group');
const passwordRoutes = require('./routes/password');

const Awsservice = require('./services/awsservice');
const cronService = require('./services/cron');

cronService.job.start();

const app = express();
const server = http.createServer(app);
const io = new Server(server);
io.on('connection', (socket) => {
    console.log("a new user has connected", socket.id);
    socket.on('new-group-message', (groupId) => {
        console.log("naya message aay abhai..", groupId);
        socket.broadcast.emit('group-message', groupId);
    })
})

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.get('/', (req, res) => {
    res.sendFile('main.html', { root: 'views' });
})
app.get('/login',(req,res) => {
    res.sendFile('login.html', { root: 'views' });
})
app.get('/signup',(req,res) => {
    res.sendFile('signup.html', { root: 'views' });
})
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.use('/group', groupRoutes);
app.post('/upload', upload.single('media'), async (req, res) => {
    try {
        const file = req.file;
        const filename = file.originalname;
        const data = file.buffer;
        const URL = await Awsservice.uploadToS3(data, filename);
        return res.status(201).send(URL);
    } catch (err) {
        console.log(err);
        res.status(500).send('Error uploading file to S3');
    }
});
app.use('/password', passwordRoutes);
app.use((req, res) => {
    res.sendFile('notfound.html', { root: 'views' });
});



User.hasMany(Chat)
Chat.belongsTo(User);
Group.hasMany(Chat, { constraints: true, onDelete: 'CASCADE' });
Chat.belongsTo(Group);
User.belongsToMany(Group, { through: GroupMember });
Group.belongsToMany(User, { through: GroupMember, onDelete: 'CASCADE' });
Group.belongsTo(User, { foreignKey: 'adminId', constraints: true, onDelete: 'CASCADE' })

const PORT = process.env.PORT
async function initiate() {
    try {
        await sequelize.sync()
        server.listen(PORT, () => {
            console.log(`Server running on port ${PORT}...`)
        })
    } catch (error) {
        console.log(error)
    }
}

initiate()