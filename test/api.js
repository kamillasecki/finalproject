process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let category = require('../app/models/category');
let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();
chai.use(chaiHttp);


//create initial state of categories
  
describe('POSTing new categories', () => {
    before((done) => {
        category.remove({}, () => {
            var c = new category();
            c._id = mongoose.Types.ObjectId("5a8d915c7d7d1e6c642e5745");
            c.categoriesId = [];
            c.postsId = [];
            c.name = "Main";
            c.parent = null;
            c.save(function() {
                done();
            });
        });
    });

    it('it should be able to add new category under existing Main one', (done) => {
        let c = {
            category: "IT",
            parent: "5a8d915c7d7d1e6c642e5745"
        };
        chai.request(server)
            .post('/api/category')
            .send(c)
            .end((err, res) => {
                res.should.have.status(200);
                res.should.have.property('text').eql('Item has been added successfuly.');
                done();
            });
    });
    
    it('it should not be able to add new category if name is missing', (done) => {
        let c = {
            category: null,
            parent: "5a8d915c7d7d1e6c642e5745"
        };
        chai.request(server)
            .post('/api/category')
            .send(c)
            .end((err, res) => {
                res.should.have.status(406);
                res.error.should.have.property('text').eql("Missing element.");
                done();
            });
    });

    it('it should not be able to add the same name category', (done) => {
        let d = {
            category: "IT",
            parent: "5a8d915c7d7d1e6c642e5745"
        };
        chai.request(server)
            .post('/api/category')
            .send(d)
            .end((err, res) => {
                res.should.have.status(406);
                res.error.should.have.property('text').eql("Category with this mane already exists");
                done();
            });
    });
});

describe('GETing parents', () => {
    it('it should GET all parents of requested id', (done) => {
        chai.request(server)
            .get('/api/category/getParents/5a8d915c7d7d1e6c642e5745')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(1);
                done();
            });
    });
    
    it('it should render 404 if an ID does not exists', (done) => {
        chai.request(server)
            .get('/api/category/getParents/111111111111111111111111')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.have.property('text').contains("Error 404");
                done();
            });
    });
});

describe('GETing parents', () => {
    it('it should GET all parents of requested id', (done) => {
        chai.request(server)
            .get('/api/category/getParents/5a8d915c7d7d1e6c642e5745')
            .end((err, res) => {
                res.should.have.status(200);
                res.body.should.be.a('array');
                res.body.length.should.be.eql(1);
                done();
            });
    });
    
    it('it should render 404 if an ID does not exists', (done) => {
        chai.request(server)
            .get('/api/category/getParents/111111111111111111111111')
            .end((err, res) => {
                res.should.have.status(200);
                res.should.have.property('text').contains("Error 404");
                done();
            });
    });
});