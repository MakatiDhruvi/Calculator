// function to get written character count
function getCharacterOffsetWithin(range, node) {
    var treeWalker = document.createTreeWalker(
        node,
        NodeFilter.SHOW_TEXT,
        function (node) {
            var nodeRange = document.createRange();
            nodeRange.selectNodeContents(node);
            return nodeRange.compareBoundaryPoints(Range.END_TO_END, range) < 1 ?
                NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
        },
        false
    );

    var charCount = 0;
    while (treeWalker.nextNode()) {
        charCount += treeWalker.currentNode.length;
    }
    if (range.startContainer.nodeType == 3) {
        charCount += range.startOffset;
    }
    return charCount;
}
// function to set a cursor position
function setCursor(pos) {
    var tag = document.getElementById("result");
    var setpos = document.createRange();
    var set = window.getSelection();
    setpos.setStart(tag.childNodes[0], pos);
    setpos.collapse(true);
    set.removeAllRanges();
    set.addRange(setpos);
    tag.focus();
}
var position;
var stack = [];
var stackIndex = 0;

$(document).ready(function () {
    // this function returns placeholder
    $("#result").focusout(function () {
        var element = $(this);
        if (!element.text().replace(" ", "").length) {
            element.empty();
        }
    });
    // function to get cursor position
    $("td, #result").on("mousedown keydown", function () {
        try {
            var el = document.getElementById("result");
            var range = window.getSelection().getRangeAt(0);
            position = getCharacterOffsetWithin(range, el);
        }
        catch (ex) {
            position = $("#result").html().length;
        }
    });
    
    $("td").click(function () {
        // check button is clickable 
        if ($(this).children("#result").length == 0 && !$(this).hasClass("disable")) {
            var result = $("#result");
            var value = result[0].innerHTML;
            var clicked = "";
            if (this.id == "") {
                clicked = this.innerText;
            }
            else {
                clicked = this.id;
            }
            var DEG = $("#DEG")[0];
            if (clicked == "DEG") {
                if (DEG.innerText == "RAD") {
                    DEG.innerHTML = "<b>DEG</b>";
                }
                else if (DEG.innerText == "DEG") {
                    DEG.innerHTML = "<b>RAD</b>";
                }
                return;
            }
            var exceptional = ["=", "C", "X", "MS", "MC", "MR", "M+", "M-"];
            // clicked button is accessed or not
            if (exceptional.indexOf(clicked) == -1) {
                if (position != 0 && position != null && position.toString() != "NaN") {
                    if (position == result.html().length) {
                        value += clicked;
                    }
                    else {
                        value = [value.slice(0, position), clicked, value.slice(position)].join('');
                    }
                }
                else {
                    value = [value.slice(0, position), clicked, value.slice(position)].join('');
                }
                result[0].innerHTML = value;
                try {
                    setCursor(position + clicked.length);
                }
                catch (ex) {

                }
                position = position + clicked.length;
                $("#result")[0].scrollLeft = $("#result")[0].scrollWidth
            }
            else {
                switch (clicked) {
                    case "C":
                        // C is used to clear the calculation
                        result.html("");
                        break;
                    case "X":
                        // X is used as backspace
                        var resultValue = result.html();
                        if (position != 0 && position != null && position.toString() != "NaN") {
                            if (position == result.html().length + 1) {
                                result.html(resultValue.slice(0, -1));
                            }
                            else {
                                result.html(resultValue.slice(0, position - 1) + resultValue.slice(position));
                                try {
                                    setCursor(position - 1);
                                }
                                catch (ex) {
                                }
                            }
                            position--;
                        }
                        else {
                            result.html(resultValue.slice(0, -1));
                        }
                        break;
                    case "=":
                        // = is used for calculation
                        result.html(result.html().replace("π", "3.14159"));
                        result.html(math.evaluate(result.html()));
                        break;
                    case "MS":
                        // MS is used to store memory
                        result.html(math.evaluate(result.html()));
                        var resultValue = result.html();
                        if ($.isNumeric(resultValue)) {
                            stack.push(resultValue);
                            $(".disable").removeClass("disable");
                            result.html("");
                        }
                        break;
                    case "MC":
                        // MC is used for clear the memory which is stored in MS
                        result.html("");
                        stack = [];
                        $("#MC, #MR").addClass("disable");
                        break;
                    case "MR":
                        // MR is used as memory recall
                        if (stackIndex == stack.length) {
                            stackIndex = 0;
                        }
                        result.html(stack[stackIndex++]);
                        break;
                    case "M+":
                        // M+ is used to peform the addition with last digit that we stored in memory
                        result.html(math.evaluate(result.html() + "+" + stack[stack.length - 1]));
                        break;
                    case "M-":
                        // M- is used to peform the subtraction with last digit that we sored in memory
                        result.html(math.evaluate(result.html() + "-" + stack[stack.length - 1]));
                        break;
                }
            }
            // it will convert degree to radian 
            if (DEG.innerText == "RAD") {
                if ($.isNumeric(result.html())) {
                    result.html(result.html() / 180);
                }
            }
        }
    });
});