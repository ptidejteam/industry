$(function(){
    $('#login-form').on('submit', function(e){
        alertify.set('notifier','position', 'top-right');
        e.preventDefault();
        $.ajax({
            url: 'http://localhost:8000/login',
            type: 'POST',
            data: $('#login-form').serialize(),
            success: function(data){
                location.href = "/profile/" + $('#username').val();
            },
            error: function(data){
                if (data.status === 401) { alertify.error(data.statusText + ": Invalid credentials", 'error', 5 )};
            }            
        });
    });
});