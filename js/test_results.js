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
 * Description parse the results and write the line speed as language specific
 * string to the output.
 * @method displayDetectedLineSpeed
 * @param {} resultData
 * @return 
 */
function displayDetectedLineSpeed(resultData) {
    switch (resultData) {
    case "-2":
        writeToScreen(displayMessages.insufficient, 'resultstext');
        break;
    case "-1":
        writeToScreen(displayMessages.systemFault, 'resultstext');
        break;
    case "0":
        writeToScreen(displayMessages.rtt, 'resultstext');
        break;
    case "1":
        writeToScreen(displayMessages.dialupStr, 'resultstext');
        break;
    case "2":
        writeToScreen(displayMessages.t1Str, 'resultstext');
        break;
    case "3":
        writeToScreen(displayMessages.ethernetStr, 'resultstext');
        break;
    case "4":
        writeToScreen(displayMessages.t3Str, 'resultstext');
        break;
    case "5":
        writeToScreen(displayMessages.fastEthernet, 'resultstext');
        break;
    case "6":
        writeToScreen(displayMessages.oc12Str, 'resultstext');
        break;
    case "7":
        writeToScreen(displayMessages.gigabitEthernetStr, 'resultstext');
        break;
    case "8":
        writeToScreen(displayMessages.oc48Str, 'resultstext');
        break;
    case "9":
        writeToScreen(displayMessages.tengigabitEthernetStr, 'resultstext');
        break;
    default:
        // writeToScreen(displayMessages.runningOutboundTest, 'resultstext');
        break;
    }

}

/**
 * Description Use the stored web100 variables to intrepret the findings and
 * make some assumptions to help the user understand what happen during the tests.
 * Ouput the results for the user to read with language specific text
 * @method interpretResults
 * @return 
 */
