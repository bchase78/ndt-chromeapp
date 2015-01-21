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
var s2ccallcounts = 0;

//TODO Setup S2C Test as a Web Worker
/**
 * Description Connect to a binary websocket for the S2C throughput test
 * @method S2CSocket
 * @return
 */
function S2CSocket() {
        // We have to use raw sockets here rather than TcpClient, because
        // TcpClient does data conversion which causes us to become CPU bound.
        chrome.sockets.tcp.create(
                {
                        bufferSize: 10000000
                },
                function(createInfo) {
                        s2cSocket = createInfo.socketId;
                        chrome.sockets.tcp.connect(
                                s2cSocket,
                                hostname,
                                s2cPort,
                                function () {
                                        chrome.sockets.tcp.onReceive.addListener(receiveS2CStream);
                                        onOpenS2C();
                                }
                        );
                }
        );
}

/**
 * listens to sockets for arriving messages.
 */
function receiveS2CStream(receiveInfo) {
        if (receiveInfo.socketId != s2cSocket) { return; }
        clientResults.s2cdataLength += receiveInfo.data.byteLength;
        s2ccallcounts++;
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
 * @method finishS2C
 * @return
 */
function finishS2C() {
        if (s2cSocket != null) {
                chrome.sockets.tcp.onReceive.removeListener(receiveS2CStream);
                chrome.sockets.tcp.disconnect(s2cSocket);
                chrome.sockets.tcp.close(s2cSocket);
                s2cSocket = null;
        }
	clientResults.s2cEndTime = new Date().getTime();
	var S2C_TEST_DURATION_SECONDS = (clientResults.s2cEndTime - clientResults.s2cStartTime) / 1000;
	var S2C_THROUGHPUT_VALUE = ((8 * clientResults.s2cdataLength) / 1000) / S2C_TEST_DURATION_SECONDS;
	//throughput must be encoded as string
	sendNDTControlMsg(TEST_MSG, stringToArrayBuffer(S2C_THROUGHPUT_VALUE.toString()));
	clientResults.clientDerivedDownloadSpd = parseFloat(S2C_THROUGHPUT_VALUE).toFixed(2);
	if (DEBUG) {
		writeToScreen('<span style="color: blue;">S2C Length:' + clientResults.s2cdataLength + '</span>', 'debug');
		writeToScreen('<span style="color: blue;">S2C Duration:' + S2C_TEST_DURATION_SECONDS + ' seconds </span>', 'debug');
		writeToScreen('<span style="color: blue;">THROUGHPUT_VALUE:' + clientResults.clientDerivedDownloadSpd + ' </span>', 'debug');
	}
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

var sentS2CDataRate = false;

/**
 * Description Respond to messages when an S2C test is occurring.
 * @return true if the message was the last message in the test.
 */
function processS2CMessage(header, contents) {
        if (!clientState.versionCompatible) { return true; }
        switch (header.charCodeAt(0)) {
                case TEST_PREPARE:
                        if (DEBUG) { writeToScreen('S2C: TEST_PREPARE', 'debug'); }
                        s2cPort = parseInt(contents);
		        S2CSocket();
			s2cProgress();
			writeToScreen(displayMessages.runningInboundTest, 'details');
                        return false;
                case TEST_START:
                        if (DEBUG) { writeToScreen('S2C: TEST_START', 'debug'); }
                        setTimeout(finishS2C, 11000);
                        // TEST_START is redundant for this test, as the server starts the test not the client.
                        return false;
                case TEST_MSG:
                        if (DEBUG) { writeToScreen('S2C: TEST_MSG', 'debug'); }
                        getResults(contents);
                        return false;
                case TEST_FINALIZE:
                        if (DEBUG) { writeToScreen('S2C: TEST_FINALIZE', 'debug'); }
                        return true;
                default:
                        if (DEBUG) { writeToScreen('Bad message type during s2ctest: ' + header.charCodeAt(0), 'debug'); }
                        return true;
        }
}
