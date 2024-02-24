const express = require('express');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();
const jwt = require('jsonwebtoken');

const User = require('./models/User');
const Chat = require('./models/Chat');
const Groups = require("./models/groups");
const GroupMember = require('./models/Group-members');

const userRoutes = require('./routes/user');
const chatRoutes = require('./routes/chat');

const app = express();
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],

}));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use('/home', (req, res) => {
    res.sendFile('signup.html', { root: 'views' });
})
app.use('/user', userRoutes);
app.use('/chat', chatRoutes);
app.get('/', (req, res) => {
    res.sendFile('notfound.html', { root: 'views' });
});

User.hasMany(Chat)
Chat.belongsTo(User);
Groups.hasMany(Chat, { constraints: true, onDelete: 'CASCADE' });
Chat.belongsTo(Groups);
User.belongsToMany(Groups, { through: GroupMember });
Groups.belongsToMany(User, { through: GroupMember ,onDelete: 'CASCADE'});
Groups.belongsTo(User, { foreignKey: 'AdminId', constraints: true, onDelete: 'CASCADE' })

const PORT = process.env.PORT
async function initiate() {
    try {
        await sequelize.sync()
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}...`)
        })
    } catch (error) {
        console.log(error)
    }
}

initiate()  