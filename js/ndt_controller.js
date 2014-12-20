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
var alreadySent = false;


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

		ndtControlSocket.addResponseListener(function(data) {
			// onMessage(data);
			readNDTControlMsg(data);
		});

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
			//error. Message must be either an Arraybuffer or a number less than 256
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
function onMessage(data) {
	readNDTControlMsg(arrayBufferToString(data));
	// if (DEBUG) {
	// writeToScreen('<span style="color: blue;">onMessage RESPONSE: ' + arrayBufferToString(evt.data) + '</span>', 'debug');
	// }
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
function readNDTControlMsg(message) {

	// In case of Old Client Kick Off message: do nothing
	if (message == KICK_OFF) {
		// remove kick off message from data stream
		var messageContent = extractNDTMessageBody(message, KICK_OFF.length);
		message = messageContent[0];
		return;
	}

	//parse messages until the end
	while (message.length > 0) {

		switch (message.charCodeAt(0)) {
		case COMM_FAILURE:
			message = extractNDTHeader(message);
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: COMM_FAILURE</span>', 'debug');
			}
			break;
		case SRV_QUEUE:
			message = extractNDTHeader(message);
			clientState.waitingForMessage = true;

			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: SRV_QUEUE</span>', 'debug');
			}
			break;
		case MSG_LOGIN:
			message = extractNDTHeader(message);
			var messageContent = extractNDTMessageBody(message, ndtMessageLength);
			message = messageContent[0];

			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: MSG_LOGIN</span>', 'debug');
			}

			//get the server Version. look for a "v" in the message for the version
			if ((messageContent[1].indexOf("v")) != -1) {
				clientResults.serverVersion = messageContent[1];
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
			}

			//TODO: check tests sent from server
			// if (messageContent[1].indexOf(TESTTYPE_C2S) != -1 || messageContent[1].indexOf(TESTTYPE_META) != 1
			// || messageContent[1].indexOf(TESTTYPE_S2C) != 1 || messageContentessageContent[1].indexOf(TESTTYPE_MID) != 1 || messageContent[1].indexOf(TESTTYPE_SFW) != 1) {
			// }

			// var testArray = messageContent[1].split(/[ ,\n]+/);
			// for ( testOffset = 0; testOffset < testArray.length; testOffset++) {
			// //find the occurence of the string and set the corresponding value in the object
			// if (testArray[testOffset].indexOf("CurMSS") > -1) {
			// clientResults.CurMSS = testArray[testOffset + 1];
			// }

			break;
		case TEST_PREPARE:
			message = extractNDTHeader(message);
			var messageContent = extractNDTMessageBody(message, ndtMessageLength);
			message = messageContent[0];

			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: TEST_PREPARE</span>', 'debug');
			}
			//only start test on compatible server
			if (clientState.versionCompatible) {
				switch (clientState.currentTest) {
				case HANDSHAKE:
					clientState.currentTest = TESTTYPE_C2S;
					c2sPort = parseInt(messageContent[1]);
					if (DEBUG) {
						writeToScreen('<span style="color: blue;">c2sPort:' + messageContent[1] + '</span>', 'debug');
					}
					C2SSocket();
					break;
				case TESTTYPE_C2S:
					// C2SSocket();
					break;
				case TESTTYPE_S2C:
					s2cPort = parseInt(messageContent[1]);
					if (DEBUG) {
						writeToScreen('<span style="color: blue;">s2cPort:' + messageContent[1] + '</span>', 'debug');
					}
					S2CSocket();
					//start progressbar
					s2cProgress();
					//runningInboundTest
					writeToScreen(displayMessages.runningInboundTest, 'details');
					break;
				default:
					break;

				}
			}

			break;
		case TEST_START:
			message = extractNDTHeader(message);
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: TEST_START</span>', 'debug');
			}
			//only start test on compatible server
			if (clientState.versionCompatible) {
				switch (clientState.currentTest) {
				case TESTTYPE_C2S:
					// startWorker(c2sWorker);
					startC2STest();
					//start progressbar
					c2sProgress();
					//Show message runningOutboundTest
					writeToScreen(displayMessages.runningOutboundTest, 'details');
					break;
				case TESTTYPE_META:
					startMetaTest();
					//start progressbar
					metaProgress();
					//sendingMetaInformation
					writeToScreen(displayMessages.sendingMetaInformation, 'details');
					break;
				default:
					break;
				}
			}

			break;
		case TEST_MSG:

			getResults(message);
			// Duration is the last variable sent, after send the results and close the s2c connection
			if (clientState.currentTest == TESTTYPE_S2C && !alreadySent) {
				alreadySent = true;
				onCloseS2C();
			}
			message = extractNDTHeader(message);
			clientState.waitingForMessage = true;

			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: TEST_MSG</span>', 'debug');
			}
			break;
		case TEST_FINALIZE:
			message = extractNDTHeader(message);
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: TEST_FINALIZE</span>', 'debug');
			}
			switch (clientState.currentTest) {
			case TESTTYPE_C2S:
				clientState.currentTest = TESTTYPE_S2C;
				onCloseC2S();
				break;
			case TESTTYPE_S2C:
				clientState.currentTest = TESTTYPE_META;
				break;
			case TESTTYPE_META:
				clientState.currentTest = null;
				writeToScreen(displayMessages.stopping, 'details');
				break;
			default:
				clientState.currentTest = null;
				break;
			}
			break;
		case MSG_ERROR:
			message = extractNDTHeader(message);
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: MSG_ERROR</span>', 'debug');
			}
			break;
		case MSG_RESULTS:
			getResults(message);
			message = extractNDTHeader(message);
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: MSG_RESULTS</span>', 'debug');
			}
			break;
		case MSG_LOGOUT:
			message = extractNDTHeader(message);
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: MSG_LOGOUT</span>', 'debug');
			}
			//Testing complete. Close Connection and show results.
			onControlClose();
			break;
		case MSG_WAITING:
			message = extractNDTHeader(message);
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: MSG_WAITING</span>', 'debug');
			}
			break;
		case MSG_EXTENDED_LOGIN:
			message = extractNDTHeader(message);
			if (DEBUG) {
				writeToScreen('<span style="color: blue;">RESPONSE: MSG_EXTENDED_LOGIN</span>', 'debug');
			}
			break;
		default:
			//get results that arrive after their header
			getResults(message);
			var messageContent = extractNDTMessageBody(message, ndtMessageLength);
			message = messageContent[0];

			//get client upload speed from c2s test results
			// client is awaiting message for the c2s test and the message is not empty
			if (clientState.waitingForMessage && clientState.currentTest == TESTTYPE_C2S && messageContent[1] > 0) {
				// client upload speed
				if (DEBUG) {
					writeToScreen('<span style="color: blue;">Client upload:' + messageContent[1] + '</span>', 'debug');
				}
				clientResults.serverDerivedUploadSpd = messageContent[1];

				//After message is recieved set status back to false
				clientState.waitingForMessage = false;
			}

			if (clientState.waitingForMessage && clientState.currentTest == HANDSHAKE && messageContent[1] >= 0) {
				// client queue position
				if (DEBUG) {
					writeToScreen('<span style="color: blue;">Client Queue:' + messageContent[1] + '</span>', 'debug');
				}

				if (messageContent[1] == SRV_QUEUE_SERVER_FAULT) {
					// Server Fault
					if (DEBUG) {
						writeToScreen('<span style="color: blue;">RESPONSE: Server Fault</span>', 'debug');
					}
					writeToScreen(displayMessages.serverFault, 'details');
					//Close socket on fault
					// ndtControlSocket.disconnect(ndtControlSocket.socketId);
					break;

				} else if (messageContent[1] == SRV_QUEUE_SERVER_BUSY) {
					// Server busy/fault
					if (DEBUG) {
						writeToScreen('<span style="color: blue;">RESPONSE: Server busy or server fault</span>', 'debug');
					}
					writeToScreen(displayMessages.serverBusy, 'details');
					//Close socket on fault
					// ndtControlSocket.disconnect(ndtControlSocket.socketId);
					break;

				} else if (messageContent[1] == SRV_QUEUE_HEARTBEAT) {
					//Test_Status check
					// Signalize client is waiting with empty MSG_WAITING packet
					sendNDTControlMsg(MSG_WAITING, "");
					if (DEBUG) {
						writeToScreen('<span style="color: blue;">RESPONSE: Client responded waiting...</span>', 'debug');
					}

				} else if (messageContent[1] != SRV_QUEUE_TEST_STARTS_NOW) {

					clientState.queued = true;
					clientState.timeTillStart = messageContent[1];
					writeToScreen('Client queued. Test should start in approximately ' + clientState.timeTillStart + ' min.', 'details');
				} else {
					// Client starting tests
					clientState.queued = false;
					clientState.timeTillStart = null;
				}

				//After message is recieved set status back to false
				clientState.waitingForMessage = false;
			}

			break;
		}
	}
}

