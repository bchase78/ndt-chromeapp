/**
 * @author Benjamin M. Chase <benjamin.chase@fh-luebeck.de>
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
"use strict";

var ndtMessageLength = null;
var ndtControlSocket = null;
var testsToRun = [];

/**
 * Description starts the client.
 * @method NDTinit
 * @return
 */
function NDTinit() {
	ControlSocket();
}

/**
 * Description Opens a websocket on the control port of the ndt server
 * @method ControlSocket
 * @return
 */
function ControlSocket() {

	ndtControlSocket = new TcpClient(hostname, controlPort);
	ndtControlSocket.connect(function() {
		ndtControlSocket.addResponseListener(makeMessageResponder());
		onOpen();
	});

}

/**
 * Description - Generates and sends a NDT control message.
 * Messages arriving as an Arraybuffer will be sent untouched as an Arraybuffer e.g. client metadata for meta tests.
 * Messages arriving as anything else will be sent as a 1 byte arraybuffer e.g. testsuite request on login
 * Control messages must always be sent through the control socket
 * @return
 * @method sendNDTControlMsg
 * @param {} type type of ndt message to be sent
 * @param {} message either a string or an arraybuffer
 * @return
 */
function sendNDTControlMsg(type, message) {
	var isArrayBuffer = false;

	// If message is an Arraybuffer then bytelength must be used to determine the message length
	if (Object.prototype.toString.call(message) === '[object ArrayBuffer]') {
		isArrayBuffer = true;
		var messageLength = message.byteLength;
	}
	//otherwise it is a string and get the message length with .toString.length
	else {
		var messageLength = message.toString.length;
	}

	//length calculation uses both available bytes
	var header = new ArrayBuffer(MSG_HEADER_LENGTH);
	var x = new Uint8Array(header);
	x[0] = type;
	x[1] = (messageLength >> 8) & 0xff;
	x[2] = messageLength & 0xff;

	send(header, ndtControlSocket);

	//only send a message body that contains data.
	if (messageLength > 0) {
		if (isArrayBuffer) {
			send(message, ndtControlSocket);
		} else if (!isArrayBuffer && messageLength == '1') {
			var body = new ArrayBuffer(1);
			var x = new Uint8Array(body);
			x[0] = message;
			send(body, ndtControlSocket);
		} else {
			console.log('error. Message must be either an Arraybuffer or a number less than 256');
		}
	}

}

/**
 * Description when the control socket is opened set the client state as being connected
 * and output information for the user
 * @method onOpen
 * @param {} evt
 * @return
 */
function onOpen() {
	if (DEBUG) {
		writeToScreen("CONNECTED", 'debug');
	}
	clientState.connected = true;
	writeToScreen(displayMessages.connected + hostname, 'details');
	// Send testsuite to server
	sendNDTControlMsg(MSG_LOGIN, selectTests());
}

/**
 * Description When the connection is closed then show the results and clean up the objects
 * @method onClose
 * @param {} evt
 * @return
 */
function onControlClose() {
	clientState.complete = true;
	if (DEBUG) {
		writeToScreen("DISCONNECTED", 'debug');
	}
	showResults();
	cleanUp();
}

/**
 * Description when an incoming message is received, send it to get parsed.
 * @method onMessage
 * @param {} evt
 * @return
 */
function makeMessageResponder() {
	// The variables to be closed over
	var ndtMessageQueue = "", kicked = false;
	// The callback, closed over the queue and state variables.
	return function (data) {
		var msgLength, content, header;
		ndtMessageQueue += data;
		if (!kicked) {
			if (ndtMessageQueue.length >= KICK_OFF.length && ndtMessageQueue.substr(0, KICK_OFF.length) === KICK_OFF) {
				kicked = true;
				ndtMessageQueue = ndtMessageQueue.slice(KICK_OFF.length);
			}
			if (!kicked) { return; }
		}
		// Process every message contained in the ndtMessageQueue
		while (true) {
			if (ndtMessageQueue.length < 3) { return; }
			msgLength = ((ndtMessageQueue.charCodeAt(1) << 8) | ndtMessageQueue.charCodeAt(2));
			if (ndtMessageQueue.length < msgLength + 3) {
                                return;
                        }
                        header = ndtMessageQueue.substr(0, 3)
			content = ndtMessageQueue.substr(3, msgLength);
			ndtMessageQueue = ndtMessageQueue.slice(msgLength + 3);
			readNDTControlMsg(header, content);
		}
	};
}

