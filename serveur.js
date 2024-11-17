const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const authRoutes = require('./auth');
const recruitRoutes = require('./recruit');
const combatRoutes = require('./combat');
const territoryRoutes = require('./territory');
const allianceRoutes = require('./alliance');

dotenv.config();

const app = express();
app.use(express.json());
const cors = require('cors');
app.use(cors());


// Connexion à MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connecté à MongoDB"))
    .catch(err => console.error("Erreur de connexion à MongoDB :", err));

// Utiliser les routes (chaque route doit être bien exportée en tant que router Express)
app.use('/auth', authRoutes);
app.use('/recruit', recruitRoutes);
app.use('/combat', combatRoutes);
app.use('/territory', territoryRoutes);
app.use('/alliance', allianceRoutes);

// Démarrer le serveur
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Serveur en cours d'exécution sur le port ${PORT}`);
});
