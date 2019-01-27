/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

var expect = require('chai').expect;
var handler = require('../controllers/boardHandler');

module.exports = function (app) {
  app.route('/api/_replies/:board')
  .post(function (req, res) {
     let board = req.params.board;
     let threadId=req.body.thread_id;
     let delete_password=req.body.delete_password;
     let text=req.body.text;
    
    
     (async ()=> {
         // data text, delete_password, & thread_id
    if(!delete_password || !text || !threadId)
    {
      res.status(400).send('error - delete_password or text or threadId not sent');
    }
     else{
         let reply= await handler.postNewReply(board,threadId,text,delete_password);
         let result=await handler.bumpThreadDate(board,threadId);
         //res.redirect('/b/'+board+'/'+threadId);
       res.json(reply);
     }
       })();
  
  });
  
  app.route('/api/_threads/:board')
  .post(function (req, res) {
    let board = req.params.board;
    (async ()=> {
       //post a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}
      ////   .(Recomend res.redirect to board page /b/{board}) 
     // Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on),
      //  reported(boolean), delete_password, & replies(array).
    let delete_password=req.body.delete_password;
    let text = req.body.text;
    if(!delete_password || !text )
    {
      res.status(200).send('error - delete_password or text not sent');
    }
     else{
       
        let thread = await handler.createNewThread(board,text,delete_password);
        res.json(thread);
        //res.redirect('/b/'+board+'/');
     }
    })();
    });
  
  app.route('/api/threads/:board')
    .get(function (req, res) {
    //I can GET an array of the most recent 10 bumped 
    //threads on the board with only the most recent 3 
    //replies from /api/threads/{board}.
    //The reported and delete_passwords fields will not be sent
    let board = req.params.board;
    (async ()=> {
    let threads = await handler.getRecentThreadsWithReplies(board,10,3,["delete_password","reported"]); 
    //let returnArr = [];
    //threads.map(x=>{ delete x.delete_password;delete x.reported; returnArr.push(x);});
    res.json(threads);
    })();
    
    
    })
    .post(function (req, res) {
    let board = req.params.board;
    (async ()=> {
       //post a thread to a specific message board by passing form data text and delete_password to /api/threads/{board}
      ////   .(Recomend res.redirect to board page /b/{board}) 
     // Saved will be _id, text, created_on(date&time), bumped_on(date&time, starts same as created_on),
      //  reported(boolean), delete_password, & replies(array).
    let delete_password=req.body.delete_password;
    let text = req.body.text;
    if(!delete_password || !text )
    {
      res.status(200).send('error - delete_password or text not sent');
    }
     else{
       
        let thread = await handler.createNewThread(board,text,delete_password);
        res.redirect('/b/'+board+'/');
     }
    })();
    })
    .put(function (req, res) {
    let board = req.params.board;
     let threadId=req.body.thread_id;
     
     //I can report a reply and change it's reported value 
    //to true by sending a PUT request to /api/replies/{board} 
    //and pass along the thread_id & reply_id. (Text response will be 'success')
    
     (async ()=> {
         // data text, delete_password, & thread_id
        
        if( !threadId)
    {
      res.status(400).send('error -   threadId not sent');
    }else{
       let thread= await handler.reportThread(board,threadId);
         if(thread)
         {
           res.status(200).send('success');
         }
    }
       
       })();
  })
    .delete(function (req, res) {
  let board = req.params.board;
    (async ()=> {
     let board = req.params.board;
     let threadId=req.body.thread_id;
      let delete_password=req.body.delete_password;
      if( !threadId||!delete_password)
    {
      console.log('error in delete');
      res.status(400).send('error -  delete_password or  threadId not sent');
    }else{
     let thread= await handler.deleteThread(board,threadId,delete_password);
      //console.log(thread.n);
      //console.log('delete thread');
         if(thread.n>0)
         {
           console.log('success in delete');
               res.status(200).send('success');
         }
      else{
           console.log('delete password in delete');
                 res.status(200).send('incorrect password');

      }
    }
       
    
    })();
  });
    
    
  app.route('/api/replies/:board')
    .get(function (req, res) {
      let board = req.params.board;
      let threadId=req.query.thread_id;
     (async ()=> {
         let completeThread = await handler.getCompleteThread(board,threadId,["delete_password","reported"]);
         res.json(completeThread);
   })();
     })
    .post(function (req, res) {
     let board = req.params.board;
     let threadId=req.body.thread_id;
     let delete_password=req.body.delete_password;
     let text=req.body.text;
    
    
     (async ()=> {
         // data text, delete_password, & thread_id
    if(!delete_password || !text || !threadId)
    {
      res.status(400).send('error - delete_password or text or threadId not sent');
    }
     else{
         let reply= await handler.postNewReply(board,threadId,text,delete_password);
         let result=await handler.bumpThreadDate(board,threadId);
         res.redirect('/b/'+board+'/'+threadId);
     }
       })();
  
  })
    .put(function (req, res) {
    let board = req.params.board;
     let threadId=req.body.thread_id;
     let replyId =req.body.reply_id;
     //I can report a reply and change it's reported value 
    //to true by sending a PUT request to /api/replies/{board} 
    //and pass along the thread_id & reply_id. (Text response will be 'success')
    
     (async ()=> {
         // data text, delete_password, & thread_id
       if(!replyId || !threadId)
    {
      res.status(400).send('error -  text or threadId not sent');
    }else{
         let reply= await handler.reportReply(board,threadId,replyId);
         //res.json(completeThread);
         if(reply)
         {
           res.status(200).send('success');
         }
    }
       })();
  
     })
    .delete(function (req, res) {
  
  let board = req.params.board;
     let threadId=req.body.thread_id;
     let replyId =req.body.reply_id;
    let delete_password=req.body.delete_password;
     //I can report a reply and change it's reported value 
    //to true by sending a PUT request to /api/replies/{board} 
    //and pass along the thread_id & reply_id. (Text response will be 'success')
    
     (async ()=> {
         // data text, delete_password, & thread_id
    if(!replyId|| !threadId||!delete_password)
    {
      res.status(400).send('error -  text or replyid or threadId not sent');
    }else{
         let reply= await handler.deleteReply(board,threadId,replyId,delete_password);
         //res.json(completeThread);
        //console.log(reply);
         if(reply.n>0)
         {
           res.status(200).send('success');
         }else
         {
            res.status(200).send('incorrect password');
         }
    }
       })();
  
  });

};
