$(document).ready(() => {
    $('.add-topic').click(() => {
        // show modal on click
        $('.modal-container').css('display', 'block');
    });
    $('.modal-button').click(() => {
        // hide modal on click
        $('.modal-container').css('display', 'none');
    });
    $('.close-img').click(() => {
        // hide modal on click
        $('.modal-container').css('display', 'none');
    });
});