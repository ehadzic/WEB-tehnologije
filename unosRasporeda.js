let predmeti = [];
let aktivnosti = [];
let predmetDodan = false;

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

function decapitalize(str) {
	return str.charAt(0).toLowerCase() + str.slice(1);
}

function ucitajPredmete() {
	let ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function () {
		if (ajax.readyState === 4 && ajax.status === 200) {
			let predmEl = document.getElementById("listaPredmeta");
			predmeti = JSON.parse(ajax.responseText);
			predmEl.innerHTML = "";
			predmeti.forEach((pr) => {
				predmEl.innerHTML += `<li>${pr.naziv}</li>`;
			});
		}
		if (ajax.readyState === 4 && ajax.status === 404) {
		}
	};
	ajax.open("GET", "/v2/predmeti", true);
	ajax.send();
}

function ucitajAktivnosti() {
	let ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function () {
		if (ajax.readyState === 4 && ajax.status === 200) {
			let aktivnEl = document.getElementById("listaAktivnosti");
			aktivnEl.innerHTML = "";
			aktivnosti = JSON.parse(ajax.responseText);
			aktivnosti.forEach((ak) => {
				let tekst = `${ak.naziv}", ${capitalize(ak.Tip.naziv)}, Predmet: ${
					ak.Predmet.naziv
				}, Termin:  ${decapitalize(ak.Dan.naziv)} od ${ak.pocetak} do ${ak.kraj}`;
				if (ak.Grupa) {
					tekst += `, Grupa: ${ak.Grupa.naziv}`;
				}
				aktivnEl.innerHTML += `<li>"${tekst}</li>`;
			});
	
		}
	};
	ajax.open("GET", "/v2/aktivnosti", true);
	ajax.send();
}

let selecti = [
	{ naziv: "grupe", uputa: "Odaberite grupu" },
	{ naziv: "predmeti", uputa: "Odaberite predmet" },
	{ naziv: "tipovi", uputa: "Odaberite tip" },
	{ naziv: "dani", uputa: "Odaberite dan" },
];

function napuniSelecte() {
	selecti.forEach((s) => {
		let ajax = new XMLHttpRequest();
		ajax.onreadystatechange = function () {
			if (ajax.readyState === 4 && ajax.status === 200) {
				let grupeSelect = document.getElementById(s.naziv);
				grupe = JSON.parse(ajax.responseText);
				grupeSelect.innerHTML = `<option value="" disabled selected>--${s.uputa}--</option>`;
				grupe.forEach((gr) => {
					grupeSelect.innerHTML += `<option value=${gr.id}>${gr.naziv}</option>`;
				});
			}
		};
		ajax.open("GET", `/v2/${s.naziv}`, true);
		ajax.send();
	});
}

function ucitavanjeStranice() {
	napuniSelecte();
	ucitajPredmete();
	ucitajAktivnosti();
}

function validirajFormu() {
	let text = "";
	const naziv = document.getElementById("naziv").value;
	if (!naziv) text += "<div>Unesite naziv!</div>";
	const predmet = document.getElementById("predmeti").value;
	if (!predmet) text += "<div>Unesite predmet!</div>";

	const tip = document.getElementById("tipovi").value;
	if (!tip) text += "<div>Unesite tip!</div>";
	const pocetak = document.getElementById("vrijemep").value;
	if (!pocetak) text += "<div>Unesite pocetak!</div>";
	const kraj = document.getElementById("vrijemek").value;
	if (!kraj) text += "<div>Unesite kraj!</div>";
	const dan = document.getElementById("dani").value;
	if (!dan) text += "<div>Unesite dan!</div>";
	porukaValidacije(text, text.length > 0);
	return text.length === 0;
}

function formaSubmit() {
	if (!validirajFormu()) return;

	let ajax = new XMLHttpRequest();


	let aktivnost = {
		naziv: document.getElementById("naziv").value,
		predmet: parseInt(document.getElementById("predmeti").value),
		tip: parseInt(document.getElementById("tipovi").value),
		grupa: document.getElementById("grupe").value ? parseInt(document.getElementById("grupe").value) : null,
		dan: parseInt(document.getElementById("dani").value),
		pocetak: document.getElementById("vrijemep").value,
		kraj: document.getElementById("vrijemek").value,
	};

	ajax.onreadystatechange = function () {
		if (ajax.readyState === 4 && ajax.status === 200) {
			porukaValidacije(ajax.responseText, false);
			ucitajAktivnosti();
			ucitajPredmete();
		} else if (ajax.readyState === 4 && ajax.status === 400) {
			porukaValidacije(ajax.responseText, true);
		}
	};

	ajax.open("POST", "/v2/aktivnost", true);
	ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
	ajax.send(JSON.stringify(aktivnost));
}

function porukaValidacije(poruka, isError) {
	const div = document.getElementById("poruka-validacije");
	if (isError) div.className = "nevalidno";
	else div.className = "validno";
	div.innerHTML = poruka;
}

document.getElementById("dodaj-aktivnost").addEventListener("click", function (event) {
	event.preventDefault();
	formaSubmit();
});

ucitavanjeStranice();

function dajGrupeOdPredmeta() {
	let idPredmeta = predmetiSelect.value;
	let ajax = new XMLHttpRequest();

	ajax.onreadystatechange = function () {
		if (ajax.readyState === 4 && ajax.status === 200) {
			let grupe = JSON.parse(ajax.responseText);
			grupeSelect.innerHTML = `<option value="" disabled selected>--Odaberite grupu--</option>`;
			grupe.forEach((gr) => {
				grupeSelect.innerHTML += `<option value=${gr.id}>${gr.naziv}</option>`;
			});
		} else if (ajax.readyState === 4 && ajax.status === 404) {
		}
	};

	ajax.open("GET", `/v2/predmeti/${idPredmeta}/grupe`, true);
	ajax.send();
	grupeSelect.disabled = false;
}
const grupeSelect = document.getElementById("grupe");

let predmetiSelect = document.getElementById("predmeti");
predmetiSelect.onchange = dajGrupeOdPredmeta;