function interpretResults() {

    var metadata = userAgent();
    var metabrowser = metadata[0] + ' / ' + metadata[1];
    var metaclientOS = metadata[2];
    var metaClientVer = CLIENT_VER;
    var metaClientApp = CLIENT_ID;

    writeToScreen("OS Data: " + metaclientOS, 'resultstext');
    writeToScreen("Browser: " + metabrowser, 'resultstext');
    writeToScreen("NDT Client Version: " + metaClientVer + " " +
        metaClientApp, 'resultstext');

    switch (clientResults.c2sData) {
    case "-2":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.insufficient, 'resultstext');
        clientResults.linkSpd = NaN;
        break;
    case "-1":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.systemFault, 'resultstext');
        clientResults.linkSpd = NaN;
        break;
    case "0":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.rtt, 'resultstext');
        clientResults.linkSpd = NaN;
        break;
    case "1":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.dialupStr, 'resultstext');
        // 64 kbps
        clientResults.linkSpd = 0.064;
        break;
    case "2":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.cabledsl, 'resultstext');
        clientResults.linkSpd = 3;
        break;
    case "3":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.ethernetStr, 'resultstext');
        clientResults.linkSpd = 10;
        break;
    case "4":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.t3Str, 'resultstext');
        clientResults.linkSpd = 45;
        break;
    case "5":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.fastEthernet, 'resultstext');
        clientResults.linkSpd = 100;
        break;
    case "6":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.oc12Str, 'resultstext');
        clientResults.linkSpd = 622;
        break;
    case "7":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.gigabitEthernetStr, 'resultstext');
        clientResults.linkSpd = 1000;
        break;
    case "8":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.oc48Str, 'resultstext');
        clientResults.linkSpd = 2400;
        break;
    case "9":
        writeToScreen(displayMessages.your + " device " + displayMessages.connectedTo +
            " " + displayMessages.tengigabitEthernetStr, 'resultstext');
        clientResults.linkSpd = 10000;
        break;
    default:
        // writeToScreen(displayMessages. , 'resultstext');
        clientResults.linkSpd = NaN;
        break;
    }

    //RFC 896
    switch (clientResults.NagleEnabled) {
    case NAGLEENABLED_OFF:
        writeToScreen("RFC 896 Nagle Algorithm: " + displayMessages.off,
            'resultstext');
        break;
    default:
        writeToScreen("RFC 896 Nagle Algorithm: " + displayMessages.on,
            'resultstext');
        break;
    }

    //RFC2018
    switch (clientResults.SACKEnabled) {
    case SACKENABLED_OFF:
        writeToScreen("RFC 2018 Selective Acknowledgement: " +
            displayMessages.off, 'resultstext');
        break;
    default:
        writeToScreen("RFC 2018 Selective Acknowledgement: " +
            displayMessages.on, 'resultstext');
        break;
    }

    //RFC 3168
    switch (clientResults.ECNEnabled) {
    case ECNENABLED_OFF:
        writeToScreen("RFC 3168 Explicit Congestion Notification: " +
            displayMessages.off, 'resultstext');
        break;
    default:
        writeToScreen("RFC 3168 Explicit Congestion Notification: " +
            displayMessages.on, 'resultstext');
        break;
    }

    //RFC 1323
    switch (clientResults.TimestampsEnabled) {
    case TIMESTAMPSENABLED_OFF:
        writeToScreen("RFC 1323 Time Stamping: " + displayMessages.off,
            'resultstext');
        break;
    default:
        writeToScreen("RFC 1323 Time Stamping: " + displayMessages.on,
            'resultstext');
        break;
    }

    //bad Cable Test
    switch (clientResults.bad_cable) {
    case CABLE_STATUS_OK:
        writeToScreen(displayMessages.cablesOk, 'resultstext');
        break;
    case CABLE_STATUS_NOK:
        writeToScreen(displayMessages.cablesNok, 'resultstext');
        break;
    default:
        break;
    }

    //Full Half Duplex
    switch (clientResults.half_duplex) {
    case "0":
        writeToScreen(displayMessages.linkFullDpx, 'resultstext');
        break;
    default:
        writeToScreen(displayMessages.linkHalfDpx, 'resultstext');
        break;
    }

    //Duplex Mismatch Condition
    switch (clientResults.mismatch) {
    case DUPLEX_OK_INDICATOR:
        writeToScreen(displayMessages.duplexOk, 'resultstext');
        break;
    case DUPLEX_NOK_INDICATOR:
        writeToScreen(displayMessages.duplexNok, 'resultstext');
        break;
    case DUPLEX_SWITCH_FULL_HOST_HALF:
        writeToScreen(displayMessages.duplexFullHalf, 'resultstext');
        break;
    case DUPLEX_SWITCH_HALF_HOST_FULL:
        writeToScreen(displayMessages.duplexHalfFull, 'resultstext');
        break;
    case DUPLEX_SWITCH_FULL_HOST_HALF_POSS:
        writeToScreen(displayMessages.possibleDuplexFullHalf, 'resultstext');
        break;
    case DUPLEX_SWITCH_HALF_HOST_FULL_POSS:
        writeToScreen(displayMessages.possibleDuplexHalfFull, 'resultstext');
        break;
    case DUPLEX_SWITCH_HALF_HOST_FULL_WARN:
        writeToScreen(displayMessages.possibleDuplexHalfFullWarning,
            'resultstext');
        break;
    default:
        writeToScreen("Non valid duplex indicator", 'resultstext');
        break;
    }

    //Congestion
    switch (clientResults.congestion) {
    case "0":
        writeToScreen(displayMessages.congestNo, 'resultstext');
        break;
    default:
        writeToScreen(displayMessages.congestYes, 'resultstext');
        break;
    }

    //Average Round Trip Time
    writeToScreen(displayMessages.web100rtt + " = " + clientResults.avgrtt +
        " ms", 'resultstext');
    //PacketSize
    writeToScreen(displayMessages.packetsize + " = " + clientResults.CurMSS +
        " bytes", 'resultstext');

    //Bottleneck
    // 1) Is the connection receiver limited?

    if (clientResults.rwintime > SND_LIM_TIME_THRESHOLD) {
        writeToScreen(displayMessages.thisConnIs + " " + displayMessages.limitRx +
            " " + parseFloat(clientResults.rwintime * 100).toFixed(2) +
            " " + displayMessages.pctOfTime, 'resultstext');

        // Multiplying by 2 to count round-trip.
        var receiverLimit = (2 * clientResults.rwin / clientResults.rttsec);
        var idealReceiverBuffer = (clientResults.MaxRwinRcvd / KBITS2BITS);
        if (receiverLimit < clientResults.linkSpd) {
            writeToScreen(displayMessages.incrRxBuf + " (" +
                idealReceiverBuffer.toFixed(2) + " KB)" +
                displayMessages.willImprove, 'resultstext');
        }
    }
    // 2) Is the connection sender limited?
    if (clientResults.sendtime > SND_LIM_TIME_THRESHOLD) {
        writeToScreen(displayMessages.thisConnIs + " " + displayMessages.limitTx +
            " " + parseFloat(clientResults.sendtime * 100).toFixed(2) +
            " " + displayMessages.pctOfTime, 'resultstext');

        // Dividing by 2 to counter round-trip.
        var senderLimit = (2 * clientResults.swin / clientResults.rttsec);
        var idealSenderBuffer = (clientResults.Sndbuf / (2 * KBITS2BITS));

        if (senderLimit < clientResults.linkSpeed)
            writeToScreen(displayMessages.incrRxBuf + " (" +
                idealSenderBuffer.toFixed(2) + " KB)" + displayMessages.willImprove,
                'resultstext');
    }
    // 3) Is the connection network limited?

    if (clientResults.cwndtime > CWND_LIM_TIME_THRESHOLD) {
        writeToScreen(displayMessages.thisConnIs + " " + displayMessages.limitNet +
            " " + parseFloat(clientResults.cwndtime * 100).toFixed(2) +
            " " + displayMessages.pctOfTime, 'resultstext');
    }
    // 4) Is the loss excessive?
    // If the link speed is less than a T3 ~ 45 MB/s, and loss is greater than 1 percent, loss is determined to be excessive.
    if ((clientResults.spd < 45) && (clientResults.loss > LOSS_THRESHOLD)) {
        writeToScreen(displayMessages.excLoss, 'resultstext');
    }

    //Packet Retransmissions Results
    if (clientResults.PktsRetrans > 0) {
        writeToScreen(clientResults.PktsRetrans + " " + displayMessages.pktsRetrans,
            'resultstext');
        writeToScreen(clientResults.DupAcksIn + " " + displayMessages.dupAcksIn,
            'resultstext');
        writeToScreen(clientResults.SACKsRcvd + " " + displayMessages.sackReceived,
            'resultstext');

        if (clientResults.Timeouts > 0) {
            writeToScreen(clientResults.connStalled + " " + clientResults.Timeouts +
                " " + displayMessages.timesPktLoss, 'resultstext');
        }
        var percIdleTime = (clientResults.waitsec / clientResults.timesec *
            100);
        writeToScreen(displayMessages.connIdle + " " + parseFloat(
                clientResults.waitsec).toFixed(2) + " " +
            displayMessages.seconds + " (" + parseFloat(percIdleTime).toFixed(
                2) + ") " + displayMessages.pctOfTime, 'resultstext');
    } else if (clientResults.DupAcksIn > 0) {
        // No packet loss, but packets arrived out-of-order.
        var percOrder = (clientResults.order * 100);
        writeToScreen(displayMessages.noPktLoss1 + " - " + displayMessages.ooOrder +
            " " + parseFloat(percOrder).toFixed(2) + displayMessages.pctOfTime,
            'resultstext');

    } else {
        // No packet retransmissions found.
        writeToScreen(displayMessages.noPktLoss2, 'resultstext');
    }

    //Packet Queuing Results
    // Add packet queueing details found during C2S throughput test.
    if (clientResults.clientDerivedUploadSpd > clientResults.serverDerivedUploadSpd) {
        var c2sQueue = (clientResults.clientDerivedUploadSpd -
            clientResults.serverDerivedUploadSpd) / clientResults.clientDerivedUploadSpd;
        writeToScreen(displayMessages.c2s + " " + displayMessages.qSeen +
            ": " + parseFloat(c2sQueue * 100).toFixed(2) + "%",
            'resultstext');
    }

    // Add packet queueing details found during S2C throughput test.
    //server send data as mb/s and client stores data in kb/s  it Must be converted before a comparison is possible
    if (clientResults.spd > (clientResults.clientDerivedDownloadSpd / 1000)) {
        var s2cQueue = (clientResults.spd - (clientResults.clientDerivedDownloadSpd /
            1000)) / clientResults.spd;
        writeToScreen(displayMessages.s2c + " " + displayMessages.qSeen +
            ": " + parseFloat(s2cQueue * 100).toFixed(2) + "%",
            'resultstext');
    }

    // Max rcvd window size lesser than TCP's max value, so no scaling requested.
    if (clientResults.MaxRwinRcvd < TCP_MAX_RECV_WIN_SIZE || clientResults.WinScaleRcvd >
        TCP_MAX_WINSCALERCVD) {
        writeToScreen("RFC 1323 Window Scaling:" + displayMessages.off,
            'resultstext');
    } else {
        writeToScreen("RFC 1323 Window Scaling:" + displayMessages.on +
            "; " + displayMessages.scalingFactors + " - " +
            displayMessages.server + "=" + clientResults.WinScaleRcvd +
            ", " + displayMessages.client + "=" + clientResults.WinScaleSent,
            'resultstext');
    }

    //Throughput Limiting Results

    // 1) Theoretical network limit.
    writeToScreen(displayMessages.theoreticalLimit + " " + parseFloat(
        clientResults.bw).toFixed(2) + " Mbps", 'resultstext');

    // 2) NDT server buffer imposed limit.
    // Divide by 2 to counter round-trip.
    var ndtServerBuffer = (clientResults.Sndbuf / (2 * KBITS2BITS));
    var ndtServerLimit = (clientResults.swin / clientResults.rttsec);
    writeToScreen(displayMessages.ndtServerHas + " " + parseFloat(
            ndtServerBuffer).toFixed(2) + " " + displayMessages.kbyteBufferLimits +
        " " + parseFloat(ndtServerLimit).toFixed(2) + " Mbps",
        'resultstext');

    // PC buffer imposed throughput limit.
    var pcReceiverBuffer = (clientResults.MaxRwinRcvd / KBITS2BITS);
    var pcLimit = (clientResults.rwin / clientResults.rttsec);
    writeToScreen(displayMessages.yourPcHas + " " + parseFloat(
            pcReceiverBuffer).toFixed(2) + " " + displayMessages.kbyteBufferLimits +
        " " + parseFloat(pcLimit).toFixed(2) + " Mbps", 'resultstext');

    // Network based flow control limit imposed throughput limit.
    var networkLimit = (clientResults.cwin / clientResults.rttsec);
    writeToScreen(displayMessages.flowControlLimits + " " + parseFloat(
        networkLimit).toFixed(2) + " Mbps", 'resultstext');

    // Client and server data reports on link capacity.
    if (clientResults.c2sData != null) {
        writeToScreen(displayMessages.clientDataReports, 'resultstext');
        displayDetectedLineSpeed(clientResults.c2sData);
    }
    if (clientResults.c2sAck != null) {
        writeToScreen(displayMessages.clientAcksReport, 'resultstext');
        displayDetectedLineSpeed(clientResults.c2sAck);
    }
    if (clientResults.s2cData != null) {
        writeToScreen(displayMessages.serverDataReports, 'resultstext');
        displayDetectedLineSpeed(clientResults.s2cData);
    }
    if (clientResults.s2cAck != null) {
        writeToScreen(displayMessages.serverAcksReport, 'resultstext');
        displayDetectedLineSpeed(clientResults.s2cAck);
    }

}

