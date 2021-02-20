const express = require("express");
const bodyParser = require("body-parser");
const fs = require("fs");
const app = express();

const FILES = [
	"html",
	"aktivnost.html",
	"iscrtajModulTest.html",
	"planiranjeNastavnik.html",
	"podaciStudent.html",
	"raspored.html",
	"spirala2rasporedi.html",
	"stylesAktivnost.css",
	"stylesPlaniranjeNastavnik.css",
	"stylesPodaciStudent.css",
	"stylesRaspored.css",
	"stylesSpirala2Rasporedi.css",
	"iscrtaj.js",
	"iscrtajModul.js",
	"iscrtajModulTest.js",
	"spirala2rasporedi.js",
	"unosRasporeda.html",
	"stylesUnosRasporeda.css",
	"unosRasporeda.js",
	"studenti.html",
	"stylesStudenti.css",
	"studenti.js",
];

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

for (let i = 0; i < FILES.length; i++) {
	app.get(`/${FILES[i]}`, function (req, res) {
		res.sendFile(`${__dirname}/${FILES[i]}`);
	});
}

//preusmjeravanje na aktivnost.html za url 'localhost:3000'
app.get("/", function (req, res) {
	res.redirect(`/aktivnost.html`);
});

// \r se pojavljuje na neki sistemima, ignorisat će se

function csvToJsonPredmeti(csv) {
	const sviPredmeti = csv.replace("\r", "").split("\n");
	const jsonSviPredmeti = [];
	for (let i = 0; i < sviPredmeti.length; i++) if (sviPredmeti[i]) jsonSviPredmeti.push({ naziv: sviPredmeti[i] });
	return jsonSviPredmeti;
}

function csvToJsonAktivnosti(csv) {
	const sveAktivnosti = csv.replace("\r", "").split("\n");
	const jsonSveAktivosti = [];
	for (let i = 0; i < sveAktivnosti.length; i++)
		if (sveAktivnosti[i]) {
			const aktivnostProperties = sveAktivnosti[i].split(",");
			// Ukoliko format definisan u spirali nije validan, akvitnost će biti ignorisana
			if (aktivnostProperties.length !== 5) continue;
			jsonSveAktivosti.push({
				naziv: aktivnostProperties[0],
				tip: aktivnostProperties[1],
				pocetak: parseFloat(aktivnostProperties[2]),
				kraj: parseFloat(aktivnostProperties[3]),
				dan: aktivnostProperties[4],
			});
		}
	return jsonSveAktivosti;
}

function jsonToCsvPredmeti(json) {
	let csv = "";
	for (let i = 0; i < json.length; i++) csv += `${json[i].naziv}${i < json.length - 1 ? "\n" : ""}`;
	return csv;
}

function jsonToCsvAktivnosti(json) {
	let csv = "";
	for (let i = 0; i < json.length; i++)
		csv += `${json[i].naziv},${json[i].tip},${json[i].pocetak},${json[i].kraj},${json[i].dan}${
			i < json.length - 1 ? "\n" : ""
		}`;
	return csv;
}

function validacijaVremenaAktivnosti(aktivnost, sveAktivnosti) {
	const pocetak = aktivnost.pocetak;
	const kraj = aktivnost.kraj;
	if (pocetak < 0 || pocetak > 24) return false;
	if (kraj < 0 || kraj > 24) return false;
	if ((pocetak % 1 !== 0 && pocetak % 1 !== 0.5) || (kraj % 1 !== 0 && kraj % 1 !== 0.5)) return false;
	for (let i = 0; i < sveAktivnosti.length; i++)
		if (
			aktivnost.dan === sveAktivnosti[i].dan &&
			!(kraj <= sveAktivnosti[i].pocetak || pocetak >= sveAktivnosti[i].kraj)
		)
			return false;
	return pocetak < kraj;
}

function validacijaAktivnosti(aktivnost, sveAktivnosti, sviPredmeti) {
	if (!aktivnost) return false;
	if (!["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak", "Subota", "Nedjelja"].includes(aktivnost.dan))
		return false;
	if (!sviPredmeti.includes(aktivnost.naziv)) return false;
	return validacijaVremenaAktivnosti(aktivnost, sveAktivnosti);
}

