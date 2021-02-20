function provjeriSate(pocetak, kraj, dodavanje){
    if( pocetak < 0 || pocetak > 24 ) return false;
    if( kraj < 0 || kraj > 24) return false;
    if( !dodavanje && (!Number.isInteger(pocetak) || !Number.isInteger(kraj))) return false;
    if(dodavanje && ( pocetak % 1 !== 0 && pocetak % 1 !== 0.5 ) ||( kraj % 1 !== 0 && kraj % 1 !== 0.5 ) ) return false;
    return pocetak < kraj;
}

function formatirajSat(sat){
    return `${sat < 10 ? '0' : ''}${sat}:00`;
}

function dajSatIzFormatiranogOblika(sat){
    const split = sat.split(":");
    return parseInt(split[0]);
}

function dajBrojCasova(pocetak, kraj){
    let brojCasova = 0;
    while(pocetak < kraj){
        brojCasova++;
        pocetak += 0.5;
    }
    return brojCasova;
}

function kreirajNizSati(pocetak,kraj) {
    const sati = [];
    if(pocetak < 15 && pocetak % 2 === 1) pocetak++;
    if( pocetak < 8) pocetak = 8;
    while(pocetak <= kraj){
        if(pocetak === 14) pocetak++;
        sati.push(pocetak);
        pocetak += 2;
    }
    return sati;
}

function dajBrojKolona(pocetak, kraj){
    return (kraj - pocetak) * 2 + 1;
}

function kreirajKolonuSati(pocetak, kraj){
    const red = document.createElement("tr");
    const brojKolona = dajBrojKolona(pocetak, kraj);
    const sati = kreirajNizSati(pocetak, kraj);
    let pocetakIterator = pocetak;
    let brojacSati = 0;

    for(let i = 0; i < brojKolona; i++){
        const celija = document.createElement("td");
        celija.setAttribute("colspan", "1");
        celija.classList.add("vrijeme");
        if(i !== brojKolona - 1 && pocetakIterator === sati[brojacSati] ){
            celija.setAttribute("colspan", "2");
            if(!i) celija.classList.add("desno");
            else celija.classList.add("centar");
            const p = document.createElement("p");
            p.innerHTML = formatirajSat(sati[brojacSati]);
            celija.append(p);
            brojacSati++;
            pocetakIterator+=1;
            red.append(celija);
            i++;
            continue;
        }
        red.append(celija);
        pocetakIterator += 0.5;
    }

    return red;
}

function dajPozicijuAktivnosti(okvir, pocetak, kraj, dan){
    if(!okvir) return;

    const pozicija = {
        red: -1,
        kolona: -1,
        greska: null
    }

    const tabela = okvir.getElementsByTagName("table")[0];
    const redovi = tabela.children;
    const satiUTabeli = [];

    for(let i = 0; i < redovi.length; i++){

        const red = redovi[i];

        if( !i ) {
            // Prvi red predstavlja sate iznad rasporeda
            // Kreiramo niz svih sati iz rasporeda
            for(let j = 0; j < redovi[i].children.length; j++){
                const celija = red.children[j];
                if( celija.children.length ){
                    //Ukoliko celija nije prazna, znaci da se unutra nalazi vrijednost sata
                    const p = celija.children[0];
                    satiUTabeli.push( dajSatIzFormatiranogOblika(p.innerHTML) );
                }
            }
        }
        // Prva celija svih redova osim prvog predstavlja dan
        const danCelija = red.children[0];
        const nazivDana = danCelija.children[0];
        if(nazivDana.innerHTML === dan) pozicija.red = i;
    }

    //Posljednji sat se nikada ne prikazuje, potrebno ga je rucno ubaciti
    if(satiUTabeli[satiUTabeli.length - 1] === 12) satiUTabeli.push(15);
    else satiUTabeli.push( satiUTabeli[satiUTabeli.length - 1] + 2 );

    //Provjeravamo da li smo nasli poslati dan, ako nismo prekidamo proces trazenja pozicije
    if(pozicija.red === -1) {
        pozicija.greska = "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
        return pozicija;
    }

    //Provjeravamo da li je poslana aktivnost u rasponu trenutnog rasporeda
    if( satiUTabeli[0] > pocetak || satiUTabeli[satiUTabeli.length - 1] < kraj ){
        pozicija.greska = "Trenutni raspored ne podržava dužinu trajanja aktivnosti";
        return pozicija;
    }

    const redAktivnosti = redovi[pozicija.red];
    const brojCasovaAktivnosti = dajBrojCasova(pocetak,kraj);


    let brojacVremena = satiUTabeli[0];

    for(let i = 1; i < redAktivnosti.children.length; i++){
        const celija = redAktivnosti.children[i];
        if( brojacVremena === pocetak){
            pozicija.kolona = i;
            break;
        }
        if(celija.getAttribute("colspan")){
            brojacVremena += ( parseInt( celija.getAttribute("colspan") ) * 0.5 );
        }
        else brojacVremena += 0.5;
    }

    if(pozicija.kolona === -1){
        pozicija.greska = "Greška - u rasporedu ne postoji dan ili vrijeme u kojem pokušavate dodati termin";
        return pozicija;
    }


    for(let i = pozicija.kolona; i < pozicija.kolona + brojCasovaAktivnosti; i++ ){
        if(redAktivnosti.children[i].classList.contains("popunjeno")){
            pozicija.greska = "Aktivnost se preklapa sa već postojećom aktivnosti unutar rasporeda";
            return pozicija;
        }
    }

    return pozicija;
}

