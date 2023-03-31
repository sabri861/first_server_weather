require("dotenv").config();
const apiKey = process.env.WEATHER_API_KEY;

const axios = require("axios"); // client http
const express = require("express");
const app = express();
const port = 3000;

app.use(express.json()); // Pour analyser les requêtes entrantes avec des charges utiles JSON

const userMap = new Map(); // Déclarer une Map qui est vide au départ pour les utilisateurs
const weatherMap = new Map(); // Déclarer une Map qui est vide au départ pour la météo

//Get Hello
app.get("/", async function (req, res) { // endpoint 
  res.send("Hello World ");
});

// signup
app.post("/signup", async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send("Veuillez fournir un email et un mot de passe");
      return;
    }

    if (userMap.has(email)) {
      res.status(409).send("Cet email est déjà enregistré");
      return;
    }

    userMap.set(email, { email, password });
    res.status(201).send("Inscription réussie");
  } catch (error) {
    res.status(500).send("Une erreur est survenue lors de l'inscription");
  }
});

// login
app.post("/login", async function (req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).send("Veuillez fournir un email et un mot de passe");
      return;
    }

    const user = userMap.get(email);

    if (!user || user.password !== password) {
      res.status(401).send("Email ou mot de passe invalide");
      return;
    }

    res.status(200).send("Connexion réussie");
  } catch (error) {
    res.status(500).send("Une erreur est survenue lors de la connexion");
  }
});


//Get Weather
app.get("/weather", async function (req, res) {
  try {
    const response = await axios.get(`http://api.weatherapi.com/v1/current.json?q=Paris&key=${apiKey}`)
    res.status(200).send(response.data);
  } catch (error) {
    res.status(404).send("City not Found");
  }
});

//Get weather by city
app.get("/weather/city", async function (req, res) {
  const cityName = req.query.name.toLowerCase(); // Récupérer le nom de la ville dans l'url

  if (weatherMap.has(cityName)) { // has = Recherche la présence d’un item dans un objet Set. et verifie si la Map contient la key
    console.log("Weather Map:", weatherMap.size);
    const temperature = weatherMap.get(cityName).current.temp_c; // get = Retourne la valeur associée à une clé dans un objet Map.
    return res.status(200).send({"temperature": temperature}); // Retourner la météo sauvegardée dans la Map
  } else {
    try {
      const response = await axios.get(`http://api.weatherapi.com/v1/current.json?q=${cityName}&key=${apiKey}`)
      weatherMap.set(cityName, response.data); // Save la ville dans la Map avec sa météo (valeur)
      console.log("Weather Map:", weatherMap.size);
      return res.status(200).send(response.data);
    } catch (error) {
      return res.status(404).send("City not Found");
    }
  }
  
});

app.listen(port, () => {
  console.log(` http://localhost:${port}`);
});

