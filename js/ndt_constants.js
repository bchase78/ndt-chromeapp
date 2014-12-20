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

// The current version of the protocol is backward compatible to v3.3.12.
var LAST_VALID_SERVER_VERSION = "v3.3.12";
var CLIENT_ID = "ChromeExt";
var CLIENT_VER = "v3.6.5.2";

//Set debug status for client to get debug output
var DEBUG = true;

//Host to run tests on
var hostname = null;

//Standard TCP Ports
var controlPort = 3001;
var c2sPort = 3002;
var s2cPort = 3003;


//Test Types
var TESTTYPE_MID = (1 << 0);
var TESTTYPE_C2S = (1 << 1);
var TESTTYPE_S2C = (1 << 2);
var TESTTYPE_SFW = (1 << 3);
var TESTTYPE_STATUS = (1 << 4);
var TESTTYPE_META = (1 << 5);
var HANDSHAKE = "handshake";

//Message Types
var KICK_OFF = "123456 654321";
var COMM_FAILURE = 0x00;
var SRV_QUEUE = 0x01;
var MSG_LOGIN = 0x02;
var TEST_PREPARE = 0x03;
var TEST_START = 0x04;
var TEST_MSG = 0x05;
var TEST_FINALIZE = 0x06;
var MSG_ERROR = 0x07;
var MSG_RESULTS = 0x08;
var MSG_LOGOUT = 0x09;
var MSG_WAITING = 0x10;
var MSG_EXTENDED_LOGIN = 0x11;

// META test result fields.
var META_CLIENT_OS = "client.os.name:";
var META_CLIENT_BROWSER = "client.browser.name:";
var META_CLIENT_KERNEL_VERSION = "client.kernel.version:";
var META_CLIENT_VERSION = "client.version:";
var META_CLIENT_APPLICATION = "client.application:";

var MSG_HEADER_LENGTH = 3;
var KICK_OLD_CLIENTS_MSG_LENGTH = 13;
var SRV_QUEUE_MSG_LENGTH = 4;
var DEFAULT_CONTROL_PORT = 3001;

// SRV-QUEUE status.
var SRV_QUEUE_HEARTBEAT = 9990;
var SRV_QUEUE_SERVER_BUSY = 9988;
var SRV_QUEUE_SERVER_BUSY_60s = 9999;
var SRV_QUEUE_SERVER_FAULT = 9977;
var SRV_QUEUE_TEST_STARTS_NOW = 0;

// Allow the client to run the S2C and the C2S tests longer than 10sec.
// This will cause the server to close the test sockets.
var C2S_DURATION = 11000;
// 11sec
var S2C_DURATION = 15000;
// 15sec

// TCP constants.
// Max size that can be sent, because 2 bytes are used to hold data length.
var TCP_MAX_RECV_WIN_SIZE = 65535; // bytes

// According to RFC1323, Section 2.3 the max valid value of iWinScaleRcvd is
// 14. NDT uses 20 for this, leaving for now in case it is an error value.
var TCP_MAX_WINSCALERCVD = 20;

// bytes
var PREDEFINED_BUFFER_SIZE = 8192;

// NDT specific limits.
// See http://www.web100.org/download/kernel/tcp-kis.txt.
var SND_LIM_TIME_THRESHOLD = 0.15;

// If the congestion windows is limited more than 0.5% of the time, NDT
// claims that the connection is network limited.
var CWND_LIM_TIME_THRESHOLD = 0.005;

// If the link speed is less than a T3, and loss is greater than 1 percent,
// loss is determined to be excessive.
var LOSS_THRESHOLD = 0.01;

// Duplex indicators as defined by the NDT server.
var DUPLEX_OK_INDICATOR = "0";
var DUPLEX_NOK_INDICATOR = "1";
var DUPLEX_SWITCH_FULL_HOST_HALF = "2";
var DUPLEX_SWITCH_HALF_HOST_FULL = "3";
var DUPLEX_SWITCH_FULL_HOST_HALF_POSS = "4";
var DUPLEX_SWITCH_HALF_HOST_FULL_POSS = "5";
var DUPLEX_SWITCH_HALF_HOST_FULL_WARN = "7";

// Cable status.
var CABLE_STATUS_OK = "0";
var CABLE_STATUS_NOK = "1";

