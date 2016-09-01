const $ = require('jquery');
const jQuery = require('jquery');
window.$ = $;
window.jQuery = jQuery;
const bootstrap = require('bootstrap');
require('babel-polyfill');

$(function() {
    const isSlidesMode = window.location.href.indexOf('?slides') > -1;

    const renderLinks = (links) => {
        // last added, first shown
        links = links.reverse();

        if (isSlidesMode) {
            links.sort(() => {
                return .5 - Math.random();
            });
        }

        const getLinkHtml = ({url, description, title, shot}) => {
            return `
                <div class="col-xs-6 col-md-3">
                    <a href="${url}" class="thumbnail" data-toggle="tooltip" data-placement="top" title="${description || title}">
                        <img src="/images/shots/${shot}">
                    </a>
                    <div class="caption">
                        <h5>${title}</h5>
                    </div>
                </div>
            `;
        }

        $('.container .row').append(links.map(getLinkHtml));

        $('.search-query').on('keyup', (event) => {
            let value = event.target.value.toLowerCase();

            if (13 == event.keyCode) {
                if ('' === value) {
                    return;
                }
                let firstElement = $('.row > div:visible').get(0);
                if (firstElement) {
                    $(firstElement).children('a').get(0).click();
                }
                return;
            }
            $.each(links, (index, item) => {
                let text = item.title + ' ' + item.url + ' ' + item.description;
                let toggle = (text.toLowerCase().indexOf(value) < 0 ? 'hide' : 'show');
                let currentElement = $($('.row > div').get(index));
                currentElement[toggle]();
            });
        });

        $('[data-toggle="tooltip"]').tooltip();
        $('.search-query').focus();

        if ($('body').hasClass('slides')) {
            $(".slides").append('<div class="slides-filter"></div>');
            (function slide() {
                links.forEach((link, i) => {
                    $('.container .row').animate({ top: '-' + (i * 100) + 'vh' }, 0, 'linear').fadeIn(1000).delay(8000).fadeOut(1000);
                    $('.slides-filter').fadeIn(1000).delay(8000).fadeOut(1000);
                });
                $('.container .row').animate({ top: '0' }, '0', 'linear', slide);
            })();
        }
    };

    if (isSlidesMode) {
        $('body').addClass('slides');
    }

    $.getJSON('/js/links.json')
        .done((data) => {
            renderLinks(data.links);
        })
        .fail(() => {
            $.getJSON('/js/links.example.json')
                .done((data) => {
                    renderLinks(data.links);
                });
        });
}());
