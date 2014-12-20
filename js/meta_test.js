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

/**
 * Description Collect client meta data from utilities and send it to the NDT server.
 * @method startMetaTest
 * @return 
 */
function startMetaTest() {
	// Gather data from userAgent script and prepare it for transmission to the NDT server
	var metadata = userAgent();
	var metabrowser = META_CLIENT_BROWSER + metadata[0] + ' / ' + metadata[1];
	var metaclientOS = META_CLIENT_OS + metadata[2];
	// var metaclientkernelversion = META_CLIENT_KERNEL_VERSION  + metadata[3];
	var metaClientVer = META_CLIENT_VERSION + CLIENT_VER;
	var metaClientApp = META_CLIENT_APPLICATION + CLIENT_ID;

	// Send client meta information. 
	// Meta Information must be sent as an Arraybuffer
	sendNDTControlMsg(TEST_MSG, stringToArrayBuffer(metaclientOS));
	// sendNDTControlMsg(TEST_MSG, stringToArrayBuffer(metaclientkernelversion));
	sendNDTControlMsg(TEST_MSG, stringToArrayBuffer(metabrowser));
	sendNDTControlMsg(TEST_MSG, stringToArrayBuffer(metaClientVer));
	sendNDTControlMsg(TEST_MSG, stringToArrayBuffer(metaClientApp));

	// Signalize end of transmission with empty TEST_MSG packet
	sendNDTControlMsg(TEST_MSG, "");
} 