const fs = require('fs');
const axios = require('axios');

async function fetchRelais() {
  console.log("⚙️ Téléchargement en cours...");
  const url = "https://public.opendatasoft.com/api/records/1.0/search/?dataset=points-relais-mondial-relay-france&rows=10000";
  const res = await axios.get(url);
  const data = res.data.records.map(r => ({
    name: r.fields.nom,
    address: r.fields.adresse,
    postal: r.fields.code_postal,
    city: r.fields.commune,
    country: 'FR'
  }));
  fs.writeFileSync('relays-france.json', JSON.stringify(data, null, 2));
  console.log(`✅ ${data.length} relais exportés dans relays-france.json`);
}

fetchRelais().catch(e => console.error("❌ Erreur:", e.message));
