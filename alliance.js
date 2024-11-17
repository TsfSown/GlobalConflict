const express = require('express');
const router = express.Router();
const { User, Alliance } = require('./models/User');

// Route pour créer une nouvelle alliance
router.post('/create', async (req, res) => {
    const { userId, allianceName } = req.body;

    try {
        // Vérifier si une alliance avec le même nom existe déjà
        const existingAlliance = await Alliance.findOne({ name: allianceName });
        if (existingAlliance) {
            return res.status(400).send("Une alliance avec ce nom existe déjà.");
        }

        // Créer une nouvelle alliance
        const newAlliance = new Alliance({
            name: allianceName,
            members: [userId]
        });

        await newAlliance.save();

        // Mettre à jour l'utilisateur pour l'ajouter à l'alliance
        await User.findByIdAndUpdate(userId, { alliance: newAlliance._id });

        res.status(201).send({ message: "Alliance créée avec succès.", alliance: newAlliance });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la création de l'alliance.");
    }
});

// Route pour rejoindre une alliance existante
router.post('/join', async (req, res) => {
    const { userId, allianceName } = req.body;

    try {
        // Trouver l'alliance par nom
        const alliance = await Alliance.findOne({ name: allianceName });
        if (!alliance) {
            return res.status(404).send("Alliance non trouvée.");
        }

        // Ajouter l'utilisateur à l'alliance
        alliance.members.push(userId);
        await alliance.save();

        // Mettre à jour l'utilisateur pour l'ajouter à l'alliance
        await User.findByIdAndUpdate(userId, { alliance: alliance._id });

        res.status(200).send({ message: "Vous avez rejoint l'alliance avec succès.", alliance });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la tentative de rejoindre l'alliance.");
    }
});

// Route pour quitter une alliance
router.post('/leave', async (req, res) => {
    const { userId } = req.body;

    try {
        // Récupérer l'utilisateur
        const user = await User.findById(userId);
        if (!user || !user.alliance) {
            return res.status(400).send("L'utilisateur n'appartient à aucune alliance.");
        }

        // Récupérer l'alliance
        const alliance = await Alliance.findById(user.alliance);
        if (!alliance) {
            return res.status(404).send("Alliance non trouvée.");
        }

        // Retirer l'utilisateur de l'alliance
        alliance.members = alliance.members.filter(member => member.toString() !== userId);
        await alliance.save();

        // Mettre à jour l'utilisateur pour supprimer l'alliance
        user.alliance = null;
        await user.save();

        res.status(200).send({ message: "Vous avez quitté l'alliance avec succès." });
    } catch (error) {
        console.error(error);
        res.status(500).send("Erreur lors de la tentative de quitter l'alliance.");
    }
});

module.exports = router;