/**
 * Description Parse data and store results to the  matching web100 variables 
 * for later processing
 * @method getResults
 * @param {} data Raw data(String) from the message stream
 * @return 
 */
function getResults(data) {

    //split message data into an array for easier searching and value assignment
    var resultArray = data.split(/[ ,\n]+/);
    var resultOffset = null;

    for (resultOffset = 0; resultOffset < resultArray.length; resultOffset++) {
        //find the occurence of the string and set the corresponding value in the object
        if (resultArray[resultOffset].indexOf("CurMSS") > -1) {
            clientResults.CurMSS = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("X_Rcvbuf") > -1) {
            clientResults.X_Rcvbuf = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("X_Sndbuf") > -1) {
            clientResults.X_Sndbuf = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("AckPktsIn") > -1) {
            clientResults.AckPktsIn = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("AckPktsOut") > -1) {
            clientResults.AckPktsOut = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("BytesRetrans") > -1) {
            clientResults.BytesRetrans = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("CongAvoid") > -1) {
            clientResults.CongAvoid = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("CongestionOverCount") > -1) {
            clientResults.CongestionOverCount = resultArray[resultOffset +
                1];
        }
        if (resultArray[resultOffset].indexOf("CongestionSignals") > -1) {
            clientResults.CongestionSignals = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("CountRTT") > -1) {
            clientResults.CountRTT = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("CurCwnd") > -1) {
            clientResults.CurCwnd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("CurRTO") > -1) {
            clientResults.CurRTO = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("CurRwinRcvd") > -1) {
            clientResults.CurRwinRcvd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("CurRwinSent") > -1) {
            clientResults.CurRwinSent = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("CurSsthresh") > -1) {
            clientResults.CurSsthresh = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("DSACKDups") > -1) {
            clientResults.DSACKDups = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("DataBytesIn") > -1) {
            clientResults.DataBytesIn = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("DataBytesOut") > -1) {
            clientResults.DataBytesOut = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("DataPktsIn") > -1) {
            clientResults.DataPktsIn = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("DataPktsOut") > -1) {
            clientResults.DataPktsOut = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("DupAcksIn") > -1) {
            clientResults.DupAcksIn = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("ECNEnabled") > -1) {
            clientResults.ECNEnabled = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("FastRetran") > -1) {
            clientResults.FastRetran = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MaxCwnd") > -1) {
            clientResults.MaxCwnd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MaxMSS") > -1) {
            clientResults.MaxMSS = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MaxRTO") > -1) {
            clientResults.MaxRTO = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MaxRTT") > -1) {
            clientResults.MaxRTT = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MaxRwinRcvd") > -1) {
            clientResults.MaxRwinRcvd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MaxRwinSent") > -1) {
            clientResults.MaxRwinSent = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MaxSsthresh") > -1) {
            clientResults.MaxSsthresh = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MinMSS") > -1) {
            clientResults.MinMSS = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MinRTO") > -1) {
            clientResults.MinRTO = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MinRTT") > -1) {
            clientResults.MinRTT = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MinRwinRcvd") > -1) {
            clientResults.MinRwinRcvd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("MinRwinSent") > -1) {
            clientResults.MinRwinSent = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("NagleEnabled") > -1) {
            clientResults.NagleEnabled = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("OtherReductions") > -1) {
            clientResults.OtherReductions = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("PktsIn") > -1) {
            clientResults.PktsIn = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("PktsOut") > -1) {
            clientResults.PktsOut = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("PktsRetrans") > -1) {
            clientResults.PktsRetrans = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("RcvWinScale") > -1) {
            clientResults.RcvWinScale = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SACKEnabled") > -1) {
            clientResults.SACKEnabled = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SACKsRcvd") > -1) {
            clientResults.SACKsRcvd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SendStall") > -1) {
            clientResults.SendStall = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SlowStart") > -1) {
            clientResults.SlowStart = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SampleRTT") > -1) {
            clientResults.SampleRTT = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SmoothedRTT") > -1) {
            clientResults.SmoothedRTT = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SndWinScale") > -1) {
            clientResults.SndWinScale = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SndLimTimeRwin") > -1) {
            clientResults.SndLimTimeRwin = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SndLimTimeCwnd") > -1) {
            clientResults.SndLimTimeCwnd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SndLimTimeSender") > -1) {
            clientResults.SndLimTimeSender = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SndLimTransRwin") > -1) {
            clientResults.SndLimTransRwin = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SndLimTransCwnd") > -1) {
            clientResults.SndLimTransCwnd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SndLimTransSender") > -1) {
            clientResults.SndLimTransSender = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SndLimBytesRwin") > -1) {
            clientResults.SndLimBytesRwin = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SndLimBytesCwnd") > -1) {
            clientResults.SndLimBytesCwnd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("ndLimBytesSender") > -1) {
            clientResults.ndLimBytesSender = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SubsequentTimeouts") > -1) {
            clientResults.SubsequentTimeouts = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("SumRTT") > -1) {
            clientResults.SumRTT = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("Timeouts") > -1) {
            clientResults.Timeouts = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("TimestampsEnabled") > -1) {
            clientResults.TimestampsEnabled = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("WinScaleRcvd") > -1) {
            clientResults.WinScaleRcvd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("WinScaleSent") > -1) {
            clientResults.WinScaleSent = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("DupAcksOut") > -1) {
            clientResults.DupAcksOut = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("StartTimeUsec") > -1) {
            clientResults.StartTimeUsec = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("Duration") > -1) {
            clientResults.Duration = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("c2sData") > -1) {
            clientResults.c2sData = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("c2sAck") > -1) {
            clientResults.c2sAck = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("s2cData") > -1) {
            clientResults.s2cData = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("s2cAck") > -1) {
            clientResults.s2cAck = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("half_duplex") > -1) {
            clientResults.half_duplex = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("link") > -1) {
            clientResults.link = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("congestion") > -1) {
            clientResults.congestion = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("bad_cable") > -1) {
            clientResults.bad_cable = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("mismatch") > -1) {
            clientResults.mismatch = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("spd") > -1) {
            //due to variables aspd and spd containing the same substring. 
            //spd must be sent before aspd in order to map the value correctly
            //only assign if it has not been set.
            if (clientResults.spd == null) {
                clientResults.spd = resultArray[resultOffset + 1];
            }
        }
        if (resultArray[resultOffset].indexOf("bw") > -1) {
            clientResults.bw = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("loss") > -1) {
            clientResults.loss = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("avgrtt") > -1) {
            clientResults.avgrtt = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("waitsec") > -1) {
            clientResults.waitsec = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("timesec") > -1) {
            clientResults.timesec = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("order") > -1) {
            clientResults.order = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("rwintime") > -1) {
            clientResults.rwintime = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("sendtime") > -1) {
            clientResults.sendtime = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("cwndtime") > -1) {
            clientResults.cwndtime = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("rwin") > -1) {
            clientResults.rwin = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("swin") > -1) {
            clientResults.swin = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("cwin") > -1) {
            clientResults.cwin = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("rttsec") > -1) {
            clientResults.rttsec = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("Sndbuf") > -1) {
            clientResults.Sndbuf = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("aspd") > -1) {
            clientResults.aspd = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("CWND-Limited") > -1) {
            clientResults.CWND_Limited = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("minCWNDpeak") > -1) {
            clientResults.minCWNDpeak = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("maxCWNDpeak") > -1) {
            clientResults.maxCWNDpeak = resultArray[resultOffset + 1];
        }
        if (resultArray[resultOffset].indexOf("CWNDpeaks") > -1) {
            clientResults.CWNDpeaks = resultArray[resultOffset + 1];
        }

    }

}