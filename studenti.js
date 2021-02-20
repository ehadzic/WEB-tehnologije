function ucitajGrupe() {
	let ajax = new XMLHttpRequest();
	ajax.onreadystatechange = function () {
		if (ajax.readyState === 4 && ajax.status === 200) {
			let grupeSelect = document.getElementById("grupe");
			grupe = JSON.parse(ajax.responseText);
			grupeSelect.innerHTML = '<option value="" disabled selected>--Odaberite grupu--</option>';
			grupe.forEach((gr) => {
				grupeSelect.innerHTML += `<option value=${JSON.stringify(gr)}>${gr.naziv}</option>`;
			});
		}
	};
	ajax.open("GET", "/v2/grupe", true);
	ajax.send();
}

function unesiStudente() {
	let studenti = document.getElementById("studentiTxtArea").value.split("\n");
	studenti.forEach((s) => {
		let porGreske = document.getElementById("porukaGreske");
		porGreske.innerHTML = "";
		if (!document.getElementById("grupe").value) {
			porGreske.innerHTML = "Morate odabrati grupu!";
			return;
		}
		let grupa = JSON.parse(document.getElementById("grupe").value);
		
		if (!s.trim().length || !s.includes(",")) {
			porGreske.innerHTML = "Barem jedan od redova u textarea je pogrešno unesen!";
			return;
		}
		let elementi = s.split(",");
		if (elementi.length !== 2 || elementi[1].trim().length === 0) {
			porGreske.innerHTML = "Barem jedan od redova je pogrešno unesen!";
			return;
		}
		let index = elementi[1].trim();

		let ajax = new XMLHttpRequest();
		let poljeUnosa = document.getElementById("studentiTxtArea");
		poljeUnosa.value = "";
		ajax.onreadystatechange = function () {
			//Nema studenta, upravo je dodan
	
			if (ajax.readyState === 4 && ajax.status === 200) {
				console.log("Novi student, dodan je u bazu");
				poljeUnosa.value += "-" + JSON.parse(ajax.responseText).poruka + "\n";
				idStudenta = JSON.parse(ajax.responseText).id;
				let ajax2 = new XMLHttpRequest();
				ajax2.onreadystatechange = function () {
					if (ajax2.readyState === 4 && (ajax2.status === 200 || ajax2.status === 400)) {
						console.log("Novi student - dodan je u grupu");
						poljeUnosa.value += "-" + elementi[0] + ": " + ajax2.responseText + "\n";
					}
				};
				ajax2.open("POST", `/v2/studentigrupe`, true);
				ajax2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				ajax2.send(JSON.stringify({ student: idStudenta, grupa: grupa.id }));
			}
			//Drugi student sa istim indexom vec postoji, ne radimo ništa
			else if (ajax.readyState === 4 && ajax.status === 400) {
				console.log("GREŠKA", ajax.responseText);
				poljeUnosa.value += "-" + ajax.responseText + "\n";
			}

			//Student je već u bazi, mijenjamo mu grupu ako već ima grupu na istom predmetu
			else if (ajax.readyState === 4 && ajax.status === 403) {
				let idStudenta = JSON.parse(ajax.responseText).id;

				//trazimo sve grupe kojima pripada student sa datim id-em
				let ajax2 = new XMLHttpRequest();
				ajax2.onreadystatechange = function () {
					if (ajax2.readyState === 4 && ajax2.status === 200) {
						let grupe = JSON.parse(ajax2.responseText);
						let nadjenaGrupa = null;
						nadjenaGrupa = grupe.find((gr) => gr.predmet === grupa.predmet && gr.id !== grupa.id);
						let ajax3 = new XMLHttpRequest();
						if (nadjenaGrupa) {
							console.log("Student je već dodijeljen grupi iz istog predmeta!");

							ajax3.onreadystatechange = function () {
								if (ajax3.readyState === 4 && (ajax3.status === 200 || ajax3.status === 400))
									poljeUnosa.value += "-" + elementi[0] + ": " + ajax3.responseText + " grupe\n";
							};
							ajax3.open("PUT", `/v2/studentigrupe/${idStudenta}/${nadjenaGrupa.id}`, true);
							ajax3.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
							ajax3.send(JSON.stringify({ grupa: grupa.id }));
						} else {
							console.log("Student je dodijeljen barem jednoj grupi, ali nema grupe iz istog predmeta!");
							ajax3.onreadystatechange = function () {
								console.log("Možžže");
								if (ajax3.readyState === 4){
									console.log("MOŽEEE");
									poljeUnosa.value += "-" + elementi[0] + ": " + ajax3.responseText + "\n";
								}
							};
							ajax3.open("POST", `/v2/studentigrupe`, true);
							ajax3.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
							ajax3.send(JSON.stringify({ student: idStudenta, grupa: grupa.id }));
						}
					}
					//Student nije dodijeljenoj nijednoj grupi
					else if (ajax2.readyState === 4 && ajax2.status === 403) {
						console.log("Student do sad nije dodijeljen nijednoj grupi!");
						let ajax3 = new XMLHttpRequest();
						ajax3.onreadystatechange = function () {
							if (ajax3.readyState === 4 && (ajax2.status === 200 || ajax2.status === 400))
								poljeUnosa.value += "-" + elementi[0] + ": " + ajax.responseText + "\n";
						};
						ajax3.open("POST", `/v2/studentigrupe`, true);
						ajax3.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
						ajax3.send(JSON.stringify({ student: idStudenta, grupa: grupa.id }));
					}
				};
				ajax2.open("GET", `/v2/studentigrupe/${idStudenta}/grupe`, true);
				ajax2.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
				ajax2.send();
			}
		};
		ajax.open("POST", `/v2/student`, true);
		ajax.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
		ajax.send(JSON.stringify({ ime: elementi[0], index }));
	});
}


ucitajGrupe();
let unesiButton = document.getElementById("dodajStudenteButton");
unesiButton.onclick = unesiStudente;


