function pokreniPrviTest(){
    const testKontejner = document.getElementById("test-kontejner");
    testKontejner.innerHTML = "";
    const tekstTesta = document.createElement("p");
    tekstTesta.classList.add("test-tekst");
    tekstTesta.innerHTML = "Prvi test: Ispravan poziv metoda iscrtajRaspored() i 5 ispravnih poziva mteode dodajAktivnosti().";
    testKontejner.append(tekstTesta);
    iscrtajRaspored(testKontejner, ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"], 8, 23);
    dodajAktivnost(testKontejner, "OR", "Predavanje", 10.5, 12.5 , "Utorak");
    dodajAktivnost(testKontejner, "OR", "Vježbe", 12.5, 13 , "Utorak");
    dodajAktivnost(testKontejner, "TP", "Predavanje", 8.5, 11 , "Srijeda");
    dodajAktivnost(testKontejner, "TP", "Vježbe", 21, 22.5 , "Četvrtak");
    dodajAktivnost(testKontejner, "WT", "Vježbe", 20.5, 23 , "Petak");
}

function pokreniDrugiTest(){
    const testKontejner = document.getElementById("test-kontejner");
    testKontejner.innerHTML = "";
    iscrtajRaspored(testKontejner, ["Ponedjeljak", "Utorak", "Srijeda"], 17, 15);
    const tekstTesta = document.createElement("p");
    tekstTesta.classList.add("test-tekst");
    tekstTesta.innerHTML = "Drugi test: Neispravan poziv metoda iscrtajRaspored() - početno vrijeme 17, krajnje vrijeme 15. Trebala bi biti prikazana greška.";
    testKontejner.insertBefore(tekstTesta, testKontejner.children[0]);
}

function pokreniTreciTest(){
    const testKontejner = document.getElementById("test-kontejner");
    testKontejner.innerHTML = "";
    iscrtajRaspored(testKontejner, ["Ponedjeljak", "Utorak", "Srijeda"], 12, 15);
    dodajAktivnost(testKontejner, "Naziv", "Tip", 12.5, 11, "Utorak");
    dodajAktivnost(testKontejner, "Naziv", "Tip", 12, 12.5, "Utorak");
    dodajAktivnost(testKontejner, "Naziv", "Tip", 12, 13, "Srijeda");
    dodajAktivnost(testKontejner, "Naziv", "Tip", 12, 15, "Ponedjeljak");
    dodajAktivnost(testKontejner, "Naziv", "Tip", 14, 15, "Srijeda");
    dodajAktivnost(testKontejner, "Naziv", "Tip", 13, 14, "Utorak");
    const tekstTesta = document.createElement("p");
    tekstTesta.classList.add("test-tekst");
    tekstTesta.innerHTML = "Treći test: Ispravan poziv metoda iscrtajRaspored(), 5 ispravnih poziva metode dodajAktivnost() i jedan neispravan poziv metode dodajAktivnost() - preklapanje termina. Trebao bi biti prikazan alert.";
    testKontejner.insertBefore(tekstTesta, testKontejner.children[0]);
}

function resetujTestove(){
    const testKontejner = document.getElementById("test-kontejner");
    testKontejner.innerHTML = "";
}