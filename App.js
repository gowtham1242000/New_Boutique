/*const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const fileUpload          = require('express-fileupload');
const exec = require('child_process').exec;
const editJsonFile    = require('edit-json-file');
const db = require('./config/config');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const testRoutes = require('./routes/testRoutes');
const { Op } = require('sequelize');
const session = require('express-session');
//const userRoutes = require('./routes/userRoutes');

// Connect to the database
db.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Middleware
app.use(express.json());

app.use(session({
    secret: '9e880f4a-7dc5-11ec-b9b5-0200cd936042',
    resave: false,
    saveUninitialized: true
}));

// Routes
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/testing', testRoutes);


// Start the server
const PORT = process.env.PORT || 2000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
*/

const express = require('express');
const app = express();
const server = require('http').createServer(app); // Create HTTP server using Express app
const io = require('socket.io')(server); // Include socket.io
const bodyParser = require('body-parser');
const fileUpload = require('express-fileupload');
const session = require('express-session');
const db = require('./config/config');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const testRoutes = require('./routes/testRoutes');
const { Op } = require('sequelize');

// Connect to the database
db.authenticate()
  .then(() => console.log('Database connected'))
  .catch(err => console.error('Database connection error:', err));

// Middleware
app.use(express.json());
app.use(session({
    secret: '9e880f4a-7dc5-11ec-b9b5-0200cd936042',
    resave: false,
    saveUninitialized: true
}));
app.use(bodyParser.json());
app.use(fileUpload());
app.use('/admin', adminRoutes);
app.use('/user', userRoutes);
app.use('/testing', testRoutes);



io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('sendMessage', async ({ userId, productId, message }) => {
	console.log("sendmsg connected 1", message);
   	// const userMessage = new Message({ userId, productId, message, sender: 'user' });
    	//await userMessage.save();

    	io.emit('newMessage', { userId, productId, message, sender: 'user' });
	console.log("newMessage 2",message)
  });

  socket.on('sendAdminMessage', async ({ userId, productId, message }) => {
   	// const adminMessage = new Message({ userId, productId, message, sender: 'admin' });
    	//await adminMessage.save();
	console.log("sendAdminMessage",message);
    	io.emit('newMessage', { userId, productId, message, sender: 'admin' });
  });

  socket.on('disconnect', () => {
 	 console.log('Client disconnected');
  });

});




// Start the server
const PORT = process.env.PORT || 2000;
server.listen(PORT, () => console.log(`Server is running on port ${PORT}`));


