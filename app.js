const express = require('express');
const { engine } = require('express-handlebars');
const app = express();
const path = require('path');
const db = require('./db/connection');
const bodyParser = require(`body-parser`);
const Job = require('./models/Job');
const { where } = require('sequelize');
const { title } = require('process');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;


const PORT = 3000;

app.listen(PORT, function () {
    console.log(`O Express está rodando na porta ${PORT}`);
});

// body parser
app.use(bodyParser.urlencoded({ extended: false }));

//handle bars
app.set('views', path.join(__dirname, 'views'));
app.engine('handlebars', engine({
    defaultLayout: 'main',
    extname: '.handlebars'
}));
app.set('view engine', 'handlebars');

// static folder
app.use(express.static(path.join(__dirname, 'public')));

// db connection

db
    .authenticate()
    .then(() => {
        console.log("Conectou ao banco com sucesso");
        return db.sync(); 
    })
    .then(() => {
        console.log("Tabelas sincronizadas/criadas com sucesso");
    })
    .catch(err => {
        console.log("Ocorreu um erro ao conectar ou sincronizar", err);
    });

//routes
app.get('/', (req, res) => {
    let search = req.query.job;
    console.log("Busca realizada:", search);
    
    if (!search) {
        Job.findAll({ order: [['createdAt', 'DESC']], raw: true })
            .then(jobs => {
                res.render('index', { jobs });
            })
            .catch(err => console.log(err));
    } else {
        let query = '%' + search + '%'; // Mova para dentro do else
        Job.findAll({
            where: { title: { [Op.like]: query } },
            order: [['createdAt', 'DESC']], 
            raw: true 
        })
        .then(jobs => {
            res.render('index', { jobs, search });
        })
        .catch(err => console.log(err));
    }
});



//jobs routes
app.use('/jobs', require('./routes/jobs'));