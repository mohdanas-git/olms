const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const path = require('path');
const session = require("express-session");
const bcrypt = require("bcrypt");
const { log } = require('console');
const app = express();
const port = process.env.PORT || 2000;

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/newdata', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


// Middleware to parse JSON and URL-encoded data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Set the view engine to EJS
app.set('view engine', 'ejs');

// Set up multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage: storage });

// Define a schema
const userSchema = new mongoose.Schema({
  name: { type: String, required: true},
  mob: { type: String, required: true},
  email: { type: String, required: true, unique: true },
  pwd: { type: String,required: true},
});

//creating model for user
const User = mongoose.model('User', userSchema);


//calling the page for getting the inputs
app.get('/usersignup', (req, res) => {
  res.render('usersignup');
});


// Create a new user////
app.post('/submit', async (req, res) => {
  try {
    const password = req.body.pwd;
  const confirmpassword = req.body.cnfpwd;
  if(password === confirmpassword){
    const { name, mob, email, pwd } = req.body;
    const hashedPwd = await bcrypt.hash(pwd, 10);
    const user = new User({ name, mob, email,  pwd:hashedPwd});
    await user.save();//user is the collection name, but in pularl form
    res.render('user-added-mssg');
  }
  else{
    res.send("Password Didn't Match");
  }
}
 catch (error) {
    res.status(400).send(error);
  
  } 
});

//creating the session
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));


// logining into the registered form
app.post('/login', async (req, res) => {
  try {
    const { email, pwd } = req.body;
    const user = await User.findOne({ email });
    if (user && await bcrypt.compare(pwd, user.pwd)) {
      req.session.userId = user._id;
      res.redirect('/user-dashboard');
    } else {
      res.status(400).send('Invalid email or password');
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//session destroyed or can say User logout
app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      return res.status(500).send(err);
    }
    res.redirect('/');
  });
});

app.get('/user-dashboard', async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).render('userlogin');
    }
    const users = await User.find();
    const abc = req.session.userId;
    const abcd = await User.findById(abc);
    res.render('user-dashboard', { users, abcd });
  } catch (error) {
    res.status(500).send(error);
  }
});

//update user info
app.get('/update-profile/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    res.render('update-profile', { user });
  } catch (error) {
    res.status(500).send(error);
  }

});


// Update author
app.post('/update-profile/:id', async (req, res) => {
  try {
    const { name, mob } = req.body;
    const user = await User.findById(req.params.id);
    user.name = name;
    user.mob = mob;
    await user.save();
    res.redirect('/user-dashboard');
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/user-profile', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).render('userlogin');
  }
  const users = await User.find();
  const lmn = req.session.userId;
  const xyz = await User.findById(lmn);
  res.render('user-profile',{xyz});
});

app.get('/change-pass/:id', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).render('userlogin');
  }
  const users = await User.find();
  const lmn = req.session.userId;
  const xyz = await User.findById(lmn);
  console.log(xyz.pwd);
  res.render('user-profile',{xyz});
});

//can see our inputed data or Display users
app.get('/registered-students', async (req, res) => {
  try {
    const users = await User.find();
    res.render('registered-students', { users });
  } catch (error) {
    res.status(500).send(error);
  }
});




// Define a schema
const addbookSchema = new mongoose.Schema({
  bookname: { type: String, required: true },
  bookcategory: { type: String, required: true},
  author: { type: String, required: true},
  isbnnum: { type: String, required: true},
  price: { type: String, required: true},
  bookpicUrl: { type: String } // field for image URL
});///

//model
const Addbook = mongoose.model('Addbook', addbookSchema);


// Serve the form
app.get('/add-book', async (req, res) => {
  const cat = await Addcategory.find();
  const author = await Addauthor.find();
  res.render('add-book',{cat,author});
});