function decapitalize(str) {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

const db = require("./db.js");
/* const { ConnectionTimedOutError } = require("sequelize/types"); */
db.sequelize.sync().then(function () {
	console.log("Uspješno kreiranje tabela :)");
});

const modeli = [
	{ naziv: "Predmet", ruta: "predmeti" },
	{ naziv: "Grupa", ruta: "grupe" },
	{ naziv: "Aktivnost", ruta: "aktivnosti" },
	{ naziv: "Dan", ruta: "dani" },
	{ naziv: "Tip", ruta: "tipovi" },
	{ naziv: "Student", ruta: "studenti" },
];

app.get("/v1/predmeti", function (req, res) {
	fs.readFile("predmeti.txt", "utf8", function (error, data) {
		if (error) return res.status(400).send({ message: error });
		return res.json(csvToJsonPredmeti(data));
	});
});

app.get("/v1/aktivnosti", function (req, res) {
	fs.readFile("aktivnosti.txt", "utf8", function (error, data) {
		if (error) return res.status(400).send({ message: error });
		return res.json(csvToJsonAktivnosti(data));
	});
});

app.get("/v1/predmet/:naziv/aktivnost", function (req, res) {
	fs.readFile("aktivnosti.txt", "utf8", function (error, data) {
		if (error) return res.status(400).send({ message: error });
		const sveAktivnosti = csvToJsonAktivnosti(data);
		const filtriraneAktivnosti = [];
		for (let i = 0; i < sveAktivnosti.length; i++)
			if (sveAktivnosti[i].naziv === req.params.naziv) filtriraneAktivnosti.push(sveAktivnosti[i]);
		return res.json(filtriraneAktivnosti);
	});
});

//GET-ovi za vraćanje svih instanci svakog od modela
// /v2/predmeti, /v2/grupe, /v2/aktivnosti, /v2/dani, /v2/tipovi, /v2/studenti
modeli.forEach((model) => {
	if (model.naziv === "Aktivnost") return;
	app.get(`/v2/${model.ruta}`, function (req, res) {
		db[model.naziv]
			.findAll()
			.then(function (rezultat) {
				res.send(rezultat);
				res.end();
			})
			.catch((err) => {
				console.log("Greška: " + err.message);
				res.status(400).end("Greška na serveru - " + err.message);
			});
	});
});

app.get("/v2/aktivnosti", function (req, res) {
	db.Aktivnost.findAll({
		attributes: ["id", "naziv", "pocetak", "kraj"],
		include: [{ model: db.Tip, as: "Tip" }, { model: db.Predmet }, { model: db.Dan }, { model: db.Grupa }],
	})
		.then(function (rezultat) {
			res.send(rezultat);
			res.end();
		})
		.catch((err) => {
			console.log("Greška: " + err.message);
			res.status(400).end("Greška na serveru - " + err.message);
		});
});

app.get("/v2/studentigrupe", function (req, res) {
	db.sequelize.models.StudentiGrupe.findAll()
		.then(function (rezultat) {
			res.send(rezultat);
			res.end();
		})
		.catch((err) => {
			console.log("Greška: " + err.message);
			res.status(400).end("Greška na serveru - " + err.message);
		});
});

//vrati sve grupe kojim pripada student :student
app.get("/v2/studentigrupe/:student/grupe", function (req, res) {
	db.sequelize.models.StudentiGrupe.findAll({ where: { student: req.params.student } })
		.then(function (rez) {
			if (!rez) return res.status(404).end("Student ne pripada nijednoj grupi");
			let idEvi = [];
			rez.forEach((e) => {
				idEvi.push(e.grupa);
			});

			db.Grupa.findAll({ where: { id: idEvi } })
				.then(function (grupe) {
					console.log("SERVER POSLAO");
					res.send(grupe);
					res.end();
				})
				.catch((err) => {
					console.log("Greška: " + err.message);
					res.status(400).end("Greška na serveru - " + err.message);
				});
		})
		.catch((err) => {
			console.log("Greška: " + err.message);
			res.status(400).end("Greška na serveru - " + err.message);
		});
});

//GET rute za vraćanje jedne instance svakog od modela na osnovu ID-a
// /v2/predmeti/:id, /v2/grupe/:id itd..
modeli.forEach((model) => {
	app.get(`/v2/${model.ruta}/:id`, function (req, res) {
		db[model.naziv]
			.findByPk(req.params.id)
			.then(function (rezultat) {
				res.send(rezultat);
				res.end();
			})
			.catch((err) => {
				console.log("Greška: " + err.message);
				res.status(400).end("Greška na serveru - " + err.message);
			});
	});
});

//Get ruta koja vraća sve aktivnosti iz predmeta naziva ":naziv"
app.get("/v2/predmet/:naziv/aktivnost", function (req, res) {
	db.Predmet.findOne({ where: { naziv: req.params.naziv } })
		.then(function (predmet) {
			if (!predmet) res.status(400).end("Nije pronađen predmet sa datim nazivom");
			else {
				db.Aktivnost.findAll({ where: { predmet: predmet.id } })
					.then(function (aktivnosti) {
						res.send(aktivnosti);
						res.end();
					})
					.catch((err) => {
						console.log("Greška: " + err.message);
						res.status(400).end("Greška na serveru - " + err.message);
					});
			}
		})
		.catch((err) => {
			console.log("Greška: " + err.message);
			res.status(400).end("Greška na serveru - " + err.message);
		});
});

app.get("/v2/studenti/:index", function (req, res) {
	db.Student.findOne({ where: { index: req.params.index } })
		.then(function (student) {
			res.send(student);
			res.end();
		})
		.catch((err) => {
			console.log("Greška: " + err.message);
			res.status(400).end("Greška na serveru - " + err.message);
		});
});

app.get("/v2/predmeti/:predmet/grupe", function (req, res) {
	db.Grupa.findAll({ where: { predmet: req.params.predmet } })
		.then(function (rez) {
			if(rez.length === 0) return res.status(404).end("Predmet nema nijedne grupe!");
			res.send(rez);
			res.end();
		})
		.catch((err) => {
			console.log("Greška: " + err.message);
			res.status(400).end("Greška na serveru - " + err.message);
		});
});

app.post("/v1/predmet", function (req, res) {
	fs.readFile("predmeti.txt", "utf8", function (error, data) {
		if (error) return res.status(404).send({ message: error });

		const sviPredmeti = csvToJsonPredmeti(data);
		for (let i = 0; i < sviPredmeti.length; i++)
			if (sviPredmeti[i].naziv === req.body.naziv)
				return res.status(400).send({ message: "Naziv predmeta već postoji!" });

		sviPredmeti.push({ naziv: req.body.naziv });
		fs.writeFile("predmeti.txt", jsonToCsvPredmeti(sviPredmeti), function (error) {
			if (error) return res.status(404).send({ message: error });
		});
		return res.send({ message: "Uspješno dodan predmet!" });
	});
});

function formatVremenaAktivnosti(aktivnost) {
	let formatiraniPocetak = parseInt(aktivnost.pocetak);
	if (aktivnost.pocetak.split(":")[1] === "30") formatiraniPocetak += 0.5;
	else if (aktivnost.pocetak.split(":")[1] !== "30" && aktivnost.pocetak.split(":")[1] !== "00")
		formatiraniPocetak += 0.1;
	let formatiraniKraj = parseInt(aktivnost.kraj);
	if (aktivnost.kraj.split(":")[1] === "30") formatiraniKraj += 0.5;
	else if (aktivnost.kraj.split(":")[1] !== "30" && aktivnost.kraj.split(":")[1] !== "00") formatiraniKraj += 0.1;
	aktivnost.pocetak = formatiraniPocetak;
	aktivnost.kraj = formatiraniKraj;
	return aktivnost;
}

app.post("/v1/aktivnost", function (req, res) {
	fs.readFile("predmeti.txt", "utf8", function (error, data) {
		if (error) return res.status(404).send({ message: error });

		const sviPredmeti = csvToJsonPredmeti(data);
		fs.readFile("aktivnosti.txt", "utf8", function (error, data) {
			if (error) {
				return res.status(400).send({ message: error });
			}
			if (!req.body.naziv || !req.body.tip || !req.body.pocetak || !req.body.kraj || !req.body.dan)
				return res.status(400).send({ message: "Aktivnost nije validna!" });
			let primljenaAktivnost = formatVremenaAktivnosti(req.body);
			const sveAktivnosti = csvToJsonAktivnosti(data);
			const nizPredmeta = [];
			for (let i = 0; i < sviPredmeti.length; i++) nizPredmeta.push(sviPredmeti[i].naziv);
			if (!validacijaAktivnosti(primljenaAktivnost, sveAktivnosti, nizPredmeta))
				return res.status(400).send({ message: "Aktivnost nije validna!" });
			sveAktivnosti.push(primljenaAktivnost);
			fs.writeFile("aktivnosti.txt", jsonToCsvAktivnosti(sveAktivnosti), function (error) {
				if (error) return res.status(404).send({ message: error });
			});
			return res.send({ message: "Uspješno dodana aktivnost!" });
		});
	});
});

//POST-ovi za sve modele izuzev aktivnosti i studenta sa validacijom
//  /v2/predmet, /v2/tip, /v2/dan, /v2/grupa
modeli.forEach((model) => {
	if (model.naziv != "Aktivnost" && model.naziv != "Student")
		app.post(`/v2/${decapitalize(model.naziv)}`, function (req, res) {
			//Provjera je li postoji instanca sa istim nazivom
			if (!req.body.naziv) res.status(400).end("U tijelu zahtjeva potrebno proslijediti obavezno polje 'NAZIV'");
			else {
				db[model.naziv]
					.findOne({ where: { naziv: req.body.naziv } })
					.then(function (rezultat) {
						if (!rezultat) {
							db[model.naziv]
								.create(req.body)
								.then(function (rezultat) {
									res.end(`Uspješno dodan ${model.naziv}`);
								})
								.catch((err) => {
									console.log("GREŠKA: ", err.message);
									res.status(400).end("Greška na serveru - " + err.message);
								});
						} else res.status(400).end(`${model.naziv} sa ovim nazivom već postoji!`);
					})
					.catch((err) => {
						console.log("GREŠKA", err);
						res.status(400).end("Greška na serveru - " + err.message);
					});
			}
		});
});

app.post("/v2/student", function (req, res) {
	if (!req.body.index) res.end("U tijelu zahtjeva potrebno proslijediti obavezno polje 'INDEX'");
	else {
		db.Student.findOne({ where: { index: req.body.index } })
			.then(function (rezultat) {
				if (!rezultat) {
					db.Student.create(req.body)
						.then(function (noviStudent) {
							res.send({
								id: noviStudent.id,
								poruka: `Uspješno kreiran student ${noviStudent.ime} sa indexom ${noviStudent.index}`,
							});
							res.end();
						})
						.catch((err) => {
							console.log("GREŠKA", err);
							res.end("Greška na serveru!");
						});
				} else {
					if (rezultat.ime === req.body.ime) {
						res.status(403).send({
							id: rezultat.id,
							poruka: `Student ${req.body.ime} sa indexom ${rezultat.index} već postoji u bazi`,
						});
						res.end();
					} else
						res.status(400).end(
							`Student ${req.body.ime} nije kreiran jer postoji student ${rezultat.ime} sa istim indexom ${rezultat.index}`
						);
				}
			})
			.catch((err) => {
				console.log("GREŠKA", err.message);
				res.status(400).end("Greška na serveru - " + err.message);
			});
	}
});

app.post("/v2/aktivnost", function (req, res) {
	if (!req.body.naziv || !req.body.tip || !req.body.pocetak || !req.body.kraj || !req.body.dan || !req.body.predmet) {
		return res.status(400).end("Tijelo zahtjeva nije validno!");
	}
	let aktivnost = req.body;
	db.Aktivnost.findAll().then(function (sveAktivnosti) {
		aktivnost = formatVremenaAktivnosti(aktivnost);
		if (!validacijaVremenaAktivnosti(aktivnost, sveAktivnosti)) {
			return res.status(400).end("Aktivnost nije validna!");
		}
		db.Aktivnost.create(aktivnost)
			.then(function (rez) {
				res.end("Uspješno kreirana aktivnost!");
			})
			.catch((err) => {
				console.log("GREŠKA", err.message);
				res.status(400).end("Greška na serveru - " + err.message);
			});
	});
});

//Dodavanje studenta u grupu
// u body-u se moraju proslijedit ID studenta i ID grupe
app.post("/v2/studentigrupe", function (req, res) {
	if (!req.body.student || !req.body.grupa) {
		return res.status(400).end("Tijelo zahtjeva nije validno!");
	}
	db.sequelize.models.StudentiGrupe.findOne({ where: { student: req.body.student, grupa: req.body.grupa } })
		.then(function (rez) {
			if (!rez) {
				db.sequelize.models.StudentiGrupe.create({ grupa: req.body.grupa, student: req.body.student })
					.then(function () {
						res.end("Student uspješno dodan u grupu!");
					})
					.catch((err) => {
						console.log("GREŠKA", err.message);
						res.status(400).end("Greška na serveru - " + err.message);
					});
			} else return res.status(400).end("Student se već nalazi u datoj grupi!");
		})
		.catch((err) => {
			console.log("GREŠKA", err.message);
			res.status(400).end("Greška na serveru - " + err.message);
		});
});

//PUT-evi za sve modele. Pošto su polje "naziv" za većinu modela i "index" za model Student UNIQUE, neće moći doći do kolizije
//preko PUT-a, tako da je validacija tog tipa urađena na samim modelima
// /v2/predmet/:id, /v2/grupa/:id itd.
modeli.forEach((model) => {
	app.put(`/v2/${decapitalize(model.naziv)}/:id`, function (req, res) {
		if (Object.keys(req.body).length === 0 && req.body.constructor === Object)
			return res.status(400).end("Tijelo zahtjeva je prazno!");
		db[model.naziv]
			.update(req.body, { where: { id: req.params.id } })
			.then(function (result) {
				if (result[0] === 0) return res.status(400).end("Nije pronađen poslani id!");
				res.end("Uspješno ažuriranje");
			})
			.catch((err) => {
				console.log("GREŠKA", err.message);
				res.status(400).end("Greška na serveru - " + err.message);
			});
	});
});

//PK je student + grupa
app.put(`/v2/studentigrupe/:student/:grupa`, function (req, res) {
	if (Object.keys(req.body).length === 0 && req.body.constructor === Object)
		return res.status(400).end("Tijelo zahtjeva je prazno!");
	db.sequelize.models.StudentiGrupe.update(req.body, {
		where: { student: req.params.student, grupa: req.params.grupa },
	})
		.then(function (result) {
			if (result[0] === 0) return res.status(400).end("Nije pronađen student u datoj grupi!");
			res.end("Uspješno ažuriranje");
		})
		.catch((err) => {
			console.log("GREŠKA", err.message);
			res.status(400).end("Greška na serveru - " + err.message);
		});
});

app.delete("/v1/aktivnost/:naziv", function (req, res) {
	fs.readFile("aktivnosti.txt", "utf8", function (error, data) {
		if (error) return res.status(400).send({ message: error });
		const sveAktivnosti = csvToJsonAktivnosti(data);
		const duzinaPrijeBrisanja = sveAktivnosti.length;
		for (let i = 0; i < sveAktivnosti.length; i++)
			if (sveAktivnosti[i].naziv === req.params.naziv) {
				sveAktivnosti.splice(i, 1);
				i--;
			}
		const duzinaPoslijeBrisanja = sveAktivnosti.length;
		if (duzinaPrijeBrisanja === duzinaPoslijeBrisanja)
			return res.status(400).send({ message: "Greška - aktivnost nije obrisana!" });
		fs.writeFile("aktivnosti.txt", jsonToCsvAktivnosti(sveAktivnosti), function (error) {
			if (error) return res.status(400).send({ message: error });
		});
		return res.send({ message: "Uspješno obrisana aktivnost!" });
	});
});

app.delete("/v1/predmet/:naziv", function (req, res) {
	fs.readFile("predmeti.txt", "utf8", function (error, data) {
		if (error) return res.status(400).send({ message: error });
		const sviPredmeti = csvToJsonPredmeti(data);
		const duzinaPrijeBrisanja = sviPredmeti.length;
		for (let i = 0; i < sviPredmeti.length; i++)
			if (sviPredmeti[i].naziv === req.params.naziv) {
				sviPredmeti.splice(i, 1);
				i--;
			}
		const duzinaPoslijeBrisanja = sviPredmeti.length;
		if (duzinaPrijeBrisanja === duzinaPoslijeBrisanja)
			return res.status(400).send({ message: "Greška - predmet nije obrisan!" });
		fs.writeFile("predmeti.txt", jsonToCsvPredmeti(sviPredmeti), function (error) {
			if (error) return res.status(400).send({ message: error });
		});
		return res.send({ message: "Uspješno obrisan predmet!" });
	});
});

app.delete("/v1/all", function (req, res) {
	fs.writeFile("predmeti.txt", "", function (error) {
		if (error) return res.status(400).send({ message: error });
	});
	fs.writeFile("aktivnosti.txt", "", function (error) {
		if (error) return res.status(400).send({ message: error });
	});
	return res.send({ message: "Uspješno obrisan sadržaj datoteka!" });
});

//DELETE-evi za sve modele. Brisanje se vrši slanjem id-a u zahtjevu
// /v2/grupa/:id, /v2/aktivnost/:id itd.
modeli.forEach((model) => {
	app.delete(`/v2/${decapitalize(model.naziv)}/:id`, function (req, res) {
		db[model.naziv]
			.destroy({ where: { id: req.params.id } })
			.then(function (count) {
				if (count === 0) return res.status(400).end("Nije pronađen poslani id!");
				res.end("Uspješno brisanje");
			})
			.catch((err) => {
				console.log("GREŠKA", err.message);
				res.status(400).end("Greška na serveru - " + err.message);
			});
	});
});

app.listen(3000);



module.exports = app;
