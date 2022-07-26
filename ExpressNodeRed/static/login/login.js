$(function(){
    $('#login-form').on('submit', function(e){
        alertify.set('notifier','position', 'top-right');
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:8001/login',
            type: 'POST',
            data: $('#login-form').serialize(),
            success: function(data){
                //  alert('successfully submitted')
                alertify.set('notifier','position', 'top-right');
                alertify.notify('Invalid credentials', 'success', 5, function(){  console.log('dismissed'); });
                alertify.error('Error notification message.'); 
            },
            error: function(data){
                alertify.error(data.statusText + ": " + data.responseText    , 'error', 5); 
            }            
        });
    });
});