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
 * Description Create the testbuffer and fill it with no repeating ASCII codes. The testbuffer is sent 
 * to the NDT server during the C2S test. 
 * @method createTestBuffer
 * @param {} size Specifies the size of the testbuffer.
 * @return CallExpression String.fromCharCode creates a string from the ASCII codes in the array.
 */
function createTestBuffer(size) {
    var chars = new Array(size);
    var c = '33';
    // Ascii "0"
    for (var i = 0; i !== size; i++) {
        //Ascii "! to ~"
        if (c == '127') {
            c = '33';
        }
        chars[i] = c++;
    }
    return String.fromCharCode.apply(null, chars);
}

/**
 * Description Takes an input string and writes it to html.
 * @method writeToScreen
 * @param {} message String to be written
 * @param {} id location to write it to
 * @return 
 */
function writeToScreen(message, id) {
    var pre = document.createElement("p");
    pre.style.wordWrap = "break-word";
    pre.innerHTML = message;
    document.getElementById(id).appendChild(pre);
}

/**
 * Description Remove n number of characters at the beginning of a string
 * @method removeFirstNChars
 * @param {} str
 * @param {} n
 * @return CallExpression
 */
function removeFirstNChars(str, n) {
    return str.slice(n);
}

/**
 * Description - utility functions to convert between array buffers and strings
 * @method stringToArrayBuffer
 * @param {} string
 * @return buffer
 */
function stringToArrayBuffer(string) {
    var buffer = new ArrayBuffer(string.length);
    var bufView = new Uint8Array(buffer);
    for (var i = 0; i < string.length; i++) {
        bufView[i] = string.charCodeAt(i);
    }
    return buffer;
}

/**
 * Description - utility functions to convert between array buffers and strings
 * @method arrayBufferToString
 * @param {} buffer
 * @return CallExpression
 */
function arrayBufferToString(buffer) {
    return String.fromCharCode.apply(null, new Uint8Array(buffer));
}