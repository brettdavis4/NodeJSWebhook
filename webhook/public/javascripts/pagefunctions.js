$(function () {
    $('#send_by_button').click(function (e) {
        e.preventDefault();
        
        //Testing Purproses
        console.log('The webhook button was clicked...');

        //an AJAX request with given parameters
        $.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: 'http://localhost:3000/createhook',

            //on success, received data is used as 'data' function input
            success: function () {
                console.log('Request sent; data received.');
            }
        });
    });
});