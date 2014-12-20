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

var s2cSocket = null;

//TODO Setup S2C Test as a Web Worker
/**
 * Description Connect to a binary websocket for the S2C throughput test
 * @method S2CSocket
 * @return
 */
function S2CSocket() {

	s2cSocket = new TcpClient(hostname, s2cPort);
	s2cSocket.connect(function() {

		s2cSocket.addResponseListener(function(data) {
			// onMessageC2S();
			clientResults.s2cdataLength += data.length;
		});

		onOpenS2C();
	});
}

/**
 * Description When socket is opened save the time for later processing
 * @method onOpenS2C
 * @param {} evt
 * @return
 */
function onOpenS2C() {
	if (DEBUG) {
		writeToScreen("CONNECTED S2C", 'debug');
	}
	clientResults.s2cStartTime = new Date().getTime();
}

/**
 * Description When the socket closes, get the time and calculate the test duration and
 * throughput value. Then send it to the server.
 * @method onCloseS2C
 * @param {} evt
 * @return
 */
function onCloseS2C() {

	clientResults.s2cEndTime = new Date().getTime();
	var S2C_TEST_DURATION_SECONDS = (clientResults.s2cEndTime - clientResults.s2cStartTime) / 1000;
	var S2C_THROUGHPUT_VALUE = ((8 * clientResults.s2cdataLength) / 1000) / S2C_TEST_DURATION_SECONDS;
	//throughput must be encoded as string
	sendNDTControlMsg(TEST_MSG, stringToArrayBuffer(S2C_THROUGHPUT_VALUE.toString()));
	clientResults.clientDerivedDownloadSpd = parseFloat(S2C_THROUGHPUT_VALUE).toFixed(2);
	if (DEBUG) {
		writeToScreen('DISCONNECTED S2C', 'debug');
		writeToScreen('<span style="color: blue;">S2C Length:' + clientResults.s2cdataLength + '</span>', 'debug');
		writeToScreen('<span style="color: blue;">S2C Duration:' + S2C_TEST_DURATION_SECONDS + ' seconds </span>', 'debug');
		writeToScreen('<span style="color: blue;">THROUGHPUT_VALUE:' + clientResults.clientDerivedDownloadSpd + ' </span>', 'debug');
	}
	// s2cSocket.disconnect(s2cSocket.socketId);
}

/**
 * Description Count all incoming bytes for later processing
 * @method onMessageS2C
 * @param {} evt
 * @return
 */
function onMessageS2C(evt) {
	clientResults.s2cdataLength += evt.data.byteLength;
}

/**
 * Description Output socket errors as debug information
 * @method onErrorS2C
 * @param {} evt
 * @return
 */
function onErrorS2C(evt) {
	if (DEBUG) {
		writeToScreen('<span style="color: red;">ERROR:' + evt.data + '</span>', 'debug');
	}
}