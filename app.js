const express = require('express');
const sequelize = require('./util/database');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const userRoutes = require('./routes/user');

const app = express();
app.use(cors({
    origin: '*',
    methods:['GET','POST'],
  
  }));
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'));

app.use('/home',(req,res) => {
    res.sendFile('signup.html',{root:'views'});
})
app.use('/user', userRoutes);

app.get('/', (req, res) => {
    res.sendFile('notfound.html',{root:'views'});
});

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