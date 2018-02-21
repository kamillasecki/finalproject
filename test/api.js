process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let category = require('../app/models/category');

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../server');
let should = chai.should();

chai.use(chaiHttp);

//create initial state of categories

describe('Create initial state of categories', () => {
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
                res.body.should.be.a('object');
                // res.body.should.have.property('errors');
                // res.body.errors.should.have.property('pages');
                // res.body.errors.pages.should.have.property('kind').eql('required');
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
                res.should.have.status(200);
                res.body.should.be.a('object');
                // res.body.should.have.property('errors');
                // res.body.errors.should.have.property('pages');
                // res.body.errors.pages.should.have.property('kind').eql('required');
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
// describe('GET category parents', () => {
//     it('it should GET all parents of the category', (done) => {
//         chai.request(server)
//             .get('/api/category/getParents/5a8d915c7d7d1e6c642e5745')
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 res.body.should.be.a('array');
//                 res.body.length.should.be.eql(1);
//                 done();
//             });
//     });
// });
/*
 * Test the /POST route
 */
//   describe('/POST book', () => {
//       it('it should not POST a book without pages field', (done) => {
//         let book = {
//             title: "The Lord of the Rings",
//             author: "J.R.R. Tolkien",
//             year: 1954
//         }
//         chai.request(server)
//             .post('/book')
//             .send(book)
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 res.body.should.be.a('object');
//                 res.body.should.have.property('errors');
//                 res.body.errors.should.have.property('pages');
//                 res.body.errors.pages.should.have.property('kind').eql('required');
//               done();
//             });
//       });
//       it('it should POST a book ', (done) => {
//         let book = {
//             title: "The Lord of the Rings",
//             author: "J.R.R. Tolkien",
//             year: 1954,
//             pages: 1170
//         }
//         chai.request(server)
//             .post('/book')
//             .send(book)
//             .end((err, res) => {
//                 res.should.have.status(200);
//                 res.body.should.be.a('object');
//                 res.body.should.have.property('message').eql('Book successfully added!');
//                 res.body.book.should.have.property('title');
//                 res.body.book.should.have.property('author');
//                 res.body.book.should.have.property('pages');
//                 res.body.book.should.have.property('year');
//               done();
//             });
//       });
//   });
