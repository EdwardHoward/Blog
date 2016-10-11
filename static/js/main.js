function surroundWith(elem, text){
    var val = elem.value;
    var ret = val.substring(0, elem.selectionStart) + text + val.substring(elem.selectionStart, elem.selectionEnd) + text + val.substring(elem.selectionEnd, val.length);
    
    elem.value = ret;
}
