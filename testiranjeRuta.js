// Import the dependencies for testing
const chai = require('chai');
const chaiHttp = require('chai-http');
const app = require('./index');
const fs = require('fs');
chai.use(chaiHttp);
chai.should();

function csvToJsonTestniPodaci(csv){
    const sviTestniPodaci = csv.replace("\r", "").split("\n");
    const jsonSviTestniPodaci = [];
    for(let i = 0; i < sviTestniPodaci.length; i++){
        if(sviTestniPodaci[i]){
            const testniPodaciProperties = sviTestniPodaci[i].split(",");
            if(testniPodaciProperties.length !== 4) continue;
            jsonSviTestniPodaci.push({
                operacija: testniPodaciProperties[0],
                ruta: testniPodaciProperties[1],
                ulaz: JSON.parse(testniPodaciProperties[2].replace(/&&&/g, ",")),
                izlaz: JSON.parse(testniPodaciProperties[3].replace(/&&&/g, ","))
            });
        }
    }

    return jsonSviTestniPodaci;
}
describe("Testiranje", function() {
    csvToJsonTestniPodaci(
        fs.readFileSync('testniPodaci.txt', 'utf8')).forEach(function(test, index) {
            it(`Test ${index + 1}`, function (done) {
            switch (test.operacija){
                case 'DELETE':
                    chai.request(app)
                        .delete(test.ruta)
                        .end(function(error, response){
                            response.body.should.be.eql(test.izlaz);
                            done();
                        });
                break;
                case 'GET':
                    chai.request(app)
                        .get(test.ruta)
                        .end(function(error,response){
                            response.body.should.be.eql(test.izlaz);
                            done();
                        });
                    break;
                case 'POST':
                    chai.request(app)
                        .post(test.ruta)
                        .send(test.ulaz)
                        .end(function(error, response){
                            response.body.should.be.eql(test.izlaz);
                            done();
                        });
                    break;
                default:
                    done();
            }
        });
    });
})

