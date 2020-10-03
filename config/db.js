if(process.env.NODE_ENV == "production"){
    module.exports = {mongoURI: "mongodb+srv://root:455465@blogapp-ff3r6.mongodb.net/test?retryWrites=true&w=majority"}
} else {
    module.exports = {mongoURI: 'mongodb://localhost/blog_app'}
}