/**
 * Description Output debug information on errors.
 * @method onError
 * @param {} evt
 * @return
 */
function onError(evt) {
	if (DEBUG) {
		writeToScreen('<span style="color: red;">ERROR:' + evt.data + '</span>', 'debug');
	}
}

/**
 * Description Parse the incoming messages and decide what need to be done with them
 * @method readNDTControlMsg
 * @param {} message
 * @return
 */
function readNDTControlMsg(header, content) {
        // If there is currently a test that needs to be run, pass the message off to the function in charge of running that test.
        if (testsToRun.length) {
                if (testsToRun[0](header, content)) {
                        testsToRun.shift();
                }
                return;
        }
        // No test is currently being run.
	switch (header.charCodeAt(0)) {
	case COMM_FAILURE:
		if (DEBUG) {
			writeToScreen('<span style="color: blue;">RESPONSE: COMM_FAILURE</span>', 'debug');
		}
		break;
	case SRV_QUEUE:
		clientState.waitingForMessage = true;
		if (DEBUG) {
			writeToScreen('<span style="color: blue;">RESPONSE: SRV_QUEUE</span>', 'debug');
		}
		break;
	case MSG_LOGIN:
		if (DEBUG) {
			writeToScreen('<span style="color: blue;">RESPONSE: MSG_LOGIN</span>', 'debug');
		}
		//get the server Version. look for a "v" in the message for the version
		if ((content.indexOf("v")) != -1) {
			clientResults.serverVersion = content;
			// if client version is too old close connection
			if (clientResults.serverVersion < LAST_VALID_SERVER_VERSION) {
				clientState.versionCompatible = false;
				// ndtControlSocket.disconnect(ndtControlSocket.socketId);
				writeToScreen('<span style="color: red;">Server is too old for this client. Closing connection.</span>', 'details');
				break;
			}
			if (clientResults.serverVersion == CLIENT_VER) {
				clientState.versionCompatible = true;
				writeToScreen('<span style="color: blue;">Client and server have the same version.</span>', 'details');
			}

			if (clientResults.serverVersion > LAST_VALID_SERVER_VERSION && clientResults.serverVersion < CLIENT_VER || clientResults.serverVersion > CLIENT_VER) {
				clientState.versionCompatible = true;
				writeToScreen('<span style="color: orange;">Client and server do not have the same version, but should be compatible.</span>', 'details');
			}

			// Server version
			writeToScreen('<span style="color: blue;">Server Version:' + clientResults.serverVersion + '</span>', 'details');
		} else {
                        var tests = content.split(' ');
                        for (var i = 0; i < tests.length; i++) {
                                if (tests[i] === '') {
                                        // ignore extra spaces between tests
                                } else if (parseInt(tests[i]) == TESTTYPE_S2C) {
                                        if (DEBUG) {
			                        writeToScreen('<span style="color: blue;">Server will run run S2C test</span>', 'debug');
                                        }
                                        testsToRun.push(processS2CMessage);
                                } else if (parseInt(tests[i]) == TESTTYPE_C2S) {
                                        if (DEBUG) {
			                        writeToScreen('<span style="color: blue;">Server will run run C2S test</span>', 'debug');
                                        }
                                        testsToRun.push(processC2SMessage);
                                } else if (parseInt(tests[i]) == TESTTYPE_META) {
                                        if (DEBUG) {
			                        writeToScreen('<span style="color: blue;">Server will run run META test</span>', 'debug');
                                        }
                                        testsToRun.push(processMetaMessage);
                                } else {
                                        if (DEBUG) {
			                        writeToScreen('<span style="color: blue;">Unknown test type received: ' + parseInt(tests[i]) + '</span>', 'debug');
                                        }
                                }
                        }
                }
		break;
	case TEST_MSG:
		getResults(content);
		if (DEBUG) {
			writeToScreen('<span style="color: blue;">RESPONSE: TEST_MSG</span>', 'debug');
		}
		// client queue position
		if (DEBUG) {
			writeToScreen('<span style="color: blue;">Client Queue:' + content + '</span>', 'debug');
		}

		if (content == SRV_QUEUE_SERVER_FAULT) {
			// Server Fault
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: Server Fault</span>', 'debug');
			}
			writeToScreen(displayMessages.serverFault, 'details');
			//Close socket on fault
			// ndtControlSocket.disconnect(ndtControlSocket.socketId);
			break;

		} else if (content == SRV_QUEUE_SERVER_BUSY) {
			// Server busy/fault
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: Server busy or server fault</span>', 'debug');
			}
			writeToScreen(displayMessages.serverBusy, 'details');
			//Close socket on fault
			// ndtControlSocket.disconnect(ndtControlSocket.socketId);
			break;

		} else if (content == SRV_QUEUE_HEARTBEAT) {
			//Test_Status check
			// Signalize client is waiting with empty MSG_WAITING packet
			sendNDTControlMsg(MSG_WAITING, "");
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: Client responded waiting...</span>', 'debug');
			}

		} else if (content != SRV_QUEUE_TEST_STARTS_NOW) {

			clientState.queued = true;
			clientState.timeTillStart = content;
			writeToScreen('Client queued. Test should start in approximately ' + clientState.timeTillStart + ' min.', 'details');
		} else {
			// Client starting tests
			clientState.queued = false;
			clientState.timeTillStart = null;
		}

		//After message is recieved set status back to false
		clientState.waitingForMessage = false;
		break;
	case MSG_ERROR:
		if (DEBUG) {
			writeToScreen('<span style="color: blue;">RESPONSE: MSG_ERROR</span>', 'debug');
		}
		break;
	case MSG_RESULTS:
		getResults(content);
		if (DEBUG) {
			writeToScreen('<span style="color: blue;">RESPONSE: MSG_RESULTS</span>', 'debug');
		}
		break;
	case MSG_LOGOUT:
		if (DEBUG) {
			writeToScreen('<span style="color: blue;">RESPONSE: MSG_LOGOUT</span>', 'debug');
		}
		//Testing complete. Close Connection and show results.
		onControlClose();
		break;
	case MSG_WAITING:
		if (DEBUG) {
			writeToScreen('<span style="color: blue;">RESPONSE: MSG_WAITING</span>', 'debug');
		}
		break;
	case MSG_EXTENDED_LOGIN:
		if (DEBUG) {
			writeToScreen('<span style="color: blue;">RESPONSE: MSG_EXTENDED_LOGIN</span>', 'debug');
		}
		break;
	default:
                if (DEBUG) {
                        writeToScreen('<span style="color: red;">UNKNOWN MESSAGE CODE: ' + header.charCodeAt(0) + '</span>', 'debug');
                }
		break;
	}
}

/**
 * Description Send messages through the requested websocket when the socket is in a ready state
 * @method send
 * @param {} message
 * @param {} socket
 * @return
 */
function send(message, socket) {

	// only send if socket is ready
	waitForSocketConnection(socket, function() {
		socket.sendMessage(message);
	});
}

/**
 * Description Make the send function wait until the connection is ready...
 * @method waitForSocketConnection
 * @param {} socket
 * @param {} callback
 * @return
 */
function waitForSocketConnection(socket, callback) {
	setTimeout(function() {
		//TODO: Discard messges if socket is closed. Optimize code, so the client doesn't wait too long!
		//if client has ended tests, discard all undelivered messages
		if (clientState.complete == true) {
			return;
		}
		if (socket.isConnected === true) {
			if (callback != null) {
				callback();
			}
			return;
		} else {
			waitForSocketConnection(socket, callback);
		}

	}, 5);
	// wait 5 milisecond for the connection...
}

/**
 * Description Clean up the objects for reuse.
 * @method cleanUp
 * @return
 */
function cleanUp() {
	clientState.resetClient();
	clientResults.resetClient();
}