//Create a new book////
app.post('/addbook',upload.single('bookpic'), async (req, res) => {
  try {
    const { bookname, bookcategory, author, isbnnum, price } = req.body;
    const bookpicUrl = req.file ? '/uploads/' + req.file.filename : '';
    const addbook = new Addbook({ bookname, bookcategory, author, isbnnum, price, bookpicUrl });
    await addbook.save();
    res.render('add-book-mssg');
  } catch (error) {
    res.status(400).send(error);
  }
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Display Books
app.get('/manage-book', async (req, res) => {
  try {
    const books = await Addbook.find();
    res.render('manage-book', { books });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.get('/admin-listed-book', async (req, res) => {
  try {
    const books = await Addbook.find();
    res.render('admin-listed-book', { books });
  } catch (error) {
    res.status(500).send(error);
  }
});


app.get('/listed-book', async (req, res) => {
  try {
    const books = await Addbook.find();
    res.render('listed-book', { books });
  } catch (error) {
    res.status(500).send(error);
  }
});

// app.get('/',async(req,res)=>{
//   try{
//     const books = await Addbook.find();
//     res.render('index',{books});
//   }
//   catch(error){
//     res.send(error)
//   }
// });
//update book info
app.get('/update-book/:id', async (req, res) => {
  try {
    const book = await Addbook.findById(req.params.id);
    res.render('update-book', { book });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Update book information
app.post('/update-book/:id', upload.single('bookpic'), async (req, res) => {
  try {
    const { bookname, bookcategory, author, isbnnum, price } = req.body;
    const book = await Addbook.findById(req.params.id);
    
    book.bookname = bookname;
    book.bookcategory = bookcategory;
    book.author = author;
    book.isbnnum = isbnnum;
    book.price = price;
    
    if (req.file) {
      book.bookpicUrl = '/uploads/' + req.file.filename;
    }
    
    await book.save();
    res.redirect('/manage-book');
  } catch (error) {
    res.status(500).send(error);
  }
});


//delete book
app.post('/delete-book/:id', async(req, res) => {
  try{
    await Addbook.findByIdAndDelete(req.params.id);
    res.redirect('/manage-book');
  }
  catch(error){
    res.status(500).send(error);
  }
});
app.post('/delete-user-article/:id', async(req, res) => {
  try{
    await Userarticle.findByIdAndDelete(req.params.id);
    res.redirect('/user-article');
  }
  catch(error){
    res.status(500).send(error);
  }
});

//delete mssg
app.post('/delete-mssg/:id', async(req, res) => {
  try{
    await Usersendmail.findByIdAndDelete(req.params.id);
    res.redirect('/admin-inbox');
  }
  catch(error){
    res.status(500).send(error);
  }
});





//update author info
app.get('/update-author/:id', async (req, res) => {
  try {
    const author = await Addauthor.findById(req.params.id);
    res.render('update-author', { author });
  } catch (error) {
    res.status(500).send(error);
  }
});


// Update author
app.post('/update-author/:id', async (req, res) => {
  try {
    const { authorname } = req.body;
    const author = await Addauthor.findById(req.params.id);
    author.authorname = authorname;
    await author.save();
    res.redirect('/author-listed');
  } catch (error) {
    res.status(400).send(error);
  }
});


//delete Author
app.post('/delete-author/:id', async(req, res) => {
  try{
    await Addauthor.findByIdAndDelete(req.params.id);
    res.redirect('/author-listed');
  }
  catch(error){
    res.status(500).send(error);
  }
});



//update category info
app.get('/update-category/:id', async (req, res) => {
  try {
    const category = await Addcategory.findById(req.params.id);
    res.render('update-category', { category });
  } catch (error) {
    res.status(500).send(error);
  }
});


// Update author
app.post('/update-category/:id', async (req, res) => {
  try {
    const { categoryname } = req.body;
    const category = await Addcategory.findById(req.params.id);
    category.categoryname = categoryname;
    await category.save();
    res.redirect('/listed-categories');
  } catch (error) {
    res.status(400).send(error);
  }
});
//delete Author
app.post('/delete-category/:id', async(req, res) => {
  try{
    await Addcategory.findByIdAndDelete(req.params.id);
    res.redirect('/listed-categories');
  }
  catch(error){
    res.status(500).send(error);
  }
});

//update category info
app.get('/update-issue-book/:id', async (req, res) => {
  try {
    const issue = await Issuebook.findById(req.params.id);
    res.render('update-issue-book', { issue });
  } catch (error) {
    res.status(500).send(error);
  }
});


// Update author
app.post('/update-issue-book/:id', async (req, res) => {
  try {
    const { studentid, bookname, isbnnumber } = req.body;
    const issue = await Issuebook.findById(req.params.id);
    issue.studentid = studentid;
    issue.bookname = bookname;
    issue.isbnnumber = isbnnumber;
    await issue.save();
    res.redirect('/managed-issued-book');
  } catch (error) {
    res.status(400).send(error);
  }
});

//delete Author
app.post('/delete-issue-book/:id', async(req, res) => {
  try{
    await Issuebook.findByIdAndDelete(req.params.id);
    res.redirect('/managed-issued-book');
  }
  catch(error){
    res.status(500).send(error);
  }
});

// Define a schema
const issuebookSchema = new mongoose.Schema({
  studentid: { type: String, required: true },
  bookname: { type: String, required: true},
  isbnnumber: { type: String, required: true, unique: true},
});///

// Define admin schema
const adminsignupSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  pwd: { type: String, required: true},
});///




// Create a model
const Issuebook = mongoose.model('Issuebook', issuebookSchema);///
const Adminsignup  = mongoose.model('Adminsignup', adminsignupSchema);


app.get('/issue-book', (req, res) => {
  res.render('issue-book');
});

app.get('/admin-signup', (req, res) => {
  res.render('admin-signup');
});

app.post('/admin-signup', async (req, res) => {
  try {
    const password = req.body.pwd;
  const confirmpassword = req.body.cnfpwd;
  if(password === confirmpassword){
    const {email, pwd } = req.body;
    const hashedPwd = await bcrypt.hash(pwd, 10);
    const admin = new Adminsignup({ email,  pwd:hashedPwd});
    await admin.save();
    res.send('user-added-mssg');
  }
  else{
    res.send("Password Donot Match");
  }
}
 catch (error) {
    res.status(400).send(error);
  
  } 
});


// Admin login
app.post('/admin-login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const admin = await Adminsignup.findOne({ email });
    if (admin && await bcrypt.compare(password, admin.pwd)) {
      req.session.adminId = admin._id;
      res.redirect('/admin-dashboard');
    } else {
      res.status(400).send('Invalid email or password'); 
    }
  } catch (error) {
    res.status(500).send(error);
  }
});

//admin-change-password
const adminchngpassSchema = new mongoose.Schema({
  newpass: { type: String, required: true },
  cnfmpwd: { type: String, required: true},
});
const Adminchngpass  = mongoose.model('Adminchngpass', adminchngpassSchema);

app.get('/admin-change-password', (req, res) => {
  res.render('admin-change-password', { title: 'admin-change-password', content: 'Welcome to the admin-change-password Page' });
});

app.post('/update-admin-pass/:id %>', async (req, res) => {
  try {
    const password = req.body.newpass;
  const confirmpassword = req.body.cnfmpwd;
  if(password === confirmpassword){
    const {newpass } = req.body;
    const hashedPwd = await bcrypt.hash(pwd, 10);
    pwd.admin = newpass;
    const admin = new Adminchngpass({newpass:hashedPwd});
    await admin.save();
    res.render('admin-pass-change-mssg');
  }
  else{
    res.send("Password Donot Match");
  }
}
 catch (error) {
    res.status(400).send(error);
  } 
});

app.get('/admin-dashboard', async (req, res) => {
  try{
    if(!req.session.adminId){
    return res.render('admin');
      }
      res.render('admin-dashboard');
  }
catch(error){
  res.send(error);
}
});

app.post('/issuebook', async (req, res) => {
  try {
    const { studentid, bookname, isbnnumber, } = req.body;
    const issue = new Issuebook ({ studentid, bookname, isbnnumber });
    await issue.save();
    res.render('issue-book-mssg');
  } catch (error) {
    res.status(400).send(error);
  }
});


// Display users
app.get('/managed-issued-book', async (req, res) => {
  try {
    const issuebook = await Issuebook.find();
    res.render('managed-issued-book', { issuebook }); 
  } catch (error) {
    res.status(500).send(error);
  }
});



// Define a schema
const adminarticleSchema = new mongoose.Schema({
  articleimg: { type: String, required: true },
  articlemssg: { type: String, required: true,}
});

// Create a model
const Adminarticle = mongoose.model('Adminarticle', adminarticleSchema);

// Serve the form
app.get('/admin-issue-article', async (req, res) => {
  res.render('admin-issue-article');
});

// Create article
app.post('/publish-article', upload.single('articleimg'), async (req, res) => {
  try {
    const { articlemssg } = req.body;
    const articleimg = req.file ? '/uploads/' + req.file.filename : '';
    const article = new Adminarticle({  articleimg, articlemssg });
    await article.save();
    res.render('article-added-mssg');
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/', async (req, res) => {
  try {
    const admart = await Adminarticle.find();
    const admres = await Adminresource.find();
    const admbooks = await Addbook.find();
    const userart = await Userarticle.find();
    res.render('index',{admart, admres, admbooks, userart});
  } catch (error) {
    res.status(500).send(error);
  }
});


//define a user article schema
const userarticleSchema = new mongoose.Schema({
  userarticleimg: { type: String, required: true },
  userarticlemssg: { type: String, required: true,}
});

// Create a model
const Userarticle = mongoose.model('Userarticle', userarticleSchema);

// Serve the form
app.get('/user-issue-article', async (req, res) => {
  res.render('user-issue-article');
});

// Create article
app.post('/user-publish-article', upload.single('userarticleimg'), async (req, res) => {
  try {
    const { userarticlemssg } = req.body;
    const userarticleimg = req.file ? '/uploads/' + req.file.filename : '';
    const userarticles = new Userarticle({  userarticleimg, userarticlemssg });
    await userarticles.save();
    res.render('user-share-article-mssg');
  } catch (error) {
    res.status(400).send(error);
  }
});
//
app.get('/user-article', async (req, res) => {
  try {
    const userarticles = await Userarticle.find();
    res.render('user-article', { userarticles });
  } catch (error) {
    res.status(500).send(error);
  }
});


//define a user resources schema
const userresourceSchema = new mongoose.Schema({
  userresUrl: { type: String, required: true,},
  userresdet: { type: String, required: true,}
});

// Create a model
const Userresource = mongoose.model('Userresource', userresourceSchema);

// Serve the form
app.get('/user-share-resources', async (req, res) => {
  res.render('user-share-resources');
});

// Create article
app.post('/user-publish-resource', upload.single('userresUrl'), async (req, res) => {
  try {
    const {userresdet} = req.body;
    const userresUrl = req.file ? '/uploads/' + req.file.filename : '';
    const userresource = new Userresource({ userresUrl, userresdet });
    await userresource.save();
    res.render('user-share-resource-mssg');
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/user-resource', async (req, res) => {
  try {
    const userresource = await Userresource.find();
    res.render('user-resource', { userresource });
  } catch (error) {
    res.status(500).send(error);
  }
});

app.post('/delete-user-resource/:id', async(req, res) => {
  try{
    await Userresource.findByIdAndDelete(req.params.id);
    res.redirect('/user-resource');
  }
  catch(error){
    res.status(500).send(error);
  }
});


//define a admin resources schema
const adminresourceSchema = new mongoose.Schema({
  adminresUrl: { type: String, required: true,},
  adminresdet: { type: String, required: true,}
});

// Create a model
const Adminresource = mongoose.model('Adminresource', adminresourceSchema);

// Serve the form
app.get('/admin-share-resources', async (req, res) => {
  res.render('admin-share-resources');
});

// Create article
app.post('/admin-publish-resource', upload.single('adminresUrl'), async (req, res) => {
  try {
    const {adminresdet} = req.body;
    const adminresUrl = req.file ? '/uploads/' + req.file.filename : '';
    const adminresource = new Adminresource({ adminresUrl, adminresdet });
    await adminresource.save();
    res.render('admin-share-resource-mssg');
  } catch (error) {
    res.status(400).send(error);
  }
});

// Define add author schema
const addauthorSchema = new mongoose.Schema({
  authorname: { type: String, required: true },
});

const Addauthor  = mongoose.model('Addauthor', addauthorSchema);

app.get('/add-author', async (req, res) => {
  res.render('add-author');
});

app.post('/add-author', async (req, res) => {
  try {
    const { authorname } = req.body;
    const author = new Addauthor ({ authorname });
    await author.save();
    res.render('add-author-mssg');
  } catch (error) {
    res.status(400).send(error);
  }
});

//displaying the author
app.get('/author-listed', async (req, res) => {
  try {
    const addauthor = await Addauthor.find();
    res.render('author-listed', { addauthor }); 
  } catch (error) {
    res.status(500).send(error);
  }
});


// Define add author schema
const addcatgorySchema = new mongoose.Schema({
  categoryname: { type: String, required: true, unique: true },
});

const Addcategory  = mongoose.model('Addcategory', addcatgorySchema);

app.get('/add-category', async (req, res) => {
  res.render('add-category');
});


app.post('/add-category', async (req, res) => {
  try {
    const { categoryname } = req.body;
    const category = new Addcategory ({ categoryname });
    await category.save();
    res.render('add-category-mssg');
  } catch (error) {
    res.status(400).send(error);
  }
});

//displaying the author
app.get('/listed-categories', async (req, res) => {
  try {
    const addcategory = await Addcategory.find();
    res.render('listed-categories', { addcategory }); 
  } catch (error) {
    res.status(500).send(error);
  }
});

//--------------------------user send mail--------------
const usersendmailSchema = new mongoose.Schema({
  email: { type: String},
  mssgbox: { type: String, required: true },
});

const Usersendmail  = mongoose.model('Usersendmail', usersendmailSchema);

app.get('/user-send-mail', (req, res) => {
  res.render('user-send-mail');
});


app.post('/send-mail', async (req, res) => {
  try {
    const { email, mssgbox } = req.body;
    const usersendmail = new Usersendmail ({ email, mssgbox });
    await usersendmail.save();
    res.render('user-send-mail-mssg');
  } catch (error){
    res.status(400).send(error);
  }
});

app.get('/admin-inbox', async (req, res) => {
  try {
    const usersendmail = await Usersendmail.find();
    res.render('admin-inbox', { usersendmail });
  } catch (error) {
    res.status(500).send(error);
  }
});

//-------admin-send-mail--------
const adminsendmailSchema = new mongoose.Schema({
  username: { type: String, required: true},
  mssgbox: { type: String, required: true },
});

const Adminsendmail  = mongoose.model('Adminsendmail', adminsendmailSchema);

app.get('/admin-send-mail', async (req, res) => {
  const user = await User.find();
  res.render('admin-send-mail',{user});
});

app.post('/admin-send-mail', async (req, res) => {
  try {
    const { username, mssgbox } = req.body;
    const adminsendmail = new Adminsendmail ({ username, mssgbox });
    await adminsendmail.save();
    res.render('admin-send-mail-mssg');
  } catch (error) {
    res.status(400).send(error);
  }
});

app.get('/user-inbox', async (req, res) => {
  try {
    const adminsendmail = await Adminsendmail.find();
    res.render('user-inbox', { adminsendmail }); 
  } catch (error) {
    res.status(500).send(error);
  }
});

//quizzzz
const quizSchema = new mongoose.Schema({
  quizURL: { type: String, required: true}
});

const Quiz = mongoose.model('Quiz', quizSchema );

app.get('/share-quiz', async (req, res) => {
  res.render('share-quiz');
});

app.post('/share-quiz', async (req, res) => {
  try {
    const { quizURL } = req.body;
    const quiz = new Quiz({ quizURL });
    await quiz.save();
    res.render('add-quiz-mssg');
  } catch (error) {
    res.status(400).send(error);
  }
});

//used to display data to admin quizess page
app.get('/admin-quizess', async (req, res) => {
  try {
    const quizess = await Quiz.findOne();   //used to send data
    res.render('admin-quizess', { quizess });
  } catch (error) {
    res.status(500).send(error);
  }
});

//displaying the quiz in user dashboard
app.get('/user-quiz', async (req, res) => {
  try {
    const usrquiz = await Quiz.findOne();
    res.render('user-quiz', { usrquiz });
  } catch (error) {
    res.status(500).send(error);
  }
});

// Serve static files (CSS, JS, images, etc.)
app.use(express.static('assets'));

// Define routes

app.get('/add-author', (req, res) => {
  res.render('add-author', { title: 'add-author', content: 'Welcome to the add-author Page' });
});


app.get('/author-listed', (req, res) => {
  res.render('author-listed', { title: 'author-listed', content: 'Welcome to the author-listed Page' });
});

app.get('/add-category', (req, res) => {
  res.render('add-category', { title: 'add-category', content: 'Welcome to the add-category Page' });
});

app.get('/admin-ask-ai', (req, res) => {
  res.render('admin-ask-ai', { title: 'admin-ask-ai', content: 'Welcome to the admin-ask-ai Page' });
});


app.get('/admin-chng-pwd', (req, res) => {
  res.render('admin-chng-pwd', { title: 'admin-chng-pwd', content: 'Welcome to the admin-change-password Page' });
});

app.get('/admin-header', (req, res) => {
  res.render('admin-header', { title: 'admin-header', content: 'Welcome to the admin-header Page' });
});

app.get('/admin-forget-password', (req, res) => {
  res.render('admin-forget-password', { title: 'admin-forget-password' });
});


app.get('/admin-send-mail', (req, res) => {
  res.render('admin-send-mail', { title: 'admin-send-mail', content: 'Welcome to the admin-send-mail Page' });
});

app.get('/admin-sidemenu', (req, res) => {
  res.render('admin-sidemenu', { title: 'admin-sidemenu', content: 'Welcome to the admin-sidemenu Page' });
});

app.get('/admin-quizess', (req, res) => {
  res.render('admin-quizess', { title: 'admin-quizess', content: 'Welcome to the admin-quizess Page' });
});

app.get('/admin-make-quizess', (req, res) => {
  res.render('admin-make-quizess', { title: 'admin-make-quizess', content: 'Welcome to the admin-quizess Page' });
});


app.get('/admin', (req, res) => {
  res.render('admin', { title: 'admin', content: 'Welcome to the admin Page' });
});


app.get('/ask-ai', (req, res) => {
  res.render('ask-ai', { title: 'ask-ai', content: 'Welcome to the ask-ai Page' });
});

app.get('/author-listed', (req, res) => {
  res.render('author-listed', { title: 'author-listed', content: 'Welcome to the author-listed Page' });
});

app.get('/book-not-returned', (req, res) => {
  res.render('book-not-returned', { title: 'book-not-returned', content: 'Welcome to the book-not-returned Page' });
});

app.get('/change-password', (req, res) => {
  res.render('change-password', { title: 'change-password', content: 'Welcome to the change-password Page' });
});

// app.get('/issue-book', (req, res) => {
//   res.render('issue-book', { title: 'issue-book', content: 'Welcome to the issue-book Page' });
// });

app.get('/issued-books', (req, res) => {
  res.render('issued-books', { title: 'issued-books', content: 'Welcome to the issued-books Page' });
});


app.get('/listed-book', (req, res) => {
  res.render('listed-book', { title: 'listed-book', content: 'Welcome to the listed-book Page' });
});

app.get('/listed-categories', (req, res) => {
  res.render('listed-categories', { title: 'listed-categories', content: 'Welcome to the listed-categories Page' });
});

app.get('/quizess', (req, res) => {
  res.render('quizess', { title: 'quizess', content: 'Welcome to the quizess Page' });
});

app.get('/managed-issued-book', (req, res) => {
  res.render('managed-issued-book', { title: 'managed-issued-book', content: 'Welcome to the managed-issued-book Page' });
});

app.get('/sidemenu', (req, res) => {
  res.render('sidemenu', { title: 'sidemenu', content: 'Welcome to the sidemenu' });
});


app.get('/user-inbox', (req, res) => {
  res.render('user-inbox', { title: 'user-inbox', content: 'Welcome to the user-inbox Page' });
});

app.get('/userlogin', (req, res) => {
  res.render('userlogin', { title: 'userlogin', content: 'Welcome to the userlogin Page' });
});

app.get('/share-quiz', (req, res) => {
  res.render('share-quiz', { title: 'share-quiz', content: 'Welcome to the usersignup Page' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});