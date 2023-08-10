const express = require("express")
const app = express()
const handlebars = require("express-handlebars").engine
const bodyParser = require("body-parser")
const { initializeApp, applicationDefault, cert } = require('firebase-admin/app')
const { getFirestore, Timestamp, FieldValue } = require('firebase-admin/firestore')

const serviceAccount = require('./projetoweb-9c5af-firebase-adminsdk-f6tgp-a23931d818.json')

initializeApp({
  credential: cert(serviceAccount)
})

const db = getFirestore()

app.engine("handlebars", handlebars({defaultLayout: "main"}))
app.set("view engine", "handlebars")

app.use(bodyParser.urlencoded({extended: false}))
app.use(bodyParser.json())

app.get("/", function(req, res){
    res.render("primeira_pagina")
})

app.get("/consulta", async function(req, res){
    try {
        const agendamentosRef = db.collection('agendamentos');
        const agendamentosSnapshot = await agendamentosRef.get();
        const agendamentos = [];

        agendamentosSnapshot.forEach(doc => {
            agendamentos.push({
                id: doc.id,
                ...doc.data()
            });
        });

        res.render("consulta", { agendamentos });
    } catch (error) {
        console.error("Error fetching documents:", error);
        res.status(500).send("Internal Server Error");
    }
})

app.get("/editar/:id", async function(req, res){
     try {
        const agendamentoId = req.params.id;
        const agendamentoRef = db.collection('agendamentos').doc(agendamentoId);
        const agendamentoDoc = await agendamentoRef.get();
        const agendamento = agendamentoDoc.data();

        res.render("editar", { agendamento });
    } catch (error) {
        console.error("Error fetching document:", error);
        res.status(500).send("Internal Server Error");
    }
})

app.get("/excluir/:id", async function(req, res){
    try {
        const agendamentoId = req.params.id;
        const agendamentoRef = db.collection('agendamentos').doc(agendamentoId);

        await agendamentoRef.delete();

        res.redirect('/consulta');
    } catch (error) {
        console.error("Error deleting document:", error);
        res.status(500).send("Internal Server Error");
    }
})

app.post("/cadastrar", function(req, res){
    var result = db.collection('agendamentos').add({
        nome: req.body.nome,
        telefone: req.body.telefone,
        origem: req.body.origem,
        data_contato: req.body.data_contato,
        observacao: req.body.observacao
    }).then(function(){
        console.log('Added document');
        res.redirect('/')
    })
})

app.post("/atualizar", async function(req, res){
    try {
        const agendamentoId = req.params.id;
        const agendamentoRef = db.collection('agendamentos').doc(agendamentoId);
        
        await agendamentoRef.update({
            nome: req.body.nome,
            telefone: req.body.telefone,
            origem: req.body.origem,
            data_contato: req.body.data_contato,
            observacao: req.body.observacao
        });

        res.redirect('/consulta');
    } catch (error) {
        console.error("Error updating document:", error);
        res.status(500).send("Internal Server Error");
    }
});

app.listen(8081, function(){
    console.log("Servidor ativo!")
})