//Définition des modules
const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')
const helmet = require('helmet');
const path = require('path')
//On définit notre objet express nommé app
const app = express();
//Fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));
//cors
app.use(cors());
//Body Parser
const urlencodedParser = bodyParser.urlencoded({extended: true});
app.use(urlencodedParser);
app.use(bodyParser.json());
//helmet
app.use(helmet())
app.disable('x-powered-by')

//react
app.get('*',(req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
})

//Définition et mise en place du port d'écoute
const port = 8080;
app.listen(port, () => console.log(`Listening on port ${port}`));
