const express = require('express');
const router = express.Router();
const User = require('./models/User');

// Route pour recruter des unités "recrues"
router.post('/recruit', async (req, res) => {
  const { userId, quantity } = req.body; // userId : identifiant du joueur, quantity : nombre de recrues à créer

  try {
    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé.");
    }

    // Calculer les ressources nécessaires (par exemple, chaque recrue coûte 10 nourriture, 5 matériaux, et 2 or)
    const costNourriture = 30 * quantity; // Coût de production des jeunes recrues
    const costMateriaux = 5 * quantity;
    const costOr = 2 * quantity;

    // Vérifier si le joueur a suffisamment de ressources
    if (user.resources.nourriture < costNourriture || user.resources.materiaux < costMateriaux || user.resources.or < costOr) {
      return res.status(400).send("Ressources insuffisantes pour recruter ces unités.");
    }

    // Déduire les ressources nécessaires
    user.resources.nourriture -= costNourriture;
    user.resources.materiaux -= costMateriaux;
    user.resources.or -= costOr;

    // Calculer la vitesse de création en fonction du niveau de la caserne
    let initialTime = 5 * 60; // Temps initial de 5 minutes (en secondes) pour chaque unité
    let timeReduction = user.buildings.caserne * 0.15; // Réduction de 15% pour chaque niveau de caserne supplémentaire
    let finalTime = initialTime * (1 - timeReduction);

    // Ajouter les recrues (en tenant compte de la vitesse)
    const effectiveQuantity = quantity; // La quantité effective est la même, mais le temps est réduit
    user.units.recrues += effectiveQuantity;

    // Enregistrer les modifications
    await user.save();

    res.status(200).send({
      message: `${effectiveQuantity} recrues ont été créées avec succès (temps de production réduit à ${finalTime / 60} minutes par unité).`,
      units: user.units
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de la création des unités.");
  }
});

// Route pour augmenter la population
router.post('/augmenterPopulation', async (req, res) => {
  const { userId, quantity } = req.body; // userId : identifiant du joueur, quantity : nombre de personnes à ajouter

  try {
    // Récupérer l'utilisateur
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).send("Utilisateur non trouvé.");
    }

    // Calculer les ressources nécessaires (par exemple, chaque nouvelle personne coûte 15 nourriture)
    const costNourriture = 5 * quantity; // Coût de production de la population

    // Vérifier si le joueur a suffisamment de ressources
    if (user.resources.nourriture < costNourriture) {
      return res.status(400).send("Ressources insuffisantes pour augmenter la population.");
    }

    // Déduire les ressources nécessaires
    user.resources.nourriture -= costNourriture;

    // Calculer la vitesse d'augmentation de la population en fonction du niveau de la caserne
    let initialTime = 5 * 60; // Temps initial de 5 minutes (en secondes) pour chaque personne
    let timeReduction = user.buildings.caserne * 0.15; // Réduction de 15% pour chaque niveau de caserne supplémentaire
    let finalTime = initialTime * (1 - timeReduction);

    // Ajouter à la population totale
    user.population += quantity;

    // Enregistrer les modifications
    await user.save();

    res.status(200).send({
      message: `La population a été augmentée de  \$\{quantity\} (coût : \$\{costNourriture\} nourriture, temps de production réduit à \$\{finalTime / 60\} minutes par personne).`,
      population: user.population
    });
  } catch (error) {
    console.error(error);
    res.status(500).send("Erreur lors de l'augmentation de la population.");
  }
});

module.exports = router;