// Values of TCP options.
var SACKENABLED_OFF = "0";
var NAGLEENABLED_OFF = "0";
var ECNENABLED_OFF = "0";
var TIMESTAMPSENABLED_OFF = "0";

// Speed difference to detect packet queueing.
// var SPD_DIFF = 0.1;

// Constants for unit convertions.
var KBITS2BITS = 1024;

// The current state of the client is stored here. This is used to decide
// which action needs to be taken next.
// HANDSHAKE should be set to the first selected test
var clientState = {

	complete: false,
	queued: false,
	versionCompatible: false,
	waitingForMessage: false,
	timeTillStart: null,
	requestedC2STest: false,
	requestedS2CTest: false,
	requestedMetaTest: false,
	requestedMIDTest: false,
	requestedSFWTest: false,
	currentTest: HANDSHAKE,
	/**
	 * Description set all the values to false
	 * @method resetClient
	 * @return
	 */
	resetClient: function () {
		for (var key in clientState) {
			if (clientState[key] == true || clientState[key] == false) {
				clientState[key] = false;
			} else {
				clientState[key] = null;
			}

		}
	}
	};

// Store all the web 100 variables and other data needed for processing the results.
var clientResults = {
    CurMSS: null,
    X_Rcvbuf: null,
    X_Sndbuf: null,
    AckPktsIn: null,
    AckPktsOut: null,
    BytesRetrans: null,
    CongAvoid: null,
    CongestionOverCount: null,
    CongestionSignals: null,
    CountRTT: null,
    CurCwnd: null,
    CurRTO: null,
    CurRwinRcvd: null,
    CurRwinSent: null,
    CurSsthresh: null,
    DSACKDups: null,
    DataBytesIn: null,
    DataBytesOut: null,
    DataPktsIn: null,
    DataPktsOut: null,
    DupAcksIn: null,
    ECNEnabled: null,
    FastRetran: null,
    MaxCwnd: null,
    MaxMSS: null,
    MaxRTO: null,
    MaxRTT: null,
    MaxRwinRcvd: null,
    MaxRwinSent: null,
    MaxSsthresh: null,
    MinMSS: null,
    MinRTO: null,
    MinRTT: null,
    MinRwinRcvd: null,
    MinRwinSent: null,
    NagleEnabled: null,
    OtherReductions: null,
    PktsIn: null,
    PktsOut: null,
    PktsRetrans: null,
    RcvWinScale: null,
    SACKEnabled: null,
    SACKsRcvd: null,
    SendStall: null,
    SlowStart: null,
    SampleRTT: null,
    SmoothedRTT: null,
    SndWinScale: null,
    SndLimTimeRwin: null,
    SndLimTimeCwnd: null,
    SndLimTimeSender: null,
    SndLimTransRwin: null,
    SndLimTransCwnd: null,
    SndLimTransSender: null,
    SndLimBytesRwin: null,
    SndLimBytesCwnd: null,
    ndLimBytesSender: null,
    SubsequentTimeouts: null,
    SumRTT: null,
    Timeouts: null,
    TimestampsEnabled: null,
    WinScaleRcvd: null,
    WinScaleSent: null,
    DupAcksOut: null,
    StartTimeUsec: null,
    Duration: null,
    c2sData: null,
    c2sAck: null,
    s2cData: null,
    s2cAck: null,
    half_duplex: null,
    link: null,
    congestion: null,
    bad_cable: null,
    mismatch: null,
    spd: null,
    bw: null,
    loss: null,
    avgrtt: null,
    waitsec: null,
    timesec: null,
    order: null,
    rwintime: null,
    sendtime: null,
    cwndtime: null,
    rwin: null,
    swin: null,
    cwin: null,
    rttsec: null,
    Sndbuf: null,
    aspd: null,
    CWND_Limited: null,
    minCWNDpeak: null,
    maxCWNDpeak: null,
    CWNDpeaks: null,
    serverVersion: null,
    serverDerivedUploadSpd: null,
    clientDerivedUploadSpd: null,
    clientDerivedDownloadSpd: null,
    c2stestDatasent: null,
    s2cdataLength: null,
    c2sStartTime: null,
    c2sEndTime: null,
    s2cStartTime: null,
    s2cEndTime: null,
    linkSpd: null,
    /**
     * Description set all the values to null
     * @method resetClient
     * @return 
     */
    resetClient: function () {
        for (var key in clientResults) {
            clientResults[key] = null;
        }
    }
};