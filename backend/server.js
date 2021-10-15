if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config();
}

var app = require('express')()
var http = require('http').Server(app)

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;

const twilio = require('twilio')(accountSid, authToken);

var io = require('socket.io')(http, {
	cors: {
		origins: '*:*',
	},
})

var cors = require('cors')

app.options('*', cors())

app.get('/', (req, res) => {
	res.send('hack the planet')
})

const connectionRequests = {}

const mappedUserIds = {}

io.on('connection', function (socket) {

	const socketId = socket.id

	mappedUserIds[socketId] = socket.handshake.query.userID

	socket.on('disconnect', function () {
		delete connectionRequests[socketId]
		delete mappedUserIds[socketId]
	})

	//socket.id = socket.handshake.query.userID
	socket.on('join', function (room) {
		socket.join(room)
		socket.emit('joined', room)
	})

	socket.on('connectionRequest', async (data) => {

		console.log('connectionRequest', data)

		if (connectionRequests[data.id] && connectionRequests[data.id][socketId]) {
			const timePassed = Date.now() - connectionRequests[data.id][socketId]
			if (timePassed > 2000) {
				delete connectionRequests[data.id][socketId]
			} else {
				return
			}
		}

		if (!connectionRequests[socketId]) {
			connectionRequests[socketId] = {
				[data.id]: Date.now(),
			}
		} else {
			connectionRequests[socketId][data.id] = Date.now()
		}

		try {
			const token = await twilio.tokens.create();

			console.log('sending message to peer', data.id, data.userId)
			io.to(data.id).emit('peer', {
				peerId: socketId,
				initiator: false,
				targetId: data.userId,
				iceServerConfig: token.iceServers,
			})
			socket.emit('peer', {
				peerId: data.id,
				initiator: true,
				targetId: data.targetId,
				iceServerConfig: token.iceServers,
			});
		} catch (error) {
			console.error(error)
		}

	})

	socket.on('signal', function(data) {

		try {
			io.to(data.peerId).emit('signal', {
				signal: data.signal,
				peerId: socketId,
			})
		} catch (error) {
			console.error(error)
		}

	});

})

var port = process.env.PORT || 8080
http.listen(port, function () {
	console.log('listening on *:' + port)
})
