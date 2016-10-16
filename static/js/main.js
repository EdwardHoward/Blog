(function(){
    
    var removeButtons = document.getElementsByClassName("remove-post");
    for(var i = 0; i < removeButtons.length; i++){
        removeButtons[i].addEventListener('click', function(e){
            if(!confirm("Are you sure you want to delete this post?")){
                e.preventDefault();
            }
        });
    }


    function surroundWith(elem, text){
        var val = elem.value;
        var ret = val.substring(0, elem.selectionStart) + text + val.substring(elem.selectionStart, elem.selectionEnd) + text + val.substring(elem.selectionEnd, val.length);
        
        elem.value = ret;
    }
})();