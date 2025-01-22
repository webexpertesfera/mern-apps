const { User,SocketUser, Chats,Messages } = require('../models');
const jwt = require('jsonwebtoken');
const logger = require('../config/logger');
const validator = require('./validations');
const notify = require('../config/notifications');
const GETMessage = require('../notification/newMessage');

const mongoose = require('mongoose');
const { Console } = require('console');
const responseFormat = {
  message: '',
  data: {},
};

const errorNotifyer = (socket, io, err) => {
  io.to(socket?.id).emit('error_notifyer', err);
};
exports.authConnection = async (socket, next) => {
  try {
    const token = socket?.handshake?.headers?.token;
    if (!token || token == '') {
      return next(new Error('Authentication error'));
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const id = decoded?.sub;
    let findedUser = null;
    let findedRole = null;
    const isOwner = await User.findOne({ _id: id,role:'owner' });
    if (!isOwner) {
      const isUser = await User.findOne({ _id: id,role:'user' });
      if (isUser) {
        findedUser = isUser;
        findedRole = 'user';
      }
    } else {
      findedUser = isOwner;
      findedRole = 'owner';
    }
    if (!findedUser) {
      return next(new Error('Authentication error'));
    }
    socket.userDetals = findedUser;
    socket.userRole = findedRole;
    next();
  } catch (err) {
    logger.error('Socket connection auth error:-', err);
    return next(new Error(err));
  }
};

exports.handdleConnectUser = async (socket, io) => {
  try {
    const user = socket?.userDetals;
    const role = socket?.userRole;
    const isAxist = await SocketUser.findOne({ userId: user?._id });
    if (isAxist) {
      await SocketUser.updateOne({ userId: user?._id }, { $set: { socketId: socket?.id, online: 'online', role } });
    } else {
      await SocketUser.create({ userId: user?._id, socketId: socket?.id, online: 'online', role });
    }
    const res = { ...responseFormat };
    res.message = 'Connection sucessful';
    io?.to(socket?.id).emit('connection_lisner', res);
  } catch (err) {
    logger.error('User connection failed :-', err);
    socket?.disconect();
  }
};

exports.handdleDisconnectUser = async (socket) => {
  try {
    const user = socket?.userDetals;
    const role = socket?.userRole;
    const isAxist = await SocketUser.findOne({ userId: user?._id });
    if (isAxist) {
      await SocketUser.updateOne({ userId: user?._id }, { $set: { online: 'offline' } });
    }
  } catch (err) {
    logger.error('User disconnect failed :-', err);
    socket?.disconect();
  }
};
exports.userConnection = async (socket,data,io)=>{
  try{
    const isAxist = await SocketUser.findOne({ userId:data.userId });
    io?.to(socket?.id).emit('user_listen', { message: 'User connction get  successfully', data: isAxist });
  }
  catch(err){
    logger.error('user connection failed failed :-', err);
    errorNotifyer(socket, io, err);
  }
}
exports.createChat = async (socket, data, io) => {
  try {
    const user = socket?.userDetals;
    const role = socket?.userRole;
    validator.validateChatCreateData(data);
    const { receiverId } = data;
    let findedChat = null;
    const isChatExist = await Chats.findOne({
      ownerId: role === 'user' ? receiverId : user?._id,
      userId: role === 'user' ? user?._id : receiverId,
    });
    if (!isChatExist) {
      const chatCreateData = {
        userId: role === 'user' ? user?._id : receiverId,
        ownerId: role === 'owner' ? user?._id : receiverId,
      };
      findedChat = await Chats.create(chatCreateData);
    } else {
      findedChat = isChatExist;
    }
    const pipeline = [
      {
        $match: {
          _id: new mongoose.Types.ObjectId(findedChat?._id),
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'ownerId',
        },
      },
      {
        $unwind: {
          path: '$userId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$ownerId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $addFields: {
          receiver: {
            $cond: {
              if: {
                $eq: ['ownerId._id', new mongoose.Types.ObjectId(user?._id)],
              },
              then: {
                _id: '$userId._id',
                name: '$userId.name',
                image: {
                  $cond: {
                    if: '$userId.image',
                    then: '$userId.image',
                    else: '',
                  },
                },
              },
              else: {
                _id: '$ownerId._id',
                name: '$ownerId.name',
                image: {
                  $cond: {
                    if: '$ownerId.image',
                    then: '$ownerId.image',
                    else: '',
                  },
                },
              },
            },
          },
        },
      },
      {
        $unset: 'userId',
      },
      {
        $unset: 'ownerId',
      },
    ];
    const result = await Chats.aggregate(pipeline);
    io?.to(socket?.id).emit('create_chat_listen', { message: 'Chat created successfully', data: result[0] });
  } catch (err) {
    console.log(err,"error")
    logger.error('Chat create failed failed :-', err);
    errorNotifyer(socket, io, err);
  }
};

exports.getChatList = async (socket, data, io) => {
  try {
    const user = socket?.userDetals;
    const role = socket?.userRole;
    // const pipeline = [
    //   {
    //     $match: {
    //       $or: [
    //         {
    //           userId:new mongoose.Types.ObjectId(user?._id),
    //         },
    //         {
    //           ownerId:new mongoose.Types.ObjectId(user?._id),
    //         },
    //       ],
    //     },
    //   },
    //   {
    //     $sort: { createdAt: -1 },
    //   },
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'userId',
    //       foreignField: '_id',
    //       as: 'userId',
    //     },
    //   },
    //   {
    //     $lookup: {
    //       from: 'users',
    //       localField: 'ownerId',
    //       foreignField: '_id',
    //       as: 'ownerId',
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$userId',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $unwind: {
    //       path: '$ownerId',
    //       preserveNullAndEmptyArrays: true,
    //     },
    //   },
    //   {
    //     $addFields: {
    //       receiver: {
    //         $cond: {
    //           if: {
    //             $eq: ['$ownerId._id',new mongoose.Types.ObjectId(user?._id)],
    //           },
    //           then: {
    //             _id: '$userId._id',
    //             name: '$userId.firstName',
    //             image: {
    //               $cond: {
    //                 if: '$userId.image',
    //                 then: '$userId.image',
    //                 else: '',
    //               },
    //             },
    //           },
    //           else: {
    //             _id: '$ownerId._id',
    //             name: {
    //               $concat: ['$ownerId.firstName', ' ', '$ownerId.lastName'],
    //             },
    //             image: {
    //               $cond: {
    //                 if: '$ownerId.image',
    //                 then: '$ownerId.image',
    //                 else: '',
    //               },
    //             },
    //           },
    //         },
    //       },
    //     },
    //   },
    //   {
    //     $unset: 'userId',
    //   },
    //   {
    //     $unset: 'ownerId',
    //   },
    // ];
    const pipeline = [
      {
        $match: {
          $or: [
            {
              userId: new mongoose.Types.ObjectId(user?._id),
            },
            {
              ownerId: new mongoose.Types.ObjectId(user?._id),
            },
          ],
        },
      },
      {
        $sort: { createdAt: -1 },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: '_id',
          as: 'userId',
        },
      },
      {
        $lookup: {
          from: 'users',
          localField: 'ownerId',
          foreignField: '_id',
          as: 'ownerId',
        },
      },
      {
        $unwind: {
          path: '$userId',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $unwind: {
          path: '$ownerId',
          preserveNullAndEmptyArrays: true,
        },
      },
      // Add a $lookup for the company based on ownerId
      {
        $lookup: {
          from: 'companies',
          localField: 'ownerId._id', // Match the ownerId to the company userId
          foreignField: 'userId',
          as: 'company',
        },
      },
      {
        $unwind: {
          path: '$company',
          preserveNullAndEmptyArrays: true, // Ensure company is only included if it exists
        },
      },
      {
        $addFields: {
          receiver: {
            $cond: {
              if: {
                $eq: ['$ownerId._id', new mongoose.Types.ObjectId(user?._id)],
              },
              then: {
                _id: '$userId._id',
                name: '$userId.firstName',
                role: '$userId.role',
                image: {
                  $cond: {
                    if: '$userId.image',
                    then: '$userId.image',
                    else: '',
                  },
                },
                company: '$company', // Add company if ownerId is the receiver
              },
              else: {
                _id: '$ownerId._id',
                name: {
                  $concat: ['$ownerId.firstName', ' ', '$ownerId.lastName'],
                },
                role: '$ownerId.role',
                image: {
                  $cond: {
                    if: '$ownerId.image',
                    then: '$ownerId.image',
                    else: '',
                  },
                },
              },
            },
          },
        },
      },
      {
        $unset: 'userId',
      },
      {
        $unset: 'ownerId',
      },
    ];
    const list = await Chats.aggregate(pipeline);
    io?.to(socket?.id).emit('chat_list_listen', { message: 'Chat fetched successfully', data: list });
  } catch (err) {
    logger.error('Chat list failed failed :-', err);
    errorNotifyer(socket, io, err);
  }
};

exports.sendMessageHanddler = async (socket, data, io) => {
  try {
    validator.sendMessageValidator(data);
    const user = socket?.userDetals;
    const role = socket?.userRole;
    console.log(role,"==============================role")
    const { chatId } = data;
    const isChatExist = await Chats.findOne({ _id: chatId });
    if (!isChatExist) throw 'Invalied chatId';
    const newMessage = {
      ...data,
      senderId: user?._id,
      receiverId: role === 'user' ? isChatExist?.ownerId : isChatExist?.userId,
    };
    const newMessageCreateStatus = await Messages.create(newMessage);
    const { _id, receiverId, text, media, link, createdAt } = newMessageCreateStatus;
    await Chats.updateOne({ _id: chatId }, { $set: { lastMessage: data?.text || isChatExist.lastMessage } });
    const senderMessageData = {
      chatId: newMessageCreateStatus?.chatId,
      text: data?.text,
      media: data?.media,
      link: data?.link,
      type: 'sended',
      userDetails: {
        _id: user?._id,
        name: user?.name,
        image: user?.image ?? '',
      },
      createdAt: newMessageCreateStatus?.createdAt,
      isReaded: newMessageCreateStatus?.isReaded,
    };
    io?.to(socket?.id).emit('send_message_listener', { message: 'Chat message send succesfull', data: senderMessageData });
    const receiverFinderPipeline = [
      {
        $match: {
          _id: receiverId,
        },
      },
      {
        $project: {
          name: 1,
          image: {
            $cond: {
              if: '$image',
              then: '$image',
              else: '',
            },
          },
        },
      },
      {
        $lookup: {
          from: 'socketusers',
          localField: '_id',
          foreignField: 'userId',
          as: 'socketDetails',
        },
      },
      {
        $unwind: {
          path: '$socketDetails',
          preserveNullAndEmptyArrays: false,
        },
      },
      {
        $project: {
          name: 1,
          image: 1,
          online: '$socketDetails.online',
          socketId: '$socketDetails.socketId',
        },
      },
    ];
    let detailsOfReceiver =
      role === 'user' ? await User.aggregate(receiverFinderPipeline) : await User.aggregate(receiverFinderPipeline);
    detailsOfReceiver = detailsOfReceiver[0];

    if (detailsOfReceiver && detailsOfReceiver.online === 'online') {
      console.log("==============================================heerOnline")
      let msg = `Dear ${role === "user" ? "Owner": "Seeker"} ,You got a new message from  : ${user?.firstName}`;
      const messageForReceiver = {
        _id,
        text,
        media,
        link,
        createdAt,
        chatId,
        type: 'received',
        userDetails: {
          _id: detailsOfReceiver?._id,
          name: detailsOfReceiver?.name,
          image: detailsOfReceiver?.image,
        },
      };
      notify(
        new GETMessage(detailsOfReceiver?._id,user?._id ,msg, {
          data: { chatId: isChatExist?.bookingId },
        })
      );
      io?.to(detailsOfReceiver?.socketId).emit('receve_message_listener', {
        message: 'Added new message',
        data: messageForReceiver,
      });
    }
    if(detailsOfReceiver && detailsOfReceiver.online === 'offline'){
      console.log("==============================================heerOffline")
      let msg = `Dear ${role === "user" ? "Owner": "Seeker"} ,You got a new message from  : ${user?.firstName}`;
      const messageForReceiver = {
        _id,
        text,
        media,
        link,
        createdAt,
        chatId,
        type: 'received',
        userDetails: {
          _id: detailsOfReceiver?._id,
          name: detailsOfReceiver?.name,
          image: detailsOfReceiver?.image,
        },
      };
      notify(
        new GETMessage(detailsOfReceiver?._id, user?._id ,msg, {
          data: { chatId: isChatExist?.bookingId },
        })
      );
    }
  } catch (err) {
    console.log(err,"error,jhihn")
    logger.error('Send message failed failed :-', err);
    errorNotifyer(socket, io, err);
  }
};
exports.getMessageList = async (socket, data, io) => {
  try {
    console.log("=======================working",data,"dataaa")
    validator.validateGetMessageList(data);
    const user = socket?.userDetals;
    const messages = await Messages.find({ chatId: data.chatId });
    console.log(messages)
    const formattedMessages = await Promise.all(messages.map(async (message) => {
      const type = message.senderId?.toString() === user._id?.toString() ? 'sended' : 'received';
      const userDetails = await User.findById(message.senderId);
      return {
        chatId: message.chatId,
        createdAt: message.createdAt.toISOString(),
        isReaded: message.isReaded,
        link: message.link || "",
        media: message.media || [],
        text: message.text,
        type: type,
        userDetails: {
          _id: userDetails._id,
          name: userDetails.name,
          image: userDetails.image
        }
      };
    }));
    io?.to(socket?.id).emit('message_list_listen', {
      message: 'Fetched chat message list successfully',
      data: formattedMessages
    });

  } catch (err) {
    console.log(err, "error");
    logger.error('get message failed :-', err);
    errorNotifyer(socket, io, err);
  }
};