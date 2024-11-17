const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { User } = require('./models/User'); // Assurez-vous d'avoir un dossier 'models' avec 'User.js'
const router = express.Router();

// Inscription
router.post('/register', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        console.log("Début de l'inscription...");

        // Vérifier si l'utilisateur existe déjà
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("Erreur : Utilisateur déjà existant.");
            return res.status(400).send("Cet email est déjà utilisé.");
        }

        // Vérifier la présence des champs requis
        if (!username || !email || !password) {
            console.log("Erreur : Champs requis manquants.");
            return res.status(400).send("Tous les champs sont requis.");
        }

        // Chiffrer le mot de passe
        console.log("Hachage du mot de passe...");
        const hashedPassword = await bcrypt.hash(password, 10);

        // Créer un nouvel utilisateur
        console.log("Création de l'utilisateur...");
        const user = new User({ username, email, password: hashedPassword });
        await user.save();

        console.log("Utilisateur enregistré avec succès !");
        res.status(201).send("Utilisateur enregistré avec succès !");
    } catch (error) {
        console.error("Erreur lors de l'inscription :", error);
        res.status(500).send(`Erreur lors de l'inscription : ${error.message}`);
    }
});

// Connexion
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        console.log("Tentative de connexion...");

        const user = await User.findOne({ email });
        if (!user) {
            console.log("Erreur : Utilisateur non trouvé.");
            return res.status(400).send("Utilisateur non trouvé.");
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log("Erreur : Mot de passe incorrect.");
            return res.status(400).send("Mot de passe incorrect.");
        }

        // Création du token JWT
        console.log("Création du token JWT...");
        const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        console.log("Connexion réussie !");
        res.json({ token });
    } catch (error) {
        console.error("Erreur lors de la connexion :", error);
        res.status(500).send("Erreur lors de la connexion.");
    }
});

module.exports = router;
