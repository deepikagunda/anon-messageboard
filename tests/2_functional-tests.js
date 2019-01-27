var chaiHttp = require("chai-http");
var chai = require("chai");
var assert = chai.assert;
var server = require("../server");

chai.use(chaiHttp);

const board = "testBoard";
const threadKeys = [
  "_id",
  "board",
  "text",
  "delete_password",
  "created_on",
  "bumped_on",
  "reported",
  "replies"
];
const replyKeys = ["_id", "text", "created_on", "delete_password", "reported"];

suite("Functional Tests", function() {
  // this.timeout(10000);
  suite("API ROUTING FOR /api/threads/:board", function() {

    suite("POST", function() {
      test("posting message", done => {
        chai
          .request(server)
          .post(`/api/threads/${board}`)
          .redirects(0)
          .send({
            text: "123",
            delete_password: "asd"
          })
          .end(function(err, res) {
            // Redirects counts as errors apparently (in this version of chai-http)
            //console.log(res);
            assert.equal(res.status, 302);
            done();
          });
      });

      test("posting message with no text", done => {
        chai
          .request(server)
          .post(`/api/threads/${board}`)
          .redirects(0)
          .send({
            delete_password: "asd"
          })
          .end(function(err, res) {
            assert.include(res.text, "error");

            //assert(!!err, "Error should not be null");
            done();
          });
      });

      test("posting message with no delete_password", done => {
        chai
          .request(server)
          .post(`/api/threads/${board}`)
          .redirects(0)
          .send({
            text: "asd"
          })
          .end(function(err, res) {
            assert.include(res.text, "error");
            done();
          });
      });
    });

    suite("GET", function() {
      test("getting board", done => {
        const filteredReplyKeys = ["reported", "delete_password"];
        chai
          .request(server)
          .get(`/api/threads/${board}`)
          .end(function(err, res) {
          //console.log(res);
            //assert(!Boolean(err), "Error not null");
            assert.isArray(res.body, "Reeponse is not array");
            /* res.body.forEach(t => {
              threadKeys.forEach(k => {
                assert(
                  t.hasOwnProperty(k),
                  `Object does not have the corresponding keys: ${k}, ${JSON.stringify(
                    t
                  )}`
                );
              });
              t.replies.forEach(r => {
                filteredReplyKeys.forEach(k => {
                  assert(
                    !r.hasOwnProperty(k),
                    `Object MUST NOT have the corresponding key: ${k}, ${JSON.stringify(
                      r
                    )}`
                  );
                });
              });
            }); */
            done();
          });
      });
    });
    suite("DELETE", function() {
        test("delete thread +ve testcase", done => {
          chai
            .request(server)
            .post(`/api/_threads/${board}`)
            .send({
              text: "delete thread this one",
              delete_password: "password"
            })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              console.log(res.body._id);
              let x = res.body._id;
              chai
                .request(server)
                .delete(`/api/threads/${board}`)
                .send({
                  thread_id: x,
                  delete_password: "password"
                })
                .end(function(err, res) {
                  assert.equal(res.status, 200);
                  assert.include(res.text, "success");
                  done();
                });
            });
        }); //end of delete +ve testcase
        test("delete thread -ve testcase", done => {
          chai
            .request(server)
            .post(`/api/_threads/${board}`)
            .send({
              text: "delete thread with wrong pssword ",
              delete_password: "password"
            })
            .end(function(err, res) {
              assert.equal(res.status, 200);
              console.log(res.body._id);
              let x = res.body._id;
              chai
                .request(server)
                .delete(`/api/threads/${board}`)
                .send({
                  thread_id: x,
                  delete_password: "password1"
                })
                .end(function(err, res) {
                  //console.log(res);
                  assert.include(res.text, "incorrect password");
                  done();
                });
            });
        }); //end of delete one more suite.
      });
      suite("PUT", function() {
        test("Report a thread", done => {
          chai
            .request(server)
            .post(`/api/_threads/${board}`)
            .send({
              text: "123",
              delete_password: "asd"
            })
            .end(function(err, postRes) {
              console.log(postRes.body._id);
              chai
                .request(server)
                .put(`/api/threads/${board}`)
                .send({
                  thread_id: postRes.body._id
                })
                .end(function(err, res) {
                  //assert(!err, 'Error not null');
                  assert.equal(
                    res.text,
                    "success",
                    `Response not success: ${res.text}`
                  );
                  done();
                });
            });
        });
      });
  
  });
  suite("API ROUTING FOR /api/replies/:board", function() {
    const sendThread = () =>
      new Promise((resolve, reject) => {
        chai
          .request(server)
          .post(`/api/_threads/${board}`)
          .send({
            text: "123",
            delete_password: "aaaa"
          })
          .end(function(err, res) {
            if (err) return reject(err);
            resolve(res.body._id);
          });
      });

    const sendReply = (thread_id, delete_password) =>
      new Promise((resolve, reject) => {
        chai
          .request(server)
          .post(`/api/_replies/${board}`)
          .send({
            text: "123",
            delete_password: delete_password || "lol",
            thread_id: thread_id
          })
          .end(function(err, res) {
            if (err) return reject(err);
            resolve(res.body);
          });
      });

    suite("POST", function() {
      test("posting message, check redirect", done => {
        chai
          .request(server)
          .post(`/api/_threads/${board}`)
          .send({
            text: "123",
            delete_password: "aaaa"
          })
          .end(function(err, thread) {
            // assert(!err, `Error should be null`);
            chai
              .request(server)
              .post(`/api/replies/${board}`)
              .redirects(0)
              .send({
                thread_id: thread.body._id,
                text: "asdasd",
                delete_password: "asd"
              })
              .end((err, res) => {
                /*assert(
                  Boolean(err),
                  "Redirect throws error, so error should NOT be null"
                );
                */
                //console.log(res.status);
                assert.equal(res.status, 302);
                done();
              });
          });
      });

      test("posting message", done => {
        chai
          .request(server)
          .post(`/api/_threads/${board}`)
          .send({
            text: "1234",
            delete_password: "aaaa"
          })
          .end(function(err, thread) {
            //assert(!err, `Error should be null`);
            chai
              .request(server)
              .post(`/api/_replies/${board}`)
              .send({
                thread_id: thread.body._id,
                text: "asdasd",
                delete_password: "asd"
              })
              .end((err, res) => {
                //console.log(res);
                //assert(!err, "Error should be null");
                replyKeys.forEach(k => {
                  assert.equal(
                    res.body.hasOwnProperty(k),
                    true,
                    `Object does not have the corresponding keys: ${k}, ${JSON.stringify(
                      res.body
                    )}`
                  );
                });
                done();
              });
          });
      });
    });
    suite("GET", function() {
        test("get replies", done => {
          const CANT_REPLIES = 10;
          const filteredKeys = ["reported", "delete_password"];
          sendThread()
            .then(thread_id => {
              Promise.all(
                Array(CANT_REPLIES)
                  .fill(0)
                  .map(() => sendReply(thread_id))
              )
                .then(() => {
                  chai
                    .request(server)
                    .get(`/api/replies/${board}`)
                    .query({
                      thread_id: thread_id
                    })
                    .end((err, res) => {
                      // console.log(res)
                      //assert(!err, "Error should be null");
                      assert.equal(
                        Array.isArray(res.body),
                        false,
                        "Response should NOT be an Array"
                      );
                      assert.equal(
                        res.body.hasOwnProperty("replies"),
                        true,
                        "Theres no replies prop"
                      );
                      assert.equal(
                        res.body.replies.length,
                        CANT_REPLIES,
                        "Qty replies do not match"
                      );
                      replyKeys
                        .filter(k => !filteredKeys.includes(k))
                        .forEach(k => {
                          res.body.replies.forEach(r => {
                            assert.equal(
                              r.hasOwnProperty(k),
                              true,
                              `Propterties do not match: ${k} -> ${JSON.stringify(
                                r
                              )}`
                            );
                            // console.log('here');
                          });
                        });
                      // console.log('is this happ faster and done getting called ear;y');
  
                      done();
                    });
                }) //end of second then
                .catch(err => {
                  assert(!err, "Error should be null");
                });
            }) //end of first then
            .catch(err => {
              assert(!err, "Error should be null");
            });
        }); //end of test .
      }); //end of suite get
  
      suite("PUT", function() {
        test("report reply", done => {
          const CANT_REPLIES = 1;
          sendThread()
            .then(thread_id => {
              console.log(thread_id);
              Promise.all(
                Array(CANT_REPLIES)
                  .fill(0)
                  .map(() => sendReply(thread_id))
              )
                .then(replies => {
                  console.log(replies[0].replies[0]._id);
                  chai
                    .request(server)
                    .put(`/api/replies/${board}`)
                    .send({
                      thread_id: thread_id,
                      reply_id: replies[0].replies[0]._id
                    })
                    .end((err, res) => {
                      //assert(!err, "Error should be null");
                      // console.log(res);
                      assert.equal(
                        res.text,
                        "success",
                        `Text should be success got: ${res.text}`
                      );
                      done();
                    });
                })
                .catch(err => {
                  assert(!err, "Error should be null");
                });
            })
            .catch(err => {
              assert(!err, "Error should be null");
            });
        });
      });
  
      suite("DELETE", function() {
        test("delete reply with correct password", done => {
          const CANT_REPLIES = 1;
          const delete_password = "aaaaa";
          sendThread()
            .then(thread_id => {
              Promise.all(
                Array(CANT_REPLIES)
                  .fill(0)
                  .map(() => sendReply(thread_id, delete_password))
              )
                .then(replies => {
                  chai
                    .request(server)
                    .delete(`/api/replies/${board}`)
                    .send({
                      thread_id: thread_id,
                      reply_id: replies[0].replies[0]._id,
                      delete_password: delete_password
                    })
                    .end((err, res) => {
                      //assert(!err, "Error should be null");
                      assert.equal(
                        res.text,
                        "success",
                        `Text should be success got: ${res.text}`
                      );
                      done();
                    });
                })
                .catch(err => {
                  assert(!err, "Error should be null");
                });
            })
            .catch(err => {
              assert(!err, "Error should be null");
            });
        });
  
        test("delete reply with incorrect password", done => {
          const CANT_REPLIES = 1;
          const delete_password = "aaaaa";
          sendThread()
            .then(thread_id => {
              Promise.all(
                Array(CANT_REPLIES)
                  .fill(0)
                  .map(() => sendReply(thread_id, delete_password))
              )
                .then(replies => {
                  chai
                    .request(server)
                    .delete(`/api/replies/${board}`)
                    .send({
                      thread_id: thread_id,
                      reply_id: replies[0]._id,
                      delete_password: `NoPE${delete_password}`
                    })
                    .end((err, res) => {
                      //assert(!err, "Error should be null");
                      assert.equal(
                        res.text,
                        "incorrect password",
                        `Text should be incorrect password, got: ${res.text}`
                      );
                      done();
                    });
                })
                .catch(err => {
                  assert(!err, "Error should be null");
                });
            })
            .catch(err => {
              assert(!err, "Error should be null");
            });
        });
      });
  
  });

 
});
