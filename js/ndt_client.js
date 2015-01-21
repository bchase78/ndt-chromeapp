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

// var wsWwTest = false;

$(document).ready(function() {
	// Find the closest mlab server using mlab-ns.
	$.ajax({
		'url': 'http://mlab-ns.appspot.com/ndt',
		'dataType': 'json',
		'success': function (data) {
			$('#mlabns').attr('urn', data.fqdn);
		}
	});

	//hide Results on before test has been run

	if (!DEBUG) {
		$("#debugtab").addClass('hide');
		$("#debug").addClass('hide');
	}

	$("#resetBtn").prop('disabled', true);

	$('#StartBtn').on('click', function(event) {

		if (hostname != null) {
			$("#hostSelectAlert").addClass('hide');
			
			NDTinit();

			// // Send testsuite to server
			// sendNDTControlMsg(MSG_LOGIN, selectTests());

			//disable startbutton after start.
			$('#StartBtn').prop('disabled', true);
			$("#resetBtn").prop('disabled', false);
		}
		else{
			$("#hostSelectAlert").removeClass('hide');
		}

	});

	$('#resetBtn').on('click', function(event) {
		// window.location.reload();
		//https://developer.chrome.com/extensions/runtime#method-reload
		chrome.runtime.reload();
	});

	$(".dropdown-menu li a").click(function() {
		$("#StartBtn").prop('disabled', false);
		var selText = $(this).text();
		hostname = $(this).attr("urn");
		$(this).parents('.dropdown').find('.btn').html(selText + ' <span class="caret"></span>');
	});


});


/**
 * Description After the Tests have been run this method should be called. It blends in the visual elements
 * and it calls the method to parse the results. Further the Speed gauges are drawn and the results
 * are displayed.
 * @method showResults
 * @return
 */
function showResults() {

	$("#resultstab").removeClass('hide');
	$("#results").removeClass('hide');
	$("#web100varstab").removeClass('hide');
	$("#web100varsmessages").removeClass('hide');

	interpretResults();

	$('#ndtTab a[href="#results"]').tab('show');

	document.getElementById("avgrtttext").innerHTML = clientResults.avgrtt;
	setGaugeValue("download", clientResults.clientDerivedDownloadSpd);
	setGaugeValue("upload", clientResults.serverDerivedUploadSpd);

	// Printing property names and values using Array.forEach
	Object.getOwnPropertyNames(clientResults).forEach(function(val, idx, array) {
		if (clientResults[val] !== null && clientResults[val].length !== undefined && clientResults[val].length > 0 && clientResults[val].indexOf("function") == -1) {
			writeToScreen((val + ': ' + clientResults[val]), 'web100vars');
		}
	});

}

/**
 * Description Controls the progress bar for the c2s part of the test
 * @method c2sProgress
 * @return
 */
function c2sProgress() {
	$('#c2sbar').css("width", function() {
		return $(this).attr("aria-valuenow") + "%";
	});
}

/**
 * Description Controls the progress bar for the s2c part of the test
 * @method s2cProgress
 * @return
 */
function s2cProgress() {
	$('#s2cbar').css("width", function() {
		return $(this).attr("aria-valuenow") + "%";
	});
}

/**
 * Description Controls the progress bar for the meta part of the test
 * @method metaProgress
 * @return
 */
function metaProgress() {
	$('#metabar').css("width", function() {
		return $(this).attr("aria-valuenow") + "%";
	});
}

/**
 * Description Displays the animated speed gauge and parses the speed to show the speed in the correct units.
 * The input value is kb/s but if it is more than 1024 then in will be converted to MB/s and so on...
 * @method setGaugeValue
 * @param {} gaugeid  the id of the canvas to output the gauge
 * @param {} speedinKB the speed in kilobytes/s
 * @return gauge canvas and the speed with units as text
 */
function setGaugeValue(gaugeid, speedinKB) {
	//Converts speed in kb/s to other sizes
	var s = ['kB/s', 'MB/s', 'GB/s', 'TB/s', 'PB/s', 'EB/s'];
	var e = Math.floor(Math.log(speedinKB) / Math.log(1000));
	var value = (speedinKB / Math.pow(1000, e)).toFixed(2);

	var opts = {
		lines : 100, // The number of lines to draw
		angle : 0, // The length of each line
		lineWidth : 0.23, // The line thickness
		pointer : {
			length : 0.9, // The radius of the inner circle
			strokeWidth : 0.035, // The rotation offset
			color : '#000000' // Fill color
		},
		limitMax : 'false', // If true, the pointer will not go past the end of the gauge
		percentColors : [[0.0, "#f9c802"], [0.50, "#a9d70b"], [1.0, "#1AB02E"]],
		strokeColor : '#DEDEDE' // to see which ones work best for you
	};
	// canvas element
	var target = document.getElementById(gaugeid);
	// create gauge
	var gauge = new Gauge(target).setOptions(opts);
	// set max gauge value
	gauge.maxValue = 1000;
	// set animation speed (32 is default value)
	gauge.animationSpeed = 10;

	gauge.setTextField(document.getElementById(gaugeid + 'text'));
	// set actual value
	gauge.set(parseFloat(value));

	//output Units
	document.getElementById(gaugeid + 'unit').innerHTML = " " + s[e];

}

/**
 * Description Check the which tests are selected and return them as a Binaryexpression
 * This method could be used to select different tests, however at the moment only the C2S, S2C, and Meta tests are available
 * @method selectTests
 * @return BinaryExpression  the test suite as or operation
 */
function selectTests() {
	var midTest;
	var c2sTest;
	var s2cTest;
	var sfwTest;
	var metaTest;

	// if ($('#C2S').is(':checked')) {
	// c2sTest = TESTTYPE_C2S;
	// clientState.requestedC2STest = true;
	// }
	// if ($('#MID').is(':checked')) {
	// midTest = TESTTYPE_MID;
	// clientState.requestedMIDTest = true;
	// }
	// if ($('#SFW').is(':checked')) {
	// sfwTest = TESTTYPE_SFW;
	// clientState.requestedSFWTest = true;
	// }
	// if ($('#S2C').is(':checked')) {
	// s2cTest = TESTTYPE_S2C;
	// clientState.requestedsS2CTest = true;
	// }
	// if ($('#META').is(':checked')) {
	// metaTest = TESTTYPE_META;
	// clientState.requestedMetaTest = true;
	// }

	//force start of c2s, s2c, and meta tests.  Function could be changed to selectable tests in a later version.
	c2sTest = TESTTYPE_C2S;
	clientState.requestedC2STest = true;
	s2cTest = TESTTYPE_S2C;
	clientState.requestedsS2CTest = true;
	metaTest = TESTTYPE_META;
	clientState.requestedMetaTest = true;

	return midTest | c2sTest | s2cTest | sfwTest | TESTTYPE_STATUS | metaTest;
}
