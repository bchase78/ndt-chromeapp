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

// Boolean true when mobil device
var ismobi = navigator.userAgent.match(/Mobi/i);

/**
 * Description parse the user agent string and try to return information about the operating system and browser
 * This method should be replaced with something better. Idea taken from http://www.javascripter.net/faq/browsern.htm
 * Possibly change to http://www.useragentstring.com/pages/api.php
 * @method userAgent
 * @return ArrayExpression
 */
function userAgent() {

	var nVer = navigator.appVersion;
	var nAgt = navigator.userAgent;
	var browserName = navigator.appName;
	var fullVersion = '' + parseFloat(navigator.appVersion);
	var majorVersion = parseInt(navigator.appVersion, 10);
	var nameOffset, verOffset, ix;

	// In Opera, the true version is after "Opera" or after "Version"
	if (( verOffset = nAgt.indexOf("OPR")) != -1) {
		browserName = "Opera";
		fullVersion = nAgt.substring(verOffset + 6);
		if (( verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In Firefox, the true version is after "Firefox"
	//Firefox must be tested before IE due to change in IE 11
	else if (( verOffset = nAgt.indexOf("Firefox")) != -1) {
		browserName = "Firefox";
		fullVersion = nAgt.substring(verOffset + 8);
	}
	// In MSIE <= 10, the true version is after "MSIE" in userAgent
	else if (( verOffset = nAgt.indexOf("MSIE")) != -1) {
		browserName = "Microsoft Internet Explorer";
		fullVersion = nAgt.substring(verOffset + 5);
	}
	// In MSIE >= 11, the true version is after "rv:" in userAgent
	else if (( verOffset = nAgt.indexOf("rv:")) != -1) {
		browserName = "Microsoft Internet Explorer";
		//only get the major und 1 minor release number = 4 chars
		fullVersion = nAgt.substring(verOffset + 3, verOffset + 7);
	}
	// In Chrome, the true version is after "Chrome"
	else if (( verOffset = nAgt.indexOf("Chrome")) != -1) {
		browserName = "Chrome";
		fullVersion = nAgt.substring(verOffset + 7);
	}
	// In Safari, the true version is after "Safari" or after "Version"
	else if (( verOffset = nAgt.indexOf("Safari")) != -1) {
		browserName = "Safari";
		fullVersion = nAgt.substring(verOffset + 7);
		if (( verOffset = nAgt.indexOf("Version")) != -1)
			fullVersion = nAgt.substring(verOffset + 8);
	}
	// In most other browsers, "name/version" is at the end of userAgent
	else if (( nameOffset = nAgt.lastIndexOf(' ') + 1) < ( verOffset = nAgt.lastIndexOf('/'))) {
		browserName = nAgt.substring(nameOffset, verOffset);
		fullVersion = nAgt.substring(verOffset + 1);
		if (browserName.toLowerCase() == browserName.toUpperCase()) {
			browserName = navigator.appName;
		}
	}
	// trim the fullVersion string at semicolon/space if present
	if (( ix = fullVersion.indexOf(";")) != -1)
		fullVersion = fullVersion.substring(0, ix);
	if (( ix = fullVersion.indexOf(" ")) != -1)
		fullVersion = fullVersion.substring(0, ix);

	majorVersion = parseInt('' + fullVersion, 10);
	if (isNaN(majorVersion)) {
		fullVersion = '' + parseFloat(navigator.appVersion);
		majorVersion = parseInt(navigator.appVersion, 10);
	}

	var OSName = "Unknown OS";
	if (navigator.appVersion.indexOf("Win") != -1)
		OSName = "Windows";
	if (navigator.appVersion.indexOf("Mac") != -1)
		OSName = "MacOS";
	if (navigator.appVersion.indexOf("X11") != -1)
		OSName = "UNIX";
	if (navigator.appVersion.indexOf("Linux") != -1)
		OSName = "Linux";
	if (navigator.appVersion.indexOf("Android") != -1)
		OSName = "Android";
	if (navigator.appVersion.indexOf("IOS") != -1)
		OSName = "IOS";

	//https://developer.chrome.com/extensions/runtime#type-PlatformInfo
	// chrome.runtime.getPlatformInfo(function(info) {
	// if (info.os == "win") {
	// OSName = "Windows";
	// }
	// if (info.os == "mac") {
	// OSName = "MacOS";
	// }
	// if (info.os == "linux") {
	// OSName = "Linux";
	// }
	// if (info.os == "android") {
	// OSName = "Android";
	// }
	// if (info.os == "openbsd") {
	// OSName = "OpenBSD";
	// }
	// if (info.os == "cros") {
	// OSName = "Chrome OS";
	// }
	// });

	//Raw Browser info:
	// var txt = "<p>Browser CodeName: " + navigator.appCodeName + "</p>";
	// txt+= "<p>Browser Name: " + navigator.appName + "</p>";
	// txt+= "<p>Browser Version: " + navigator.appVersion + "</p>";
	// txt+= "<p>Browser Language: " + navigator.language + "</p>";
	// txt+= "<p>Platform: " + navigator.platform + "</p>";
	// txt+= "<p>User-agent header: " + navigator.userAgent + "</p>";
	// document.getElementById("browserInfo").innerHTML = txt;

	return [browserName, fullVersion, OSName];
};