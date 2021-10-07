const exp = require("express");
const app = exp();
const fs = require("fs")
const { exit } = require("process");


app.use(exp.json());
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*")
}) 
let csvToJson = require('convert-csv-to-json');
const { once } = require("events");
const e = require("express");
const { json } = require("express");

    let rawdata = fs.readFileSync('config.json');
    let config = JSON.parse(rawdata);


if (!fs.existsSync('./whitelisted.csv')) {
    console.log("ERROR: No whitelisted.csv file has been found")
    exit(1)
}
if(!fs.existsSync('./whitelisted.json')){
    csvToJson.fieldDelimiter(',')
    csvToJson.generateJsonFileFromCsv("whitelisted.csv", "whitelisted.json")
    config.loaded = true;
    console.log("No whitelisted.json detected, converting csv to json")
}
if(!config.load_csv_onetime){
    csvToJson.fieldDelimiter(',')
    csvToJson.generateJsonFileFromCsv("whitelisted.csv", "whitelisted.json")
    console.log("Json reloaded: config is set csv_run_onetime = false")
}
else{
    console.log("Skipping csv reload, config is set csv_run_onetime = true")
}



app.get('/whitelisted', (req, res)=>{
    let rawdata = fs.readFileSync('whitelisted.json');
    let members = JSON.parse(rawdata);
    res.send(members)
})

app.get('/whitelisted/member/:address', (req, res, value) => {
    let sent = false;
    let rawdata = fs.readFileSync('whitelisted.json');
    let members = JSON.parse(rawdata);
    const user = members.find(c => c.member == req.params.address)
    if(!user){
        res.status(404).send("the member was not found");
    }
    res.send(user);
})

app.put('/whitelisted/update/:address', (req, res) => {
    let index = 0;
    let result = {}
    let rawdata = fs.readFileSync('whitelisted.json');
    let members = JSON.parse(rawdata);
    members.forEach((whitelisted_user, i) => {
        if(whitelisted_user.member == req.params.address){
            result = whitelisted_user
            index = i;
        }
    });
    if(result == {}){
        res.status(404).send("User does not exist")
    }
    result.reserve = req.body.reserve
    members[index] = result;
    const data = JSON.stringify(members);
    fs.writeFile('whitelisted.json', data, 'utf8', (err) =>{ if(err) console.log(err)});
    res.send(result)

})
const port = process.env.PORT || 3000
app.listen(port, ()=>console.log(`listening on port ${port}`));