function iscrtajRaspored(okvir, dani, satPocetak, satKraj){
    if(!okvir || !provjeriSate(satPocetak, satKraj,false) || !dani.length){
        const greska = document.createElement("div");
        greska.classList.add("div-greska");
        greska.innerHTML = "Greška";
        okvir.innerHTML = "";
        okvir.append(greska);
        return;
    }

    okvir.classList.remove("div-greska");

    const tabela = document.createElement("table");
    tabela.setAttribute("id","raspored");
    tabela.append(kreirajKolonuSati(satPocetak, satKraj));

    for(let i = 0; i < dani.length; i++){
        const red = document.createElement("tr");

        for(let j = 0; j < dajBrojKolona(satPocetak, satKraj); j++){
            let celija = document.createElement("td");
            celija.classList.add("prazno");
            if( j && j % 2 === 1) celija.classList.add("prvi-tip");
            else if( j && j % 2 === 0) celija.classList.add("drugi-tip");
            else {
                const p = document.createElement("p");
                p.innerHTML = dani[i];
                celija.classList.add("dani");
                if( i === new Date().getDay() - 1 ) p.classList.add("boldirano");
                celija.append(p);
            }
            red.append(celija);
        }

        tabela.append(red);
    }

    okvir.append(tabela);
}

function dodajAktivnost(okvir, naziv, tip, vrijemePocetak, vrijemeKraj, dan){
    const raspored = document.getElementById("raspored");

    if(!raspored){
        alert("Greška-raspored nije kreiran");
        return;
    }

    if(!provjeriSate(vrijemePocetak, vrijemeKraj, true)){
        alert("Greška-neispravno vrijeme");
        return;
    }

    const pozicija = dajPozicijuAktivnosti(okvir, vrijemePocetak, vrijemeKraj, dan);
    if(pozicija.greska){
        alert(pozicija.greska);
        return;
    }

    const celijaAktivnosti = document.createElement("td");
    if(vrijemePocetak % 1 === 0.5 && vrijemeKraj % 1 === 0.5) celijaAktivnosti.classList.add("cetvrti-tip");
    else if(vrijemePocetak % 1 === 0.5 && vrijemeKraj % 1 === 0) celijaAktivnosti.classList.add("drugi-tip");
    else if(vrijemePocetak % 1 === 0 && vrijemeKraj % 1 === 0.5) celijaAktivnosti.classList.add("prvi-tip");
    else celijaAktivnosti.classList.add("treci-tip");
    celijaAktivnosti.classList.add("popunjeno");
    celijaAktivnosti.setAttribute("colspan", dajBrojCasova(vrijemePocetak, vrijemeKraj).toString());
    const naslov = document.createElement("p");
    naslov.classList.add("font-14");
    naslov.innerHTML = naziv;
    const podnaslov = document.createElement("p");
    podnaslov.innerHTML = tip;
    celijaAktivnosti.append(naslov);
    celijaAktivnosti.append(podnaslov);

    //Umetanje aktivnosti u tabelu
    const tabela = okvir.getElementsByTagName("table")[0];
    const redAktivnosti = tabela.children[pozicija.red];
    const celijaIzaAktivnosti = redAktivnosti.children[pozicija.kolona];

    redAktivnosti.insertBefore(celijaAktivnosti, celijaIzaAktivnosti);

    //Brisanje celija koje su visak nakon sto je dodana aktivnost
    const indexZaObrisati = pozicija.kolona + 1;
    let indexBrisanja = pozicija.kolona + 1;
    const indexKrajaBrisanja = pozicija.kolona + 1 + dajBrojCasova(vrijemePocetak, vrijemeKraj);

    while(indexBrisanja < indexKrajaBrisanja){
        redAktivnosti.removeChild(redAktivnosti.children[indexZaObrisati]);
        indexBrisanja++;
    }
}

if(window.location.pathname.split("/").pop() === 'raspored.html') {
    let okvir = document.getElementById("okvir");

    iscrtajRaspored(okvir, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 21);
    dodajAktivnost(okvir, "WT", "predavanje", 9, 12, "Ponedjeljak");
    dodajAktivnost(okvir, "WT", "vježbe", 12, 13.5, "Ponedjeljak");
    dodajAktivnost(okvir, "RMA", "predavanje", 14, 17, "Ponedjeljak");
    dodajAktivnost(okvir, "RMA", "vježbe", 12.5, 14, "Utorak");
    dodajAktivnost(okvir, "DM", "tutorijal", 14, 16, "Utorak");
    dodajAktivnost(okvir, "DM", "predavanje", 16, 19, "Utorak");
    dodajAktivnost(okvir, "OI", "predavanje", 12, 15, "Srijeda");
}




