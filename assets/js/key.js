$(document).ready(() => {
    for (let i = 0; i <= maxAge; i++) {
        var color = gradientColor(youngestColor, eldestColor, i / maxAge);
        $('.key-content').append(
            $('<span></span>').addClass('key-element')
                .append($('<div></div>').addClass('key-color').css('background-color', color))
                .append($('<div></div>').addClass('key-number').text(i))
        );
    }
});