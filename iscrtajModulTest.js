let assert = chai.assert;
let okvir = document.getElementById("okvir");
let dani = ["Ponedjeljak", "Utorak", "Srijeda", "Četvrtak", "Petak"];
window.alert = function() {};
describe('Raspored', function() {

    afterEach(function(){
        okvir.innerHTML = "";
    })

    describe('iscrtajRaspored()', function() {
        it('Test 1 - Testiranje broja dana u rasporedu (svi dani)' , function() {
            Raspored.iscrtajRaspored(okvir, dani, 8, 21);
            let tabela = document.getElementById("raspored");
            assert.equal(tabela.children.length, 6, 'Broj redova treba biti 6');

        });
        it('Test 2 - Testiranje broja dana u rasporedu (dva dana)', function() {
            Raspored.iscrtajRaspored(okvir, dani.slice(0,2), 8, 21);
            let tabela = document.getElementById("raspored");
            assert.equal(tabela.children.length, 3, 'Broj redova treba biti 3');
        });
        it('Test 3 - Testiranje broja dana u rasporedu (četiri dana)', function() {
            Raspored.iscrtajRaspored(okvir, dani.slice(0,4), 8, 21);
            let tabela = document.getElementById("raspored");
            assert.equal(tabela.children.length, 5, 'Broj redova treba biti 5');
        });
        it('Test 4 - Testiranje broja sati u rasporedu (08:00 - 21:00)', function() {
            //Prema postavci to su dani 8 10 12 15 17 19
            Raspored.iscrtajRaspored(okvir, dani, 8, 21);
            let tabela = document.getElementById("raspored");
            let prviRed = tabela.children[0];
            let brojSati = 0;
            for(let i = 0; i < prviRed.children.length; i++){
                if( prviRed.children[i].children.length )
                    brojSati++;
            }
            assert.equal(brojSati, 6, 'Broj sati treba biti 6');
        });
        it('Test 5 - Testiranje broja sati u rasporedu (17:00 - 21:00)', function() {
            //Prema postavci to su dani 17 19
            Raspored.iscrtajRaspored(okvir, dani, 17, 21);
            let tabela = document.getElementById("raspored");
            let prviRed = tabela.children[0];
            let brojSati = 0;
            for(let i = 0; i < prviRed.children.length; i++){
                if( prviRed.children[i].children.length )
                    brojSati++;
            }
            assert.equal(brojSati, 2, 'Broj sati treba biti 2');
        });
        it('Test 6 - Testiranje broja sati u rasporedu (12:00 - 13:00)', function() {
            //Prema postavci to su dani 12
            Raspored.iscrtajRaspored(okvir, dani, 12, 13);
            let tabela = document.getElementById("raspored");
            let prviRed = tabela.children[0];
            let brojSati = 0;
            for(let i = 0; i < prviRed.children.length; i++){
                if( prviRed.children[i].children.length )
                    brojSati++;
            }
            assert.equal(brojSati, 1, 'Broj sati treba biti 1');
        });
        it('Test 7 - Testiranje pogrešnog vremena rasporeda (13:00 - 12:00)', function() {
            Raspored.iscrtajRaspored(okvir, dani, 13, 12);
            const greskaDiv = okvir.children[0];
            const greska = greskaDiv.innerHTML;
            assert.equal(greska, "Greška", 'Trebala bi biti prikazana greška');
        });
        it('Test 8 - Testiranje pogrešnog vremena rasporeda (13:00 - 13:00)', function() {
            Raspored.iscrtajRaspored(okvir, dani, 13, 13);
            const greskaDiv = okvir.children[0];
            const greska = greskaDiv.innerHTML;
            assert.equal(greska, "Greška", 'Trebala bi biti prikazana greška');
        });
        it('Test 9 - Testiranje pogrešnog vremena rasporeda (08:00 - 25:00)', function() {
            Raspored.iscrtajRaspored(okvir, dani, 8, 25);
            const greskaDiv = okvir.children[0];
            const greska = greskaDiv.innerHTML;
            assert.equal(greska, "Greška", 'Trebala bi biti prikazana greška');
        });
        it('Test 10 - Testiranje pogrešnog vremena rasporeda (-05:00 - 21:00)', function() {
            Raspored.iscrtajRaspored(okvir, dani, -5, 21);
            const greskaDiv = okvir.children[0];
            const greska = greskaDiv.innerHTML;
            assert.equal(greska, "Greška", 'Trebala bi biti prikazana greška');
        });
    });

    describe('dodajAktivnost()', function(){
        it('Test 1 - Testiranje dodavanja aktivnosti (3 aktivnosti)' , function() {
            Raspored.iscrtajRaspored(okvir, dani, 8, 21);
            let tabela = document.getElementById("raspored");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 12, 13, "Utorak");
            Raspored.dodajAktivnost(okvir, "WT", "Vježbe", 12,14, "Srijeda");
            Raspored.dodajAktivnost(okvir, "TP","Tutorijal", 11, 15, "Ponedjeljak");
            let popunjenoClassCounter = 0;
            for(let i = 0; i < tabela.children.length; i++){
                const red = tabela.children[i];
                for(let j = 0; j < red.children.length; j++){
                    const celija = red.children[j];
                    if( celija.classList.contains("popunjeno")) popunjenoClassCounter++;
                }
            }
            assert.equal(popunjenoClassCounter, 3, 'Broj aktivnosti treba biti 3');
        });
        it('Test 2 - Testiranje dodavanja aktivnosti (2 aktivnosti)' , function() {
            Raspored.iscrtajRaspored(okvir, dani, 8, 21);
            let tabela = document.getElementById("raspored");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 12, 13, "Utorak");
            Raspored.dodajAktivnost(okvir, "WT", "Vježbe", 12,14, "Srijeda");
            let popunjenoClassCounter = 0;
            for(let i = 0; i < tabela.children.length; i++){
                const red = tabela.children[i];
                for(let j = 0; j < red.children.length; j++){
                    const celija = red.children[j];
                    if( celija.classList.contains("popunjeno")) popunjenoClassCounter++;
                }
            }
            assert.equal(popunjenoClassCounter, 2, 'Broj aktivnosti treba biti 2');
        });
        it('Test 3 - Testiranje dodavanja aktivnosti (1 aktivnost)' , function() {
            Raspored.iscrtajRaspored(okvir, dani.slice(0,2), 8, 21);
            let tabela = document.getElementById("raspored");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 12, 13, "Utorak");
            let popunjenoClassCounter = 0;
            for(let i = 0; i < tabela.children.length; i++){
                const red = tabela.children[i];
                for(let j = 0; j < red.children.length; j++){
                    const celija = red.children[j];
                    if( celija.classList.contains("popunjeno")) popunjenoClassCounter++;
                }
            }
            assert.equal(popunjenoClassCounter, 1, 'Broj aktivnosti treba biti 1');
        });
        it('Test 4- Testiranje neispravnog vremena (0 aktivnosti bi trebalo biti prisutno)' , function() {
            Raspored.iscrtajRaspored(okvir, dani.slice(0,2), 8, 21);
            let tabela = document.getElementById("raspored");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 13, 12, "Utorak");
            let popunjenoClassCounter = 0;
            for(let i = 0; i < tabela.children.length; i++){
                const red = tabela.children[i];
                for(let j = 0; j < red.children.length; j++){
                    const celija = red.children[j];
                    if( celija.classList.contains("popunjeno")) popunjenoClassCounter++;
                }
            }
            assert.equal(popunjenoClassCounter, 0, 'Broj aktivnosti treba biti 0');
        });
        it('Test 5 - Testiranje neispravnog vremena (2 aktivnosti bi trebalo biti prisutno - dva dupla poziva)' , function() {
            Raspored.iscrtajRaspored(okvir, dani.slice(0,2), 8, 21);
            let tabela = document.getElementById("raspored");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 12, 13, "Utorak");
            Raspored.dodajAktivnost(okvir, "OR", "Vježbe", 12, 13, "Utorak");
            Raspored.dodajAktivnost(okvir, "TP", "Predavanje", 12 ,13, "Ponedjeljak");
            Raspored.dodajAktivnost(okvir, "TP", "Vježbe", 12, 13, "Ponedjeljak");

            let popunjenoClassCounter = 0;
            for(let i = 0; i < tabela.children.length; i++){
                const red = tabela.children[i];
                for(let j = 0; j < red.children.length; j++){
                    const celija = red.children[j];
                    if( celija.classList.contains("popunjeno")) popunjenoClassCounter++;
                }
            }
            assert.equal(popunjenoClassCounter, 2, 'Broj aktivnosti treba biti 2');
        });
        it('Test 6 - Testiranje neispravnog vremena (2 aktivnosti bi trebalo biti prisutno - dva ispravna, dva neispravna poziva)' , function() {
            Raspored.iscrtajRaspored(okvir, dani.slice(0,2), 8, 21);
            let tabela = document.getElementById("raspored");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 12, 13, "Utorak");
            Raspored.dodajAktivnost(okvir, "OR", "Vježbe", 13, 12, "Utorak");
            Raspored.dodajAktivnost(okvir, "TP", "Predavanje", 12 ,13, "Ponedjeljak");
            Raspored.dodajAktivnost(okvir, "TP", "Vježbe", 7, 13, "Ponedjeljak");

            let popunjenoClassCounter = 0;
            for(let i = 0; i < tabela.children.length; i++){
                const red = tabela.children[i];
                for(let j = 0; j < red.children.length; j++){
                    const celija = red.children[j];
                    if( celija.classList.contains("popunjeno")) popunjenoClassCounter++;
                }
            }
            assert.equal(popunjenoClassCounter, 2, 'Broj aktivnosti treba biti 2');
        });
        it('Test 7 - Testiranje preklapanja vremena (1 aktivnost bi trebala biti prisutna - jedna ispravna, druga preklopljena aktivnost' , function() {
            Raspored.iscrtajRaspored(okvir, dani.slice(0,2), 8, 21);
            let tabela = document.getElementById("raspored");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 12, 13, "Utorak");
            Raspored.dodajAktivnost(okvir, "OR", "Vježbe", 11, 12.5, "Utorak");

            let popunjenoClassCounter = 0;
            for(let i = 0; i < tabela.children.length; i++){
                const red = tabela.children[i];
                for(let j = 0; j < red.children.length; j++){
                    const celija = red.children[j];
                    if( celija.classList.contains("popunjeno")) popunjenoClassCounter++;
                }
            }
            assert.equal(popunjenoClassCounter, 1, 'Broj aktivnosti treba biti 1');
        });
        it('Test 8 - Testiranje preklapanja vremena (1 aktivnost bi trebala biti prisutna - jedna ispravna, dvije preklopljene aktivnosti' , function() {
            Raspored.iscrtajRaspored(okvir, dani.slice(0,2), 8, 21);
            let tabela = document.getElementById("raspored");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 12, 13, "Utorak");
            Raspored.dodajAktivnost(okvir, "OR", "Vježbe", 11, 12.5, "Utorak");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 12.5, 13, "Utorak");

            let popunjenoClassCounter = 0;
            for(let i = 0; i < tabela.children.length; i++){
                const red = tabela.children[i];
                for(let j = 0; j < red.children.length; j++){
                    const celija = red.children[j];
                    if( celija.classList.contains("popunjeno")) popunjenoClassCounter++;
                }
            }
            assert.equal(popunjenoClassCounter, 1, 'Broj aktivnosti treba biti 1');
        });
        it('Test 9 - Testiranje ispravnosti dana dodavanja (Ponedjeljak)' , function() {
            Raspored.iscrtajRaspored(okvir, dani.slice(0,2), 8, 21);
            let tabela = document.getElementById("raspored");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 12, 13, "Ponedjeljak");

            let indexRedaAktivnosti = -1;
            for(let i = 0; i < tabela.children.length; i++){
                const red = tabela.children[i];
                for(let j = 0; j < red.children.length; j++){
                    const celija = red.children[j];
                    if( celija.classList.contains("popunjeno")){
                        const naslov = celija.children[0];
                        const podnaslov = celija.children[1];
                        if( naslov.innerHTML === "OR" && podnaslov.innerHTML === "Predavanje") {
                            indexRedaAktivnosti = i;
                            break;
                        }
                    }
                }
            }
            let danURedu = "";
            if(indexRedaAktivnosti !== -1) danURedu = tabela.children[indexRedaAktivnosti].children[0].children[0].innerHTML;
            assert.equal(danURedu, "Ponedjeljak", 'Dan treba biti \"Ponedjeljak\"');
        });
        it('Test 10 - Testiranje ispravnosti naziva naslova i podnaslova (\"WT\" i \"Predavanje\")' , function() {
            Raspored.iscrtajRaspored(okvir, dani.slice(0,2), 8, 21);
            let tabela = document.getElementById("raspored");
            Raspored.dodajAktivnost(okvir, "OR", "Predavanje", 12, 13, "Ponedjeljak");

            let tekstNaslova = "";
            let tekstPodnaslova = "";
            for(let i = 0; i < tabela.children.length; i++){
                const red = tabela.children[i];
                for(let j = 0; j < red.children.length; j++){
                    const celija = red.children[j];
                    if( celija.classList.contains("popunjeno")){
                        const naslov = celija.children[0];
                        const podnaslov = celija.children[1];
                        if( naslov.innerHTML === "OR" && podnaslov.innerHTML === "Predavanje") {
                            tekstNaslova = naslov.innerHTML;
                            tekstPodnaslova = podnaslov.innerHTML;
                        }
                    }
                }
            }
            assert.equal(tekstNaslova === "OR" && tekstPodnaslova === "Predavanje", true , 'Naslov treba biti \"OR\", a podnaslov treba biti \"Predavanje\"');
        });
    });
});