/*

Simple blog front end demo in order to learn AngularJS - You can add new posts, add comments, and like posts.

*/


console.log('start'); 

var dbx = new Dropbox({ accessToken: ACCESS_TOKEN });
var posts = [];

(function(){
  var app = angular.module('blogApp',[]);
  app.controller('BlogController', ['$http', 
      function($http) {
    var blog = this;
    blog.title = "Курсовая работа";
    blog.posts = {};
    blog.readFromCloud = function(t){
      var _tab = t;
      dbx.filesDownload({path: '/posts_1.json'})
      .then(function(response) {
        //console.log(response);
        var blob = response.fileBlob;
        var reader = new FileReader();
        reader.addEventListener("loadend", function() {
          var r = JSON.parse(reader.result);
          posts = r;
          var setLink = function(counter){
              if (counter < posts.length){
                var path = posts[counter].image_internal;
                if (!path){
                  path = posts[counter].image;
                  posts[counter].image_internal = path;
                }
                dbx.filesGetTemporaryLink({path: path})
                .then(function(res1){
                  posts[counter].image = res1.link;
                  setLink(counter+1);
                });
              } else {
                $http.get(posts[0].image).success(function(data){
                  blog.posts = posts;
                  if (typeof(_tab) === "number" && !isNaN(_tab)){
                    blog.tab = _tab;
                  }
                });
              }
          };
          setLink(0);
        });
        reader.readAsText(blob);
      }).catch(function(error) {
        console.error(error);
      }); 
    };
    
    blog.readFromCloud();
    blog.tab = 'blog';
    
    blog.selectTab = function(setTab){
      blog.tab = setTab;
      console.log(blog.tab)
    };
    
    blog.isSelected = function(checkTab){
      return blog.tab === checkTab;
    };
    
    blog.post = {};
    blog.addPost = function(){
      blog.post.createdOn = Date.now();
      blog.post.comments = [];
      blog.post.likes = 0;
      var f = document.getElementById('file_pic').files[0];
      var old_name = f.name;
      var extf = old_name.split('.').pop();
      if (extf === old_name){
        extf = "";
      } else {
        extf = "." + extf;
      }
      var file_name = "img"+(new Date()).getTime().toString()+extf;
      var file_path = '/img/'+file_name;
      var dataSave = blog.posts.slice();
      for (var i = 0; i < dataSave.length; i++){
        dataSave[i].image = dataSave[i].image_internal;
      }
      blog.posts = [];
      dbx.filesUpload({path: file_path, contents: f})
        .then(function(response) {
          blog.post.image_internal = file_path;
          dataSave.unshift(blog.post);
          dataSave[0].image = file_path;
          dbx.filesUpload({path: '/posts_1.json', contents: JSON.stringify(dataSave), mode: {".tag": "overwrite"}})
            .then(function(res) {
              blog.tab = 'blog';
              blog.post ={};
              location.reload();
            })
            .catch(function(error) {
              console.error(error);
            }); 
        })
        .catch(function(error) {
          console.error(error);
      });
    };
    
    blog.Like = function(){
      blog.posts[blog.tab].likes++;
      var dataSave = blog.posts.slice();
      for (var i = 0; i < dataSave.length; i++){
        dataSave[i].image = dataSave[i].image_internal;
      }
      blog.posts = [];
      dbx.filesUpload({path: '/posts_1.json', contents: JSON.stringify(dataSave), mode: {".tag": "overwrite"}})
        .then(function(res) {
          blog.tab = 'blog';
          blog.post ={};
          blog.readFromCloud();
        })
        .catch(function(error) {
          console.error(error);
        }); 
    };
    
    blog.deletePost = function(){
      dbx.filesDelete({path: blog.posts[blog.tab].image_internal})
        .then(function(response) {
          var dataSave = blog.posts.slice();
          for (var i = 0; i < dataSave.length; i++){
            dataSave[i].image = dataSave[i].image_internal;
          }
          blog.posts = [];
          dataSave.splice(blog.tab,1);
          dbx.filesUpload({path: '/posts_1.json', contents: JSON.stringify(dataSave), mode: {".tag": "overwrite"}})
            .then(function(res) {
              blog.tab = 'blog';
              blog.post ={};
              blog.readFromCloud();
            })
            .catch(function(error) {
              console.error(error);
            }); 
        })
        .catch(function(error) {
          console.error(error);
      });
    };

  }
  ]);
  
  app.controller('CommentController', function(){
    this.comment = {};
    this.addComment = function(blog){
      this.comment.createdOn = Date.now();
      blog.posts[blog.tab].comments.push(this.comment);
      this.comment ={};
      var t = blog.tab;
      var dataSave = blog.posts.slice();
      for (var i = 0; i < dataSave.length; i++){
        dataSave[i].image = dataSave[i].image_internal;
      }
      blog.posts = [];
      dbx.filesUpload({path: '/posts_1.json', contents: JSON.stringify(dataSave), mode: {".tag": "overwrite"}})
        .then(function(res) {
          blog.tab = 'blog';
          blog.post ={};
          blog.readFromCloud(t);
        })
        .catch(function(error) {
          console.error(error);
        }); 

    };
    
  });
  
 
})();


    
    //setInterval(function(){
     // console.log(posts);
    //},300);