/**
 * Description Read the header of the incoming messages and strip it from the message
 * @method extractNDTHeader
 * @param {} message
 * @return message the rest of the message without the header.
 */
function extractNDTHeader(message) {
	//Get the length of the message from the header

	//must be at least 3 bytes available to process
	if (message.length >= 3) {
		//get messagelength from second and third bytes in the Header
		ndtMessageLength = (message.charCodeAt(1) << 8) | message.charCodeAt(2);

		//Remove the header from messageStream, it is exactly 3 chars/bytes
		message = removeFirstNChars(message, MSG_HEADER_LENGTH);

		//if Header is received before the body set the waitingformessage flag
		if (message.length <= 0 && ndtMessageLength > 0) {
			clientState.waitingForMessage = true;
		}
	}
	return message;

}

/**
 * Description returns the remaining message to be parsed as well as the content of the last message block
 * @method extractNDTMessageBody
 * @param {} message
 * @param {} messageLength
 * @return ArrayExpression
 */
function extractNDTMessageBody(message, messageLength) {

	var content = message.substring(0, messageLength);

	if (DEBUG) {
		writeToScreen('<span style="color: blue;">Message Content:' + content + '</span>', 'debug');
	}

	var remainingMessage = removeFirstNChars(message, messageLength);
	ndtMessageLength = 0;

	return [remainingMessage, content];
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