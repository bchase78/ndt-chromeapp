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

//Web Worker for the C2S Throughput Test

//import constants and utilities for use in Web Worker
// importScripts('ndt_constants.js', 'ndt_utils.js','tcp-client.js');

var c2sEndTime = null;
var c2sStartTime = null;
var c2stestDatasent = null;
var clientDerivedUploadSpd = null;
var c2sUri = null;
var c2sSocket = null;

// websocket buffering threshold
// var THRESHOLD = 2001 * PREDEFINED_BUFFER_SIZE;

//Prepare test data
var testData = stringToArrayBuffer(createTestBuffer(PREDEFINED_BUFFER_SIZE));

/**
 * Description - Establishes a websocket connection with the server at the c2sUri. The connect uses a
 * binary connection with arraybuffers.
 * @method C2SSocket
 * @return
 */

/**
 * Description A buffer threshold is set so that the client doesn't consume too much memory. After that the Buffer is filled with 500 messages
 * at a time until it is full. The Buffer is refilled as long as the test hast not ended or the buffer is nor full.
 * Then send testdata as fast as possible as long as there is room in the buffer. As that testdata is being sent the data is also being
 * counted for further use.
 * @method sendMessage
 * @return
 */
// var sendC2SMessage = function () {
// var addDataToBuffer = setInterval(function () {
//
// // Check for amount of data buffered but not yet sent and if the throughput test has not yet ended
// if ((c2sSocket.bufferedAmount < THRESHOLD) && new Date().getTime() <
// c2sStartTime + C2S_DURATION) {
// // Is this for loop incorrectly optimized in V8(Blink)?
// // For some reason c2stestDatasent += PREDEFINED_BUFFER_SIZE; is evaluted twice each cycle
// // which skews the results on Blink based browsers.(Chrome, Opera, ...)
// for (var i = 0; i < 500; i++) {
// if ((c2sSocket.bufferedAmount >= THRESHOLD) ||
// c2sEndTime != null) {
// break;
// }
// c2stestDatasent += PREDEFINED_BUFFER_SIZE;
// c2sSocket.sendMessage(testData);
// }
// }
// //if test has ended then clear the interval and stop sending data
// if (new Date().getTime() >= c2sStartTime + C2S_DURATION) {
// clearInterval(addDataToBuffer);
// }
// }, 0);
// };

/**
 * @author Benjamin Chase
 */

function C2SSocket() {

	c2sSocket = new TcpClient(hostname, c2sPort);
	c2sSocket.connect(function() {

		c2sSocket.addResponseListener(function(data) {
			onMessageC2S();
		});

		onOpenC2S();
	});
}

function onOpenC2S() {
	if (DEBUG) {
		writeToScreen("CONNECTED C2S", 'debug');
	}
}

function onCloseC2S() {
	//Get end time of measurement. The Server closes the port when the measurment is complete.
	clientResults.c2sEndTime = new Date().getTime();

	var C2STEST_DURATION_SECONDS = (clientResults.c2sEndTime - clientResults.c2sStartTime) / 1000;
	clientResults.clientDerivedUploadSpd = parseFloat(((clientResults.c2stestDatasent * 8) / 1000) / C2STEST_DURATION_SECONDS).toFixed(2);

	if (DEBUG) {
		writeToScreen("DISCONNECTED C2S", 'debug');
		writeToScreen('<span style="color: blue;">C2S DataLength:' + clientResults.c2stestDatasent + '</span>', 'debug');
		writeToScreen('<span style="color: blue;">C2S Duration:' + C2STEST_DURATION_SECONDS + ' seconds </span>', 'debug');
		writeToScreen('<span style="color: blue;">C2S THROUGHPUT_VALUE:' + parseFloat(clientResults.clientDerivedUploadSpd).toFixed(2) + ' </span>', 'debug');
	}
	// c2sSocket.disconnect(c2sSocket.socketId);
}

function onMessageC2S() {
	if (DEBUG) {
		writeToScreen('<span style="color: blue;">RESPONSE: C2S Data</span>', 'debug');
	}
}

function onErrorC2S() {
	if (DEBUG) {
		writeToScreen('<span style="color: red;">ERROR </span>', 'debug');
	}
}

function startC2STest() {

	// get current time
	clientResults.c2sStartTime = new Date().getTime();
	// create timer
	var timer;

	function run() {

		function func() {
			timer = setTimeout(func, 0);
			//send the test data over the c2s data socket in 5 packet bursts to prevent the browser from locking
			// for ( var i = 0; i < 5; i++) {
			//only count the packets that have been sent during the measurement time
			if (new Date().getTime() < clientResults.c2sStartTime + C2S_DURATION) {
				send(testData, c2sSocket);
				// clientResults.c2stestDatasent += PREDEFINED_BUFFER_SIZE;
			}
			// }
			//loop until current time is greater than the start time and the test duration ... ca. 15s
			if (new Date().getTime() >= clientResults.c2sStartTime + C2S_DURATION) {
				stop();
			}
		}

		// use setTimeout to push exection to the top of the execution list and to prohibit blocking the browser
		timer = setTimeout(func, 0);
	}

	function stop() {
		clearInterval(timer);
	}

	run();
}
