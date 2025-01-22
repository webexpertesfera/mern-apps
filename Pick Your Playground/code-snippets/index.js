const socketIo = require('socket.io');
const controllers = require('./controllers');
const connectedUsrs = {};
module.exports = (server) => {
  const io = socketIo(server, { cors: { origin: '*' } });
  io.use(controllers?.authConnection);
  io.on('connection', (socket) => {
    (async () => {
      await controllers?.handdleConnectUser(socket, io);
    })();
    socket.on('create_chat_emmiter', (data) => controllers?.createChat(socket, data, io));
    socket.on('user_connection',(data)=> controllers?.userConnection(socket,data,io))
    socket.on('chat_list_emmiter', (data) => controllers?.getChatList(socket, data, io));
    socket.on('send_message_emmiter', (data) => controllers?.sendMessageHanddler(socket, data, io));
    socket.on('message_list_emmiter', (data) => controllers?.getMessageList(socket, data, io));
    socket.on('disconnect', async () => {
      await controllers?.handdleDisconnectUser(socket);
    });
  